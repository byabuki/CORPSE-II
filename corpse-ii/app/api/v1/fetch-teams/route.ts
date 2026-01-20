import { NextResponse } from 'next/server';
import postgres from 'postgres';

import { Logger } from '@/app/lib/logger';

const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'verify-full' });

export async function POST(request: Request) {
    // Check authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token !== process.env.API_SECRET_TOKEN) {
        return NextResponse.json({ error: 'Unauthorized 🔒' }, { status: 401 });
    }

    try {
        return NextResponse.json(
            {
                success: true
            },
            { status: 201 }
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
