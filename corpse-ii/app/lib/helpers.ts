import { Logger } from './logger';
import { TeamsAndKeepers, PlayerValues } from './types';

const API_BASE_URL = 'https://corpse-ii.vercel.app';

/**
 * Converts a string to ASCII by removing diacritical marks (accents).
 * @param str - The input string
 * @returns The string with accents removed
 */
export function toAscii(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Retrieves teams and their players from the API.
 * @returns Promise<TeamsAndKeepers> - Object mapping team names to arrays of player names
 */
export async function getTeamsFromDB(): Promise<TeamsAndKeepers> {
    Logger.info('Retrieving teams and players from API');

    try {
        const response = await fetch(`${process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : API_BASE_URL}/api/v1/fetch-teams`);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();

        Logger.info(`Retrieved ${Object.keys(result).length} teams`);
        return result;
    } catch (error) {
        Logger.error(`Failed to retrieve teams from API: ${error}`);
        throw error;
    }
}

/**
 * Retrieves all batter values from the API.
 * @returns Promise<BatterValues> - Array of batter value records
 */
export async function getCompleteBatterValues(): Promise<PlayerValues> {
    Logger.info('Retrieving batter values from API');

    try {
        const response = await fetch(`${process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : API_BASE_URL}/api/v1/get-batter-values`);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch batter values');
        }

        Logger.info(`Retrieved ${result.data.length} batter value records`);
        return result.data;
    } catch (error) {
        Logger.error(`Failed to retrieve batter values from API: ${error}`);
        throw error;
    }
}

export async function getCompletePitcherValues(): Promise<PlayerValues> {
    Logger.info('Retrieving pitcher values from API');

    try {
        const response = await fetch(`${process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : API_BASE_URL}/api/v1/get-pitcher-values`);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch pitcher values');
        }

        Logger.info(`Retrieved ${result.data.length} pitcher value records`);
        return result.data;
    } catch (error) {
        Logger.error(`Failed to retrieve pitcher values from API: ${error}`);
        throw error;
    }
}
