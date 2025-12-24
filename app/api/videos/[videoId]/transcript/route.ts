import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params
    const body = await request.json()
    const { text, source = 'manual' } = body

    if (!text) {
      return NextResponse.json({ error: 'Transcript text is required' }, { status: 400 })
    }

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Upsert transcript (update if exists, create if not)
    const transcript = await prisma.transcript.upsert({
      where: { videoId },
      update: {
        text,
        source,
      },
      create: {
        videoId,
        text,
        source,
      },
    })

    return NextResponse.json(transcript)
  } catch (error) {
    console.error('Error saving transcript:', error)
    return NextResponse.json(
      { error: 'Failed to save transcript' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params

    const transcript = await prisma.transcript.findUnique({
      where: { videoId },
    })

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript not found' }, { status: 404 })
    }

    return NextResponse.json(transcript)
  } catch (error) {
    console.error('Error fetching transcript:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transcript' },
      { status: 500 }
    )
  }
}

