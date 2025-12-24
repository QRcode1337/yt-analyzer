import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { AnalysisPageClient } from './AnalysisPageClient'

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const analysis = await prisma.analysis.findUnique({
    where: { id },
    include: {
      video: {
        include: {
          transcript: true,
        },
      },
      sections: true,
    },
  })

  if (!analysis) {
    notFound()
  }

  return <AnalysisPageClient analysis={analysis} />
}

