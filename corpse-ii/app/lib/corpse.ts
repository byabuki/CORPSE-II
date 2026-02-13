import { calculateMean, calculateStdDev } from './stats';
import { Logger } from './logger';
import { CategoriesConfig } from './types';

export function generateZValues(categoriesConfig: CategoriesConfig, playerRows: Record<string, number | string>[]) {
    Logger.info('calculating zScores');

    Object.keys(categoriesConfig.categories).forEach((categoryKey) => {
        const category = categoriesConfig.categories[categoryKey];

        if (category.noValuation) return;

        const values = playerRows.map(
            (player: Record<string, unknown>) => player[categoryKey] as number
        );
        const mean = calculateMean(values);
        const std = calculateStdDev(values, mean);

        playerRows.forEach((player: Record<string, unknown>) => {
            const zScore = category.isPositiveStat
                ? ((player[categoryKey] as number) - mean) / std
                : (mean - (player[categoryKey] as number)) / std;

            player[`z${categoryKey}`] = zScore;
        });
    });

    Logger.info('add weighted zScores for rate stats');
    Object.keys(categoriesConfig.categories).forEach((categoryKey) => {
        const category = categoriesConfig.categories[categoryKey];

        if (category.noValuation) return;

        if (!category.isRateStat) return;

        playerRows.forEach((player: Record<string, unknown>) => {
            const zScore = player[`z${categoryKey}`] as number;

            const weighted = zScore * (player[category.denominator ?? 0] as number);

            player[`w${categoryKey}`] = weighted;
        });
    });

    Logger.info('calculate weighted zScores');
    Object.keys(categoriesConfig.categories).forEach((categoryKey) => {
        const category = categoriesConfig.categories[categoryKey];

        if (category.noValuation) return;

        if (!category.isRateStat) return;

        const weightedValues: number[] = [];
        playerRows.forEach((player: Record<string, unknown>) => {
            weightedValues.push(player[`w${categoryKey}`] as number);
        });
        const weightedMean = calculateMean(weightedValues);
        const weightedStd = calculateStdDev(weightedValues, weightedMean);

        Logger.info(
            `category: ${categoryKey}, weighted mean: ${weightedMean}, weightedStdev: ${weightedStd}`
        );

        playerRows.forEach((player: Record<string, unknown>) => {
            const zwScore =
                ((player[`w${categoryKey}`] as number) - weightedMean) /
                weightedStd;

            player[`zw${categoryKey}`] = zwScore;
        });
    });

    Logger.info('updating zTOTALs');
    playerRows.forEach((player: Record<string, unknown>) => {
        let zTotal = 0;
        Object.keys(categoriesConfig.categories).forEach((categoryKey) => {
            const category = categoriesConfig.categories[categoryKey];

            if (category.noValuation) return;

            if (!category.isRateStat) {
                zTotal += player[`z${categoryKey}`] as number;
                return;
            } else {
                zTotal += player[`zw${categoryKey}`] as number;
                return;
            }
        });

        player.zTOTAL = zTotal;
    });
}

/**
 * Calculates the replacement level value for batters or pitchers
 * @param playerValues - Array of player objects containing zTOTAL values
 * @param isBatters - Boolean indicating if working with batters (true) or pitchers (false)
 * @param startPosition - The position to start calculating replacement level from (default: 200)
 * @param playersToAverage - How many players to include in the average calculation (default: 10)
 * @returns The average zTOTAL value of the specified players
 */
export function calculateReplacementLevel(
    playerValues: Record<string, unknown>[],
    isBatters: boolean,
    startPosition: number = 200,
    playersToAverage: number = 10
): number {
    Logger.info(`Calculating replacement level for ${isBatters ? 'batters' : 'pitchers'}`);
    Logger.info(`Start position: ${startPosition}, Players to average: ${playersToAverage}`);

    // Sort players by zTOTAL in descending order (highest values first)
    const sortedPlayers = [...playerValues].sort((a, b) => {
        const aZTotal = (a.zTOTAL as number) || 0;
        const bZTotal = (b.zTOTAL as number) || 0;
        return bZTotal - aZTotal;
    });

    Logger.info(`Total players available: ${sortedPlayers.length}`);

    // Calculate the indices for the range of players to average
    // startPosition is 1-indexed, so we subtract 1 to get 0-indexed
    const startIndex = startPosition - 1;
    const endIndex = startIndex + playersToAverage;

    Logger.info(`Calculating average from positions ${startPosition}-${startPosition + playersToAverage - 1}`);
    Logger.info(`Array indices: ${startIndex}-${endIndex - 1}`);

    // Validate that we have enough players
    if (startIndex < 0) {
        throw new Error(`Start position ${startPosition} is invalid. Must be greater than 0.`);
    }

    if (endIndex > sortedPlayers.length) {
        throw new Error(
            `Cannot calculate replacement level. Need ${playersToAverage} players starting from position ${startPosition}, but only ${sortedPlayers.length} players available.`
        );
    }

    // Extract the zTOTAL values for the specified range
    const replacementLevelValues: number[] = [];
    for (let i = startIndex; i < endIndex; i++) {
        const player = sortedPlayers[i];
        const zTotal = (player.zTOTAL as number) || 0;
        replacementLevelValues.push(zTotal);

        Logger.info(`Position ${i + 1}: ${player.name || 'Unknown'} - zTOTAL: ${zTotal}`);
    }

    // Calculate and return the average
    const replacementLevel = calculateMean(replacementLevelValues);
    Logger.info(`Replacement level value: ${replacementLevel}`);

    return replacementLevel;
}
