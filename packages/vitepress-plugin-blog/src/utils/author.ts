/**
 * Author-related utilities for blog posts.
 * 
 * @module utils/author
 */

/**
 * Regular expression pattern for valid GitHub usernames.
 * GitHub usernames:
 * - Can contain alphanumeric characters and hyphens
 * - Cannot start or end with a hyphen
 * - Cannot have consecutive hyphens
 * - Are 1-39 characters long
 */
const GITHUB_USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/

/**
 * Checks if a string is a valid GitHub username.
 * 
 * This is used to determine whether to show a GitHub avatar
 * for the author or treat it as a plain text name.
 * 
 * @param author - The author name to check
 * @returns `true` if the author appears to be a GitHub username
 * 
 * @example
 * ```ts
 * isGitHubUsername('octocat')           // true
 * isGitHubUsername('human-by-def')      // true
 * isGitHubUsername('John Doe')          // false (contains space)
 * isGitHubUsername('My Team')           // false (contains space)
 * ```
 */
export function isGitHubUsername(author: string): boolean {
  if (!author || typeof author !== 'string') return false
  
  // Reject if it contains spaces (likely a team/organization name)
  if (author.includes(' ')) return false
  
  return GITHUB_USERNAME_PATTERN.test(author)
}

/**
 * Generates a GitHub avatar URL for a username.
 * 
 * @param username - A GitHub username
 * @param size - Optional size in pixels (default: 80)
 * @returns The URL to the user's GitHub avatar
 * 
 * @example
 * ```ts
 * getGitHubAvatarUrl('octocat')      // "https://github.com/octocat.png"
 * getGitHubAvatarUrl('octocat', 40)  // "https://github.com/octocat.png?size=40"
 * ```
 */
export function getGitHubAvatarUrl(username: string, size?: number): string {
  const baseUrl = `https://github.com/${username}.png`
  return size ? `${baseUrl}?size=${size}` : baseUrl
}
