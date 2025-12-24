import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import {
  type HeroJourney,
  type TitleDecode,
  type ThumbnailXRay,
  type EmotionDecoder,
  type MoneyShots,
} from '@/lib/schemas/analysis-schemas'
import { formatDuration } from '@/lib/utils'
import { createSectionsMap } from '@/lib/utils/analysis'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: {
        video: true,
        sections: {
          orderBy: { type: 'asc' },
        },
      },
    })

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    if (analysis.status !== 'DONE') {
      return NextResponse.json(
        { error: 'Analysis not complete' },
        { status: 400 }
      )
    }

    // Build sections map
    const sectionsMap = createSectionsMap(analysis.sections)

    // Extract data
    const heroJourney = sectionsMap.get('HEROS_JOURNEY') as HeroJourney | undefined
    const titleDecode = sectionsMap.get('TITLE_DECODE') as TitleDecode | undefined
    const thumbnailXRay = sectionsMap.get('THUMBNAIL_XRAY') as ThumbnailXRay | undefined
    const emotion = sectionsMap.get('EMOTION_ROLLERCOASTER') as EmotionDecoder | undefined
    const moneyShots = sectionsMap.get('MONEY_SHOTS') as MoneyShots | undefined

    // Generate blueprint
    const blueprint = generateBlueprint({
      video: analysis.video,
      heroJourney: heroJourney ?? undefined,
      titleDecode: titleDecode ?? undefined,
      thumbnailXRay: thumbnailXRay ?? undefined,
      emotion: emotion ?? undefined,
      moneyShots: moneyShots ?? undefined,
    })

    return new NextResponse(blueprint, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="episode-blueprint-${analysis.video.youtubeId}.md"`,
      },
    })
  } catch (error) {
    console.error('Error exporting blueprint:', error)
    return NextResponse.json(
      { error: 'Failed to export blueprint' },
      { status: 500 }
    )
  }
}

type VideoData = Prisma.VideoGetPayload<{}>

function generateBlueprint({
  video,
  heroJourney,
  titleDecode,
  thumbnailXRay,
  emotion,
  moneyShots,
}: {
  video: VideoData
  heroJourney?: HeroJourney
  titleDecode?: TitleDecode
  thumbnailXRay?: ThumbnailXRay
  emotion?: EmotionDecoder
  moneyShots?: MoneyShots
}): string {
  const lines: string[] = []

  lines.push('# Episode Blueprint')
  lines.push(`\n**Source Video:** ${video.title}`)
  lines.push(`**Channel:** ${video.channel}`)
  lines.push(`**Duration:** ${formatDuration(video.duration)}`)
  lines.push('')

  // Hook Script (0-30s)
  lines.push('## Hook Script (0-30s)')
  lines.push('')
  if (heroJourney?.beats?.[0]) {
    const firstBeat = heroJourney.beats[0]
    lines.push(`**Opening:** ${firstBeat.description}`)
    if (firstBeat.bullets && firstBeat.bullets.length > 0) {
      lines.push('')
      lines.push('Key points:')
      firstBeat.bullets.forEach((bullet: string) => {
        lines.push(`- ${bullet}`)
      })
    }
  } else {
    lines.push('*Hook to be developed based on first beat of Hero\'s Journey*')
  }
  lines.push('')
  lines.push('**Tone:** Curious, eerie, skeptical, funny')
  lines.push('')

  // Beat Map
  if (heroJourney?.beats) {
    lines.push('## Beat Map (6 Narrative Beats)')
    lines.push('')
    heroJourney.beats.forEach((beat, index) => {
      lines.push(`### ${index + 1}. ${beat.title}`)
      if (beat.subtitle) {
        lines.push(`*${beat.subtitle}*`)
      }
      lines.push('')
      lines.push(beat.description)
      if (beat.timeRange) {
        lines.push(`**Time:** ${beat.timeRange.start} - ${beat.timeRange.end}`)
      }
      if (beat.bullets && beat.bullets.length > 0) {
        lines.push('')
        lines.push('Why it works:')
        beat.bullets.forEach((bullet) => {
          lines.push(`- ${bullet}`)
        })
      }
      lines.push('')
    })
  }

  // Title Options
  if (titleDecode) {
    lines.push('## Title Options (A/B Tests)')
    lines.push('')
    lines.push(`**Core Pattern:** ${titleDecode.corePattern}`)
    lines.push(`**Formula:** ${titleDecode.formula}`)
    lines.push('')
    if (titleDecode.remixes && titleDecode.remixes.length > 0) {
      lines.push('Variations:')
      titleDecode.remixes.forEach((remix, index) => {
        lines.push(`${index + 1}. ${remix}`)
      })
    } else {
      lines.push('*Generate variations based on the core pattern*')
    }
    lines.push('')
  }

  // Thumbnail Concept Prompts
  if (thumbnailXRay) {
    lines.push('## Thumbnail Concept Prompts')
    lines.push('')
    lines.push(`**Composition:** ${thumbnailXRay.composition}`)
    lines.push(`**Promise:** ${thumbnailXRay.promise}`)
    lines.push('')
    if (thumbnailXRay.elements && thumbnailXRay.elements.length > 0) {
      lines.push('Visual Elements:')
      thumbnailXRay.elements.forEach((element) => {
        lines.push(`- ${element}`)
      })
      lines.push('')
    }
    if (thumbnailXRay.emotionalImpact) {
      lines.push(`**Emotional Impact:** ${thumbnailXRay.emotionalImpact}`)
      lines.push('')
    }
  }

  // CTA + Pinned Comment
  lines.push('## CTA & Engagement Strategy')
  lines.push('')
  if (moneyShots?.breakpoints && moneyShots.breakpoints.length > 0) {
    lines.push('**Natural Breakpoints for Engagement:**')
    moneyShots.breakpoints.forEach((bp) => {
      lines.push(`- @${bp.timestamp}: ${bp.type} - "${bp.quote || bp.description}"`)
    })
    lines.push('')
  }
  lines.push('**Pinned Comment Suggestion:**')
  lines.push('*Engage with the core insight or ask a thought-provoking question*')
  if (emotion?.coreShift) {
    lines.push(`*Reference the emotional journey: "${emotion.coreShift.from}" → "${emotion.coreShift.to}"*`)
  }
  lines.push('')

  // Additional Notes
  lines.push('## Additional Notes')
  lines.push('')
  lines.push('**Tone Guidelines:**')
  lines.push('- Curious: Ask questions that make viewers think')
  lines.push('- Eerie: Subtle unsettling moments that create intrigue')
  lines.push('- Skeptical: Challenge assumptions, question the obvious')
  lines.push('- Funny: Use dark humor and unexpected twists')
  lines.push('')
  if (moneyShots?.sponsorMagnetism) {
    lines.push('**Sponsor Appeal Factors:**')
    if (moneyShots.sponsorMagnetism.audienceSignals) {
      lines.push(`- Audience: ${moneyShots.sponsorMagnetism.audienceSignals.join(', ')}`)
    }
    if (moneyShots.sponsorMagnetism.authorityCredentials) {
      lines.push(`- Authority: ${moneyShots.sponsorMagnetism.authorityCredentials.join(', ')}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

