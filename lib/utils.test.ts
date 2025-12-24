import { describe, it, expect } from 'vitest'
import { cn, formatNumber, formatDuration, truncate, delay, retry } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
      expect(cn('px-4', 'px-8')).toBe('px-8') // Tailwind merge
    })

    it('handles conditional classes', () => {
      expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
    })
  })

  describe('formatNumber', () => {
    it('formats numbers with locale', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1000000)).toBe('1,000,000')
    })

    it('handles null and undefined', () => {
      expect(formatNumber(null)).toBe('0')
      expect(formatNumber(undefined)).toBe('0')
    })

    it('handles zero', () => {
      expect(formatNumber(0)).toBe('0')
    })
  })

  describe('formatDuration', () => {
    it('formats seconds to MM:SS for durations under 1 hour', () => {
      expect(formatDuration(0)).toBe('0:00')
      expect(formatDuration(59)).toBe('0:59')
      expect(formatDuration(60)).toBe('1:00')
      expect(formatDuration(125)).toBe('2:05')
      expect(formatDuration(3599)).toBe('59:59')
    })

    it('formats seconds to HH:MM:SS for durations 1 hour or longer', () => {
      expect(formatDuration(3600)).toBe('1:00:00')
      expect(formatDuration(3661)).toBe('1:01:01')
      expect(formatDuration(7384)).toBe('2:03:04')
      expect(formatDuration(36000)).toBe('10:00:00')
    })
  })

  describe('truncate', () => {
    it('truncates long text', () => {
      const text = 'This is a very long text that should be truncated'
      expect(truncate(text, 20)).toBe('This is a very long ...')
    })

    it('does not truncate short text', () => {
      const text = 'Short text'
      expect(truncate(text, 20)).toBe('Short text')
    })

    it('handles exact length', () => {
      const text = 'Exactly twenty chars'
      expect(truncate(text, 20)).toBe('Exactly twenty chars')
    })
  })

  describe('delay', () => {
    it('delays execution', async () => {
      const start = Date.now()
      await delay(100)
      const end = Date.now()
      expect(end - start).toBeGreaterThanOrEqual(95) // Allow small margin
    })
  })

  describe('retry', () => {
    it('succeeds on first attempt', async () => {
      const fn = async () => 'success'
      const result = await retry(fn)
      expect(result).toBe('success')
    })

    it('retries on failure and eventually succeeds', async () => {
      let attempts = 0
      const fn = async () => {
        attempts++
        if (attempts < 2) throw new Error('fail')
        return 'success'
      }
      const result = await retry(fn, 3, 10)
      expect(result).toBe('success')
      expect(attempts).toBe(2)
    })

    it('throws after max attempts', async () => {
      const fn = async () => {
        throw new Error('always fails')
      }
      await expect(retry(fn, 2, 10)).rejects.toThrow('always fails')
    })
  })
})
