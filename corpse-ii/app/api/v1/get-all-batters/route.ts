import { NextResponse } from 'next/server';
import postgres from 'postgres';

import { Logger } from '@/app/lib/logger';

export async function GET() {
    try {
        const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'verify-full' });

        Logger.info('Get all batters');

        const batterQueryData = await sql`SELECT * FROM batters_values_2026`;

        return NextResponse.json(
            {
                success: true,
                data: batterQueryData,
            },
            { status: 200 }
        );
    } catch (e) {
        Logger.error(`Unable to fetch all batters: ${JSON.stringify(e)}`);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch batters',
            },
            { status: 500 }
        );
    }
}
