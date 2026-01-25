/**
 * Converts a string to ASCII by removing diacritical marks (accents).
 * @param str - The input string
 * @returns The string with accents removed
 */
export function toAscii(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function getPercentile(value: number, values: number[]) {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    if (value <= sorted[0]) return 0;
    if (value >= sorted[sorted.length - 1]) return 1;
    let low = 0;
    let high = sorted.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (sorted[mid] < value) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    const index = low;
    const prev = sorted[index - 1];
    const next = sorted[index];
    const fraction = (value - prev) / (next - prev);
    const percentile = (index - 1 + fraction) / (sorted.length - 1);
    return percentile;
};

export function getColor(value: number, values: number[]): string | null {
    const percentile = getPercentile(value, values);
    if (percentile === 0.5) return null; // no color at 50th percentile
    let hue: number;
    let saturation: number;
    if (percentile < 0.5) {
        hue = 0;
        saturation = (0.5 - percentile) * 140;
    } else {
        hue = 120;
        saturation = (percentile - 0.5) * 140;
    }
    saturation = Math.min(saturation, 100);
    return `hsl(${hue}, ${saturation}%, 50%)`;
};
