import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'
import { extractYouTubeId, parseDuration } from '@/lib/utils/youtube'
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { inngest } from '@/lib/inngest'

export async function POST(request: NextRequest) {
  // Rate limiting: 5 requests per minute per IP
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimitResult = rateLimit(ip, { limit: 5, windowSec: 60 })

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    )
  }

  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Extract YouTube ID
    const youtubeId = extractYouTubeId(url)
    if (!youtubeId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    // Get YouTube API key
    const youtubeApiKey = process.env.YOUTUBE_API_KEY
    if (!youtubeApiKey) {
      return NextResponse.json(
        { error: 'YouTube API key not configured' },
        { status: 500 }
      )
    }

    // Check if video already exists
    const existingVideo = await prisma.video.findUnique({
      where: { youtubeId },
    })

    if (existingVideo) {
      // Find existing analysis or create new one
      const existingAnalysis = await prisma.analysis.findFirst({
        where: { videoId: existingVideo.id },
        orderBy: { createdAt: 'desc' },
      })

      // Only return existing analysis if it's not failed
      if (existingAnalysis && existingAnalysis.status !== 'FAILED') {
        return NextResponse.json({
          videoId: existingVideo.id,
          analysisId: existingAnalysis.id,
        })
      }

      const newAnalysis = await prisma.analysis.create({
        data: {
          videoId: existingVideo.id,
          status: 'PENDING',
        },
      })

      // Check if transcript exists
      const existingTranscript = await prisma.transcript.findUnique({
        where: { videoId: existingVideo.id },
      })

      if (existingTranscript) {
        // Transcript exists, trigger analysis immediately
        await inngest.send({
          name: 'video/analyze',
          data: {
            analysisId: newAnalysis.id,
          },
        })

        await prisma.analysis.update({
          where: { id: newAnalysis.id },
          data: { status: 'RUNNING' },
        })
      } else {
        // No transcript, trigger async extraction
        await inngest.send({
          name: 'video/extract-transcript',
          data: {
            videoId: existingVideo.id,
            youtubeId: existingVideo.youtubeId,
          },
        })
        console.log(`🚀 Triggered async transcript extraction for video ${existingVideo.id}`)
      }

      return NextResponse.json({
        videoId: existingVideo.id,
        analysisId: newAnalysis.id,
      })
    }

    // Fetch metadata from YouTube API
    const youtube = google.youtube({
      version: 'v3',
      auth: youtubeApiKey,
    })

    const response = await youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: [youtubeId],
    })

    if (!response.data.items || response.data.items.length === 0) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    const videoData = response.data.items[0]
    const snippet = videoData.snippet
    const contentDetails = videoData.contentDetails
    const statistics = videoData.statistics

    if (!snippet || !contentDetails) {
      return NextResponse.json(
        { error: 'Invalid video data' },
        { status: 500 }
      )
    }

    // Create video record
    const video = await prisma.video.create({
      data: {
        youtubeId,
        title: snippet.title || 'Untitled',
        channel: snippet.channelTitle || 'Unknown',
        thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
        duration: parseDuration(contentDetails.duration || 'PT0S'),
        viewCount: statistics?.viewCount ? parseInt(statistics.viewCount, 10) : null,
        likeCount: statistics?.likeCount ? parseInt(statistics.likeCount, 10) : null,
        commentCount: statistics?.commentCount
          ? parseInt(statistics.commentCount, 10)
          : null,
      },
    })

    // Create analysis record
    const analysis = await prisma.analysis.create({
      data: {
        videoId: video.id,
        status: 'PENDING',
      },
    })

    // Trigger async transcript extraction
    await inngest.send({
      name: 'video/extract-transcript',
      data: {
        videoId: video.id,
        youtubeId,
      },
    })
    console.log(`🚀 Triggered async transcript extraction for new video ${video.id}`)

    return NextResponse.json({
      videoId: video.id,
      analysisId: analysis.id,
    })
  } catch (error) {
    console.error('Error ingesting video:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to ingest video', details: message },
      { status: 500 }
    )
  }
}

