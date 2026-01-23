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
