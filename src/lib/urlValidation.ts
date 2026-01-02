import { z } from "zod";

/**
 * URL validation schema that only allows HTTP and HTTPS protocols
 * Prevents javascript:, data:, and other potentially malicious URL schemes
 */
export const urlSchema = z.string().refine(
  (url) => {
    if (!url || !url.trim()) return false;
    try {
      const parsed = new URL(url.trim());
      // Only allow http and https protocols
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  },
  { message: "URL inválida. Use uma URL válida começando com http:// ou https://" }
);

/**
 * Validates a URL and returns the result
 * @param url - The URL to validate
 * @returns Object with success boolean and optional error message
 */
export const validateUrl = (url: string): { valid: boolean; error?: string } => {
  const result = urlSchema.safeParse(url);
  if (result.success) {
    return { valid: true };
  }
  return { valid: false, error: result.error.errors[0]?.message || "URL inválida" };
};

/**
 * Sanitizes a URL for safe display in href attributes
 * Only returns the URL if it starts with http:// or https://
 * Otherwise returns "#" as a safe fallback
 */
export const sanitizeUrlForHref = (url: string): string => {
  if (!url) return "#";
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return url.trim();
  }
  return "#";
};
