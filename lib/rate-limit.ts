/**
 * Simple in-memory rate limiter for API routes
 *
 * @remarks
 * For production, consider using:
 * - Vercel Edge Config for serverless
 * - Upstash Redis for distributed rate limiting
 * - @upstash/ratelimit package
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

/**
 * Clean up expired entries every 5 minutes
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetAt < now) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  /**
   * Maximum requests allowed in the window
   * @default 10
   */
  limit?: number

  /**
   * Time window in seconds
   * @default 60
   */
  windowSec?: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier for rate limiting (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Result indicating if request is allowed
 *
 * @example
 * ```typescript
 * const ip = request.headers.get('x-forwarded-for') || 'unknown'
 * const result = rateLimit(ip, { limit: 5, windowSec: 60 })
 *
 * if (!result.success) {
 *   return NextResponse.json(
 *     { error: 'Too many requests' },
 *     {
 *       status: 429,
 *       headers: {
 *         'X-RateLimit-Limit': String(result.limit),
 *         'X-RateLimit-Remaining': String(result.remaining),
 *         'X-RateLimit-Reset': String(result.reset),
 *       },
 *     }
 *   )
 * }
 * ```
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const { limit = 10, windowSec = 60 } = config
  const now = Date.now()
  const windowMs = windowSec * 1000

  // Get or create entry
  let entry = rateLimitMap.get(identifier)

  if (!entry || entry.resetAt < now) {
    // Create new window
    entry = {
      count: 1,
      resetAt: now + windowMs,
    }
    rateLimitMap.set(identifier, entry)

    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: entry.resetAt,
    }
  }

  // Increment count
  entry.count++

  const success = entry.count <= limit
  const remaining = Math.max(0, limit - entry.count)

  return {
    success,
    limit,
    remaining,
    reset: entry.resetAt,
  }
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.floor(result.reset / 1000)),
  }
}
