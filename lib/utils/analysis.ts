import { Prisma } from '@prisma/client'

/**
 * Create a Map from analysis sections for easy lookup by type
 *
 * @param sections - Array of analysis sections from Prisma query
 * @returns Map with section type as key and JSON data as value
 *
 * @example
 * ```typescript
 * const sections = await prisma.analysisSection.findMany(...)
 * const map = createSectionsMap(sections)
 * const overview = map.get('OVERVIEW') as Overview
 * ```
 *
 * @remarks
 * This utility consolidates duplicate map creation logic across components.
 * The JSON values should be cast to their specific schema types when retrieved.
 */
export function createSectionsMap(
  sections: Array<{ type: string; json: Prisma.JsonValue }>
): Map<string, Prisma.JsonValue> {
  return new Map(sections.map((s) => [s.type, s.json]))
}
