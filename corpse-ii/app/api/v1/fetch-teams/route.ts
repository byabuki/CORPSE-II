import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import postgres from 'postgres';

import { Logger } from '@/app/lib/logger';
import { parseKeeperData } from '@/app/lib/keepers';

export async function POST(request: Request) {
    // Check authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token !== process.env.API_SECRET_TOKEN) {
        return NextResponse.json({ error: 'Unauthorized 🔒' }, { status: 401 });
    }

    const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'verify-full' });

    try {
        const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
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
            throw new Error('No data found in spreadsheet.');
        }

        const teamsAndPlayers = parseKeeperData(values);

        // Truncate the table
        await sql`TRUNCATE TABLE team_composition_2026;`;

        // Prepare data for insertion
        const valuesArrays: string[][] = [];
        for (const [team, players] of Object.entries(teamsAndPlayers)) {
            for (const player of players) {
                valuesArrays.push([team, player]);
            }
        }

        // Insert in batches
        const columns = ['team', 'player'];
        let insertedRows = 0;
        for (let i = 0; i < valuesArrays.length; i += 500) {
            const batch = valuesArrays.slice(i, i + 500);
            await sql`
                INSERT INTO team_composition_2026 (${sql(columns)})
                VALUES ${sql(batch)}
            `;
            insertedRows += batch.length;
        }

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
