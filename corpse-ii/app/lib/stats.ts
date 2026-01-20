export function calculateMean(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
}

export function calculateStdDev(values: number[], mean: number): number {
    const variance =
        values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
}
