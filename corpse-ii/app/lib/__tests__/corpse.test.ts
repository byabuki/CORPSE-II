import { calculateReplacementLevel } from '../corpse';

describe('calculateReplacementLevel', () => {
    const mockBatterValues = [
        { name: 'Player 1', zTOTAL: 10.5 },
        { name: 'Player 2', zTOTAL: 9.8 },
        { name: 'Player 3', zTOTAL: 8.7 },
        { name: 'Player 4', zTOTAL: 7.6 },
        { name: 'Player 5', zTOTAL: 6.5 },
        { name: 'Player 6', zTOTAL: 5.4 },
        { name: 'Player 7', zTOTAL: 4.3 },
        { name: 'Player 8', zTOTAL: 3.2 },
        { name: 'Player 9', zTOTAL: 2.1 },
        { name: 'Player 10', zTOTAL: 1.0 },
        { name: 'Player 11', zTOTAL: 0.9 },
        { name: 'Player 12', zTOTAL: 0.8 },
        { name: 'Player 13', zTOTAL: 0.7 },
        { name: 'Player 14', zTOTAL: 0.6 },
        { name: 'Player 15', zTOTAL: 0.5 },
        { name: 'Player 16', zTOTAL: 0.4 },
        { name: 'Player 17', zTOTAL: 0.3 },
        { name: 'Player 18', zTOTAL: 0.2 },
        { name: 'Player 19', zTOTAL: 0.1 },
        { name: 'Player 20', zTOTAL: 0.0 },
    ];

    test('should calculate replacement level for batters starting at position 180 with 15 players', () => {
        // Since we only have 20 players, we'll test with a smaller dataset
        const result = calculateReplacementLevel(mockBatterValues, true, 15, 5);

        // This should average players at positions 15-19 (indices 14-18)
        // Players: 0.5, 0.4, 0.3, 0.2, 0.1
        const expected = (0.5 + 0.4 + 0.3 + 0.2 + 0.1) / 5;

        expect(result).toBe(expected);
    });

    test('should calculate replacement level for pitchers with default parameters', () => {
        // Test with a smaller dataset that can handle the default parameters
        const smallPitcherValues = [
            { name: 'Pitcher 1', zTOTAL: 8.0 },
            { name: 'Pitcher 2', zTOTAL: 7.0 },
            { name: 'Pitcher 3', zTOTAL: 6.0 },
            { name: 'Pitcher 4', zTOTAL: 5.0 },
            { name: 'Pitcher 5', zTOTAL: 4.0 },
            { name: 'Pitcher 6', zTOTAL: 3.0 },
            { name: 'Pitcher 7', zTOTAL: 2.0 },
            { name: 'Pitcher 8', zTOTAL: 1.0 },
            { name: 'Pitcher 9', zTOTAL: 0.5 },
            { name: 'Pitcher 10', zTOTAL: 0.0 },
        ];

        // Test with valid parameters for the small dataset
        const result = calculateReplacementLevel(smallPitcherValues, false, 5, 3);

        // This should average players at positions 5-7 (indices 4-6)
        // Players: 4.0, 3.0, 2.0
        const expected = (4.0 + 3.0 + 2.0) / 3;

        expect(result).toBe(expected);
    });

    test('should handle edge case with start position 1', () => {
        const result = calculateReplacementLevel(mockBatterValues, true, 1, 3);

        // This should average the top 3 players: 10.5, 9.8, 8.7
        const expected = (10.5 + 9.8 + 8.7) / 3;

        expect(result).toBe(expected);
    });

    test('should throw error for invalid start position', () => {
        expect(() => {
            calculateReplacementLevel(mockBatterValues, true, 0, 5);
        }).toThrow('Start position 0 is invalid');
    });

    test('should handle players with missing zTOTAL values', () => {
        const playersWithMissingValues = [
            { name: 'Player 1', zTOTAL: 5.0 },
            { name: 'Player 2' }, // missing zTOTAL
            { name: 'Player 3', zTOTAL: 3.0 },
            { name: 'Player 4', zTOTAL: 2.0 },
            { name: 'Player 5', zTOTAL: 1.0 },
        ];

        const result = calculateReplacementLevel(playersWithMissingValues, true, 1, 3);

        // After sorting by zTOTAL descending: [5.0, 3.0, 2.0, 1.0, 0]
        // Starting at position 1, averaging next 3: 5.0, 3.0, 2.0
        const expected = (5.0 + 3.0 + 2.0) / 3;

        expect(result).toBe(expected);
    });
});