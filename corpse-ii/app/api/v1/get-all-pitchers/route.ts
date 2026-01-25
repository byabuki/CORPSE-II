import { NextResponse } from 'next/server';
import postgres from 'postgres';

import { Logger } from '@/app/lib/logger';

export async function GET() {
    try {
        const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'verify-full' });

        Logger.info('Get all pitchers');

        const pitcherQueryData = await sql`SELECT * FROM pitchers_values_2026`;

        return NextResponse.json(
            {
                success: true,
                data: pitcherQueryData,
            },
            { status: 200 }
        );
    } catch (e) {
        Logger.error(`Unable to fetch all pitchers: ${JSON.stringify(e)}`);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch all pitchers',
            },
            { status: 500 }
        );
    }
}
