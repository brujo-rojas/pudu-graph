/**
 * Genera un identificador único basado en timestamp y número aleatorio
 */
export function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomPart}`;
}

/**
 * Genera un identificador único más corto
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10);
}
