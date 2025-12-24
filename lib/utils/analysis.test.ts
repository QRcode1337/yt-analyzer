import { describe, it, expect } from 'vitest'
import { createSectionsMap } from './analysis'

describe('Analysis Utilities', () => {
  describe('createSectionsMap', () => {
    it('should create a Map from sections array', () => {
      const sections = [
        { type: 'OVERVIEW', json: { test: 'data1' } },
        { type: 'HEROS_JOURNEY', json: { test: 'data2' } },
        { type: 'EMOTION_ROLLERCOASTER', json: { test: 'data3' } },
      ]

      const map = createSectionsMap(sections)

      expect(map.size).toBe(3)
      expect(map.get('OVERVIEW')).toEqual({ test: 'data1' })
      expect(map.get('HEROS_JOURNEY')).toEqual({ test: 'data2' })
      expect(map.get('EMOTION_ROLLERCOASTER')).toEqual({ test: 'data3' })
    })

    it('should handle empty array', () => {
      const sections: Array<{ type: string; json: any }> = []
      const map = createSectionsMap(sections)

      expect(map.size).toBe(0)
    })

    it('should allow retrieval by type', () => {
      const sections = [
        { type: 'TITLE_DECODE', json: { corePattern: 'test' } },
        { type: 'THUMBNAIL_XRAY', json: { composition: 'test' } },
      ]

      const map = createSectionsMap(sections)

      expect(map.has('TITLE_DECODE')).toBe(true)
      expect(map.has('THUMBNAIL_XRAY')).toBe(true)
      expect(map.has('MONEY_SHOTS')).toBe(false)
    })

    it('should handle sections with complex JSON data', () => {
      const sections = [
        {
          type: 'MONEY_SHOTS',
          json: {
            estimatedRevenue: { amount: 5000, currency: 'USD' },
            breakpoints: [{ timestamp: '03:55', type: 'Case Study' }],
          },
        },
      ]

      const map = createSectionsMap(sections)
      const moneyShots = map.get('MONEY_SHOTS') as any

      expect(moneyShots.estimatedRevenue.amount).toBe(5000)
      expect(moneyShots.breakpoints).toHaveLength(1)
    })
  })
})
