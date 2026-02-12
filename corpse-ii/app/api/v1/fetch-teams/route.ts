import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import postgres from 'postgres';

import { Logger } from '@/app/lib/logger';
import { parseKeeperDataWithIsNa } from '@/app/lib/keepers';
import { TeamsAndPlayers } from '@/app/lib/types';

export async function GET() {
    try {
        Logger.info('Retrieving teams and players from database');
        const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'verify-full' });

        try {
            const rows = await sql`SELECT team, player FROM team_composition_2026`;

            const result: TeamsAndPlayers = {};
            for (const row of rows) {
                if (!result[row.team]) {
                    result[row.team] = [];
                }
                result[row.team].push(row.player);
            }

            Logger.info(`Retrieved ${Object.keys(result).length} teams`);
            return NextResponse.json(result);
        } catch (error) {
            Logger.error(`Failed to retrieve teams from database: ${error}`);
            throw error;
        } finally {
            await sql.end();
        }
    } catch (error) {
        Logger.error(`Failed to fetch teams: ${error}`);
        return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    // Check authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token !== process.env.API_SECRET_TOKEN) {
        return NextResponse.json({ error: 'Unauthorized 🔒' }, { status: 401 });
    }

    const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'verify-full' });

    Logger.info('Fetching teams and their players from source sheet');

    try {
        const envValue = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

        if (!envValue) {
            throw new Error('Google service account key not set');
        }

        const serviceAccountKey = JSON.parse(envValue);

        const auth = new google.auth.GoogleAuth({
            credentials: serviceAccountKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        const sheets = google.sheets({ version: 'v4', auth });
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: '1mt605D6l-rTxLPBE1bQibi8MivKU9ic6luFnQxE7sXs',
            range: 'A1:AD80',
        });

        const values = response.data.values;
        if (!values || values.length === 0) {
            throw new Error('No data found in spreadsheet');
        }

        Logger.info('Got sheet data, parsing data into teams and players');

        const teamsAndPlayers = parseKeeperDataWithIsNa(values);

        Logger.info('Delete previous results');

        await sql`TRUNCATE TABLE team_composition_2026;`;

        // Prepare data for insertion
        const valuesArrays: Array<[string, string, string]> = [];
        for (const playerData of teamsAndPlayers) {
            valuesArrays.push([playerData.team, playerData.player, playerData.isNa ? 'TRUE' : 'FALSE']);
        }

        Logger.info('Insert latest teams and players');

        const columns = ['team', 'player', 'is_na'];
        const insertedRows = valuesArrays.length;
        await sql`
            INSERT INTO team_composition_2026 (${sql(columns)})
            VALUES ${sql(valuesArrays)}
        `;

        return NextResponse.json(
            {
                success: true,
                values: teamsAndPlayers,
                insertedRows
            },
            { status: 200 }
        );
    } catch (e) {
        Logger.error(`Unable to complete team/player processing: ${JSON.stringify(e)}`);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to complete team/player processing',
            },
            { status: 500 }
        );
    }
}
