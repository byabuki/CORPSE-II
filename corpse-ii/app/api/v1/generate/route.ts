import { NextResponse } from 'next/server';
import postgres from 'postgres';
import { compileExpression } from 'filtrex';

const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'verify-full' });

export async function POST(request: Request) {
  // Check authorization header
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token !== process.env.API_SECRET_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized 🔒' }, { status: 401 });
  }

  try {
    console.log('fetching batters config');
    const battersConfigRaw = await fetch('https://y3fmv3sypyoh9kpr.public.blob.vercel-storage.com/batters_config_v1.json');
    const battersConfig = await battersConfigRaw.json();

    const base_projection = battersConfig.base_projection;
    console.log(`using ${base_projection} for batter valuation basis`)

    // https://www.fangraphs.com/api/projections?type=thebatx&stats=bat&pos=all

    console.log('fetching fangraphs data')
    const fangraphsResponse = await fetch(`https://www.fangraphs.com/api/projections?type=${base_projection}&stats=bat&pos=all`);
    const fangraphsData = await fangraphsResponse.json();

    const mappedFangraphsData = fangraphsData.map((player: Record<string, unknown>) => {
      const filteredPlayer: Record<string, unknown> = {};
      Object.keys(battersConfig.categories).forEach(key => {
        const category = battersConfig.categories[key];
        const destinationKey = category.destinationColumn || key;
        if (player.hasOwnProperty(key)) {
          filteredPlayer[destinationKey] = player[key];
        } else if (category.formula) {
          const expr = compileExpression(category.formula);
          filteredPlayer[destinationKey] = expr(player);
        }
      });
      return filteredPlayer;
    });

    console.log('calculating zScores');

    const calculateMean = (values: number[]): number => values.reduce((a, b) => a + b, 0) / values.length;
    const calculateStdDev = (values: number[], mean: number): number => {
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      return Math.sqrt(variance);
    };

    Object.keys(battersConfig.categories).forEach(categoryKey => {
      const category = battersConfig.categories[categoryKey];
      if (category.noFormula) return;

      const values = mappedFangraphsData.map((p: Record<string, unknown>) => p[categoryKey] as number);
      const mean = calculateMean(values);
      const std = calculateStdDev(values, mean);

      if (!category.isRateStat) {
        mappedFangraphsData.forEach((p: Record<string, unknown>) => {
          let zScore = (p[categoryKey] as number - mean) / std;
          if (!category.isPositiveStat) zScore *= -1;
          p[`z${categoryKey}`] = zScore;
        });
      } else {
        const weightedValues: number[] = [];
        mappedFangraphsData.forEach((p: Record<string, unknown>) => {
          const weighted = (p[categoryKey] as number) * (p[category.denominator] as number);
          weightedValues.push(weighted);
          p[`w${categoryKey}`] = weighted;
        });
        const weightedMean = calculateMean(weightedValues);
        const weightedStd = calculateStdDev(weightedValues, weightedMean);
        mappedFangraphsData.forEach((p: Record<string, unknown>, index: number) => {
          let zScore = (weightedValues[index] - weightedMean) / weightedStd;
          if (!category.isPositiveStat) zScore *= -1;
          p[`z${categoryKey}`] = zScore;
        });
      }
    });


    console.log('updating zTOTALs');
    mappedFangraphsData.forEach((p: Record<string, unknown>) => {
      const zScores = Object.keys(p).filter(key => key.startsWith('z') && key !== 'zTOTAL').map(key => p[key] as number);
      p.zTOTAL = zScores.reduce((sum, score) => sum + score, 0);
    });

    console.log('prep data for insert');
    const columns = ['player_id', 'name', 'pa', 'ab', 'hr', 'bb', 'tb', 'obp', 'slg', 'sb', 'zhr', 'zbb', 'ztb', 'wobp', 'zobp', 'wslg', 'zslg', 'zsb', 'ztotal', 'is_active', 'last_stats_update', 'last_game_date'];
    const valuesArrays = mappedFangraphsData.map((player: Record<string, unknown>) => [
      player.player_id, player.name, player.PA, player.AB, player.HR, player.BB,
      player.TB, player.OBP, player.SLG, player.SB, player.zHR, player.zBB,
      player.zTB, player.wOBP, player.zOBP, player.wSLG, player.zSLG, player.zSB,
      player.zTOTAL, true, new Date(), new Date()
    ]);

    console.log('perform SQL operations');
    const result = await sql`
      INSERT INTO batters_values_2026 (${sql(columns)})
      VALUES ${sql(valuesArrays)}
      ON CONFLICT (player_id) DO UPDATE SET
        name = EXCLUDED.name,
        pa = EXCLUDED.pa,
        ab = EXCLUDED.ab,
        hr = EXCLUDED.hr,
        bb = EXCLUDED.bb,
        tb = EXCLUDED.tb,
        obp = EXCLUDED.obp,
        slg = EXCLUDED.slg,
        sb = EXCLUDED.sb,
        zhr = EXCLUDED.zhr,
        zbb = EXCLUDED.zbb,
        ztb = EXCLUDED.ztb,
        wobp = EXCLUDED.wobp,
        zobp = EXCLUDED.zobp,
        wslg = EXCLUDED.wslg,
        zslg = EXCLUDED.zslg,
        zsb = EXCLUDED.zsb,
        ztotal = EXCLUDED.ztotal,
        is_active = EXCLUDED.is_active,
        last_stats_update = EXCLUDED.last_stats_update,
        last_game_date = EXCLUDED.last_game_date
    `;

    return NextResponse.json({
      success: true,
      insertedRows: valuesArrays.length
    }, { status: 201 });

  } catch (error) {
    console.error('Unable to complete player valuations: ', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to complete player valuations'
    }, { status: 500 });
  }

}
