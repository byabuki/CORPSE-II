import { NextResponse } from 'next/server';
import postgres from 'postgres';

import { Logger } from '@/app/lib/logger';

export async function GET(request: Request) {
    // Check authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token !== process.env.API_SECRET_TOKEN) {
        return NextResponse.json({ error: 'Unauthorized 🔒' }, { status: 401 });
    }

    try {
        const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'verify-full' });

        Logger.info('Get teams, pitchers, and values');

        const pitcherQueryData = await sql`SELECT * FROM team_pitchers_joined`;

        return NextResponse.json(
            {
                success: true,
                data: pitcherQueryData,
            },
            { status: 200 }
        );
    } catch (e) {
        Logger.error(`Unable to fetch pitcher values: ${JSON.stringify(e)}`);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch pitcher values',
            },
            { status: 500 }
        );
    }
}
