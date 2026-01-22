import postgres from 'postgres';
import { Logger } from './logger';
import { TeamsAndKeepers, PlayerValues } from './types';

/**
 * Converts a string to ASCII by removing diacritical marks (accents).
 * @param str - The input string
 * @returns The string with accents removed
 */
export function toAscii(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Retrieves teams and their players from the database.
 * @returns Promise<TeamsAndKeepers> - Object mapping team names to arrays of player names
 */
export async function getTeamsFromDB(): Promise<TeamsAndKeepers> {
    const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'verify-full' });

    Logger.info('Retrieving teams and players from database');

    try {
        const rows = await sql`SELECT team, player FROM team_composition_2026`;

        const result: TeamsAndKeepers = {};
        for (const row of rows) {
            if (!result[row.team]) {
                result[row.team] = [];
            }
            result[row.team].push(row.player);
        }

        Logger.info(`Retrieved ${Object.keys(result).length} teams`);
        return result;
    } catch (error) {
        Logger.error(`Failed to retrieve teams from database: ${error}`);
        throw error;
    } finally {
        await sql.end();
    }
}

/**
 * Retrieves all batter values from the database.
 * @returns Promise<BatterValues> - Array of batter value records
 */
export async function getBatterValuesFromDB(): Promise<PlayerValues> {
    const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'verify-full' });

    Logger.info('Retrieving batter values from database');

    try {
        const rows = await sql`SELECT * FROM team_batters_joined`;

        Logger.info(`Retrieved ${rows.length} batter value records`);
        return rows;
    } catch (error) {
        Logger.error(`Failed to retrieve batter values from database: ${error}`);
        throw error;
    } finally {
        await sql.end();
    }
}

export async function getPitcherValuesFromDB(): Promise<PlayerValues> {
    const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'verify-full' });

    Logger.info('Retrieving pitcher values from database');

    try {
        const rows = await sql`SELECT * FROM team_pitchers_joined`;

        Logger.info(`Retrieved ${rows.length} pitcher value records`);
        return rows;
    } catch (error) {
        Logger.error(`Failed to retrieve pitcher values from database: ${error}`);
        throw error;
    } finally {
        await sql.end();
    }
}
