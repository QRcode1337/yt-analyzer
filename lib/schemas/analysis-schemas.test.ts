import { describe, it, expect } from 'vitest'
import {
  HeroJourneyBeatSchema,
  HeroJourneySchema,
  EmotionDecoderSchema,
  TitleDecodeSchema,
  ThumbnailXRaySchema,
  MoneyShotsSchema,
  ContentHighlightsSchema,
  FullArticleSchema,
  OverviewSchema,
} from './analysis-schemas'

describe('Analysis Schemas', () => {
  describe('HeroJourneyBeatSchema', () => {
    it('should validate a valid beat', () => {
      const validBeat = {
        number: 1,
        title: 'The Hook',
        description: 'Opening scene that grabs attention',
        timeRange: {
          start: '00:00',
          end: '00:30',
        },
      }

      const result = HeroJourneyBeatSchema.safeParse(validBeat)
      expect(result.success).toBe(true)
    })

    it('should reject beat with invalid number', () => {
      const invalidBeat = {
        number: 0, // Must be >= 1
        title: 'The Hook',
        description: 'Opening scene',
        timeRange: {
          start: '00:00',
          end: '00:30',
        },
      }

      const result = HeroJourneyBeatSchema.safeParse(invalidBeat)
      expect(result.success).toBe(false)
    })

    it('should accept optional fields', () => {
      const beatWithOptionals = {
        number: 1,
        title: 'The Hook',
        subtitle: 'The beginning',
        description: 'Opening scene',
        timeRange: {
          start: '00:00',
          end: '00:30',
        },
        bullets: ['Point 1', 'Point 2'],
        icon: '🎬',
      }

      const result = HeroJourneyBeatSchema.safeParse(beatWithOptionals)
      expect(result.success).toBe(true)
    })
  })

  describe('HeroJourneySchema', () => {
    it('should validate exactly 6 beats', () => {
      const validJourney = {
        beats: Array.from({ length: 6 }, (_, i) => ({
          number: i + 1,
          title: `Beat ${i + 1}`,
          description: 'Description',
          timeRange: {
            start: '00:00',
            end: '00:30',
          },
        })),
      }

      const result = HeroJourneySchema.safeParse(validJourney)
      expect(result.success).toBe(true)
    })

    it('should reject less than 6 beats', () => {
      const invalidJourney = {
        beats: Array.from({ length: 5 }, (_, i) => ({
          number: i + 1,
          title: `Beat ${i + 1}`,
          description: 'Description',
          timeRange: {
            start: '00:00',
            end: '00:30',
          },
        })),
      }

      const result = HeroJourneySchema.safeParse(invalidJourney)
      expect(result.success).toBe(false)
    })
  })

  describe('TitleDecodeSchema', () => {
    it('should validate a valid title decode', () => {
      const validTitleDecode = {
        corePattern: 'Problem → Solution',
        formula: '{Subject} is the {Metaphor} to {Problem}',
        explanation: 'This pattern works because...',
        seoScore: 85,
      }

      const result = TitleDecodeSchema.safeParse(validTitleDecode)
      expect(result.success).toBe(true)
    })

    it('should enforce SEO score range', () => {
      const invalidScore = {
        corePattern: 'Pattern',
        formula: 'Formula',
        explanation: 'Explanation',
        seoScore: 150, // Must be 0-100
      }

      const result = TitleDecodeSchema.safeParse(invalidScore)
      expect(result.success).toBe(false)
    })
  })

  describe('MoneyShotsSchema', () => {
    it('should validate complete money shots data', () => {
      const validMoneyShots = {
        estimatedRevenue: {
          amount: 5000,
          currency: 'USD',
        },
        cpm: {
          range: {
            min: 5,
            max: 15,
          },
          category: 'Education',
        },
        breakpoints: [
          {
            timestamp: '03:55',
            type: 'Case Study Shift',
            description: 'Transition point',
          },
        ],
      }

      const result = MoneyShotsSchema.safeParse(validMoneyShots)
      expect(result.success).toBe(true)
    })
  })

  describe('EmotionDecoderSchema', () => {
    it('should validate emotion decoder with pillars', () => {
      const validEmotion = {
        coreShift: {
          from: 'Confused',
          to: 'Enlightened',
        },
        pillars: [
          {
            title: 'Initial Confusion',
            description: 'The setup',
          },
        ],
      }

      const result = EmotionDecoderSchema.safeParse(validEmotion)
      expect(result.success).toBe(true)
    })

    it('should require at least one pillar', () => {
      const invalidEmotion = {
        coreShift: {
          from: 'Confused',
          to: 'Enlightened',
        },
        pillars: [], // Must have at least 1
      }

      const result = EmotionDecoderSchema.safeParse(invalidEmotion)
      expect(result.success).toBe(false)
    })
  })
})
