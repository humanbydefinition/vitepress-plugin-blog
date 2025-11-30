/**
 * Date formatting utilities for blog posts.
 * 
 * @module utils/date
 */

/**
 * Default date formatter using the user's locale.
 * Formats dates as "Month Day, Year" (e.g., "January 15, 2024").
 */
const defaultDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

/**
 * Formats a date string into a human-readable format.
 * 
 * @param date - A date string in any format parseable by `Date.parse()`
 * @param formatter - Optional custom Intl.DateTimeFormat instance
 * @returns The formatted date string, or the original string if parsing fails
 * 
 * @example
 * ```ts
 * formatDate('2024-01-15') // "January 15, 2024"
 * formatDate('invalid')    // "invalid"
 * ```
 */
export function formatDate(
  date: string,
  formatter: Intl.DateTimeFormat = defaultDateFormatter
): string {
  if (!date) return ''
  
  const parsed = Date.parse(date)
  if (Number.isNaN(parsed)) return date
  
  return formatter.format(new Date(parsed))
}

/**
 * Parses a date string and returns the timestamp, or 0 if invalid.
 * Useful for sorting posts by date.
 * 
 * @param date - A date string in any format parseable by `Date.parse()`
 * @returns The timestamp in milliseconds, or 0 if the date is invalid
 * 
 * @example
 * ```ts
 * parseDate('2024-01-15') // 1705276800000
 * parseDate('invalid')    // 0
 * ```
 */
export function parseDate(date: string): number {
  if (!date) return 0
  const parsed = Date.parse(date)
  return Number.isNaN(parsed) ? 0 : parsed
}
