/**
 * Converts a string to ASCII by removing diacritical marks (accents).
 * @param str - The input string
 * @returns The string with accents removed
 */
export function toAscii(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
