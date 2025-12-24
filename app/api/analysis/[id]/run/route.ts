import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { inngest } from '@/lib/inngest'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: analysisId } = await params

    // Verify analysis exists and has transcript
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      include: {
        video: {
          include: {
            transcript: true,
          },
        },
      },
    })

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    if (!analysis.video.transcript) {
      return NextResponse.json(
        { error: 'Transcript required before analysis' },
        { status: 400 }
      )
    }

    if (analysis.status === 'RUNNING') {
      return NextResponse.json(
        { error: 'Analysis already running' },
        { status: 400 }
      )
    }

    // Trigger Inngest event
    await inngest.send({
      name: 'video/analyze',
      data: {
        analysisId,
      },
    })

    // Update status to RUNNING
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { status: 'RUNNING' },
    })

    return NextResponse.json({ success: true, analysisId })
  } catch (error) {
    console.error('Error starting analysis:', error)
    return NextResponse.json(
      { error: 'Failed to start analysis' },
      { status: 500 }
    )
  }
}
