import { NextResponse } from 'next/server';
import { google } from 'googleapis';

import { Logger } from '@/app/lib/logger';
import { parseKeeperData } from '@/app/lib/keepers';

export async function POST(request: Request) {
    // Check authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token !== process.env.API_SECRET_TOKEN) {
        return NextResponse.json({ error: 'Unauthorized 🔒' }, { status: 401 });
    }

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


        return NextResponse.json(
            {
                success: true,
                values: parseKeeperData(values),
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
