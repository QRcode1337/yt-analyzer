import { z } from 'zod'

// Hero's Journey Schema - 6 beats
export const HeroJourneyBeatSchema = z.object({
  number: z.number().int().min(1).max(6),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string(),
  timeRange: z.object({
    start: z.string(), // "00:00"
    end: z.string(), // "00:40"
  }),
  bullets: z.array(z.string()).optional(),
  icon: z.string().optional(), // emoji or icon identifier
})

export const HeroJourneySchema = z.object({
  beats: z.array(HeroJourneyBeatSchema).length(6),
  summary: z.string().optional(),
})

// Emotion Rollercoaster Schema
export const EmotionPillarSchema = z.object({
  title: z.string(),
  description: z.string(),
  timeRange: z
    .object({
      start: z.string(),
      end: z.string(),
    })
    .optional(),
  icon: z.string().optional(),
})

export const EmotionDecoderSchema = z.object({
  coreShift: z.object({
    from: z.string(),
    to: z.string(),
  }),
  description: z.string().optional(),
  pillars: z.array(EmotionPillarSchema).min(1),
})

// Title Decode Schema
export const TitleDecodeSchema = z.object({
  corePattern: z.string(),
  formula: z.string(), // e.g., "{Complex_Subject} is the {Shortcut_Metaphor} to {Universal_Problem}"
  explanation: z.string(),
  keywords: z.array(z.string()).optional(),
  remixes: z.array(z.string()).optional(), // example variations
  seoScore: z.number().int().min(0).max(100),
  seoAnalysis: z.string().optional(),
  badge: z.string().optional(), // "High Impact", etc.
})

// Thumbnail X-Ray Schema
export const ThumbnailXRaySchema = z.object({
  composition: z.string(), // e.g., "Surreal Avatar + Complexity Background"
  description: z.string(),
  elements: z.array(z.string()), // visual elements
  promise: z.string(), // what the thumbnail promises
  emotionalImpact: z.string().optional(),
  improvements: z.array(z.string()).optional(),
  badge: z.string().optional(), // "Information-complementary", etc.
  layout: z.string().optional(), // "Centered", etc.
  hasText: z.boolean().optional(),
})

// Money Shots Schema
export const MoneyShotsBreakpointSchema = z.object({
  timestamp: z.string(), // "03:55"
  type: z.string(), // "Case Study Shift", "Section Break", "Topic Transition"
  quote: z.string().optional(),
  description: z.string().optional(),
})

export const MoneyShotsPlacementSchema = z.object({
  timestamp: z.string(),
  content: z.string(),
  description: z.string(),
  insight: z.string().optional(),
  tag: z.string().optional(), // "RECOMMENDATION SCENE", "SOLUTION SCENE"
})

export const MoneyShotsSchema = z.object({
  estimatedRevenue: z.object({
    amount: z.number(),
    currency: z.string().default('USD'),
    description: z.string().optional(),
  }),
  cpm: z.object({
    range: z.object({
      min: z.number(),
      max: z.number(),
    }),
    category: z.string(), // "Education", "Entertainment", etc.
    description: z.string().optional(),
  }),
  breakpoints: z.array(MoneyShotsBreakpointSchema),
  placements: z.array(MoneyShotsPlacementSchema).optional(),
  sponsorMagnetism: z
    .object({
      audienceSignals: z.array(z.string()).optional(),
      authorityCredentials: z.array(z.string()).optional(),
      verticalDepth: z.array(z.string()).optional(),
    })
    .optional(),
  longTermValue: z
    .object({
      evergreenLeverage: z.string().optional(),
      seriesPotential: z.string().optional(),
      quotableInsight: z.string().optional(),
    })
    .optional(),
  revenueProjections: z
    .array(
      z.object({
        type: z.string(), // "60-SECOND MENTION", "DEDICATED COLLABORATION"
        range: z.object({
          min: z.number(),
          max: z.number(),
        }),
        description: z.string().optional(),
      })
    )
    .optional(),
})

// Content Highlights Schema
export const ContentHighlightSchema = z.object({
  timestamp: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.string().optional(), // "Key Moment", "Quote", etc.
})

export const ContentHighlightsSchema = z.object({
  highlights: z.array(ContentHighlightSchema),
})

// Full Article Schema
export const FullArticleSchema = z.object({
  markdown: z.string(),
  sections: z
    .array(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    )
    .optional(),
})

// Overview Schema (combines Title Decode + Thumbnail X-Ray + Hero's Journey summary)
export const OverviewSchema = z.object({
  titleDecode: TitleDecodeSchema,
  thumbnailXRay: ThumbnailXRaySchema,
  herosJourneySummary: z
    .object({
      keyPhrase: z.string().optional(),
      timeMarker: z.string().optional(),
      beats: z.array(z.string()).length(6).optional(), // just titles
    })
    .optional(),
})

// Union type for all section types
export type HeroJourney = z.infer<typeof HeroJourneySchema>
export type EmotionDecoder = z.infer<typeof EmotionDecoderSchema>
export type TitleDecode = z.infer<typeof TitleDecodeSchema>
export type ThumbnailXRay = z.infer<typeof ThumbnailXRaySchema>
export type MoneyShots = z.infer<typeof MoneyShotsSchema>
export type ContentHighlights = z.infer<typeof ContentHighlightsSchema>
export type FullArticle = z.infer<typeof FullArticleSchema>
export type Overview = z.infer<typeof OverviewSchema>

// Schema map for validation
export const sectionSchemas = {
  OVERVIEW: OverviewSchema,
  HEROS_JOURNEY: HeroJourneySchema,
  EMOTION_ROLLERCOASTER: EmotionDecoderSchema,
  MONEY_SHOTS: MoneyShotsSchema,
  TITLE_DECODE: TitleDecodeSchema,
  THUMBNAIL_XRAY: ThumbnailXRaySchema,
  CONTENT_HIGHLIGHTS: ContentHighlightsSchema,
  FULL_ARTICLE: FullArticleSchema,
} as const

export type SectionType = keyof typeof sectionSchemas

