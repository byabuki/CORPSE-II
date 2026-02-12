import { TeamsAndPlayers } from './types';

export function parseKeeperData(values: string[][]): TeamsAndPlayers {
    const result: TeamsAndPlayers = {};

    // First row contains team names (every 3rd column starting at 0)
    const teamNames: string[] = [];
    for (let col = 0; col < values[0].length; col += 3) {
        const teamName = values[0][col]?.trim();
        if (teamName) {
            teamNames.push(teamName);
            result[teamName] = [];
        }
    }

    // Process data rows (skip first row with team names and second row with headers)
    for (let row = 2; row < values.length; row++) {
        const rowData = values[row];
        if (!rowData || rowData.length === 0) continue;

        // Process each team (teams are in 3-column blocks: Yrs, Player, Tag)
        teamNames.forEach((teamName, teamIndex) => {
            const colOffset = teamIndex * 3;
            const years = rowData[colOffset]?.trim() || '';
            const player = rowData[colOffset + 1]?.trim() || '';
            const tag = rowData[colOffset + 2]?.trim() || '';

            // Check if player should be included
            if (player && shouldIncludePlayer(years, tag)) {
                result[teamName].push(player);
            }
        });
    }

    return result;
}

export function parseKeeperDataWithIsNa(values: string[][]): Array<{team: string, player: string, isNa: boolean}> {
    const result: Array<{team: string, player: string, isNa: boolean}> = [];

    // First row contains team names (every 3rd column starting at 0)
    const teamNames: string[] = [];
    for (let col = 0; col < values[0].length; col += 3) {
        const teamName = values[0][col]?.trim();
        if (teamName) {
            teamNames.push(teamName);
        }
    }

    // Process data rows (skip first row with team names and second row with headers)
    for (let row = 2; row < values.length; row++) {
        const rowData = values[row];
        if (!rowData || rowData.length === 0) continue;

        // Process each team (teams are in 3-column blocks: Yrs, Player, Tag)
        teamNames.forEach((teamName, teamIndex) => {
            const colOffset = teamIndex * 3;
            const years = rowData[colOffset]?.trim() || '';
            const player = rowData[colOffset + 1]?.trim() || '';
            const tag = rowData[colOffset + 2]?.trim() || '';

            // Check if player should be included
            if (player && shouldIncludePlayer(years, tag)) {
                const isNa = tag === 'NA';
                result.push({ team: teamName, player, isNa });
            }
        });
    }

    return result;
}

function shouldIncludePlayer(years: string, tag: string): boolean {
    // Include if: (has years AND has tag AND tag is not "Cut") OR (tag is "NA")

    // Case 1: Tag is "NA"
    if (tag === 'NA') {
        return true;
    }

    // Case 2: Has years AND has tag AND tag is not "Cut" or "No tag"
    if (years && tag && tag !== 'Cut' && tag !== 'No tag') {
        return true;
    }

    return false;
}
