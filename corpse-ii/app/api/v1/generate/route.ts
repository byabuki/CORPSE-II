import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'verify-full' });

export async function POST(request: Request) {
  // Check authorization header
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token !== process.env.API_SECRET_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized 🔒' }, { status: 401 });
  }

  try {
      // Sample dummy data
      const dummyBatter = {
        player_id: 'trout001',
        name: 'Mike Trout',
        PA: 550.0,
        AB: 475.0,
        HR: 35.0,
        BB: 75.0,
        TB: 285.0,
        OBP: 0.385,
        SLG: 0.600,
        SB: 12.0,
        zHR: 1.85,
        zBB: 2.10,
        zTB: 1.95,
        wOBP: 0.420,
        zOBP: 1.75,
        wSLG: 0.640,
        zSLG: 2.05,
        zSB: 0.85,
        zTOTAL: 10.55,
        is_active: true,
        last_stats_update: new Date(),
        last_game_date: new Date('2026-01-15')
      };

      // Insert the row
      const result = await sql`
        INSERT INTO batters_values_2026 (
          player_id, name, PA, AB, HR, BB, TB, OBP, SLG, SB,
          zHR, zBB, zTB, wOBP, zOBP, wSLG, zSLG, zSB, zTOTAL,
          is_active, last_stats_update, last_game_date
        ) VALUES (
          ${dummyBatter.player_id}, ${dummyBatter.name}, ${dummyBatter.PA},
          ${dummyBatter.AB}, ${dummyBatter.HR}, ${dummyBatter.BB},
          ${dummyBatter.TB}, ${dummyBatter.OBP}, ${dummyBatter.SLG},
          ${dummyBatter.SB}, ${dummyBatter.zHR}, ${dummyBatter.zBB},
          ${dummyBatter.zTB}, ${dummyBatter.wOBP}, ${dummyBatter.zOBP},
          ${dummyBatter.wSLG}, ${dummyBatter.zSLG}, ${dummyBatter.zSB},
          ${dummyBatter.zTOTAL}, ${dummyBatter.is_active},
          ${dummyBatter.last_stats_update}, ${dummyBatter.last_game_date}
        )
        RETURNING *
      `;

      return NextResponse.json({
        success: true,
        data: result[0]
      }, { status: 201 });

    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to insert batter data'
      }, { status: 500 });
    }

}
