import { describe, it, expect } from 'vitest'
import { extractYouTubeId, parseDuration } from './youtube'

describe('YouTube utilities', () => {
  describe('extractYouTubeId', () => {
    it('should extract ID from youtube.com/watch?v=... format', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      const id = extractYouTubeId(url)
      expect(id).toBe('dQw4w9WgXcQ')
    })

    it('should extract ID from youtu.be/... format', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ'
      const id = extractYouTubeId(url)
      expect(id).toBe('dQw4w9WgXcQ')
    })

    it('should extract ID from youtube.com/embed/... format', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      const id = extractYouTubeId(url)
      expect(id).toBe('dQw4w9WgXcQ')
    })

    it('should handle URLs with additional query parameters', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s&feature=share'
      const id = extractYouTubeId(url)
      expect(id).toBe('dQw4w9WgXcQ')
    })

    it('should handle youtu.be with query parameters', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ?t=30'
      const id = extractYouTubeId(url)
      expect(id).toBe('dQw4w9WgXcQ')
    })

    it('should return null for invalid URLs', () => {
      const url = 'https://example.com/video'
      const id = extractYouTubeId(url)
      expect(id).toBeNull()
    })

    it('should return null for empty string', () => {
      const url = ''
      const id = extractYouTubeId(url)
      expect(id).toBeNull()
    })
  })

  describe('parseDuration', () => {
    it('should parse PT format with seconds only', () => {
      expect(parseDuration('PT45S')).toBe(45)
    })

    it('should parse PT format with minutes and seconds', () => {
      expect(parseDuration('PT5M30S')).toBe(330) // 5*60 + 30
    })

    it('should parse PT format with hours, minutes, and seconds', () => {
      expect(parseDuration('PT1H15M30S')).toBe(4530) // 1*3600 + 15*60 + 30
    })

    it('should parse PT format with only minutes', () => {
      expect(parseDuration('PT10M')).toBe(600)
    })

    it('should parse PT format with only hours', () => {
      expect(parseDuration('PT2H')).toBe(7200)
    })

    it('should handle zero duration', () => {
      expect(parseDuration('PT0S')).toBe(0)
    })

    it('should return 0 for invalid format', () => {
      expect(parseDuration('invalid')).toBe(0)
      expect(parseDuration('')).toBe(0)
    })
  })
})
