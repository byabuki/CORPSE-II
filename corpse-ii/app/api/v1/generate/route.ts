import { NextResponse } from 'next/server';
import postgres from 'postgres';
import { compileExpression } from 'filtrex';
import { generateZValues } from '@/app/lib/corpse';
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
        let battersSuccessfulRows = 0;
        let pitchersSuccessfulRows = 0;

        // batters eval
        try {
            Logger.info('fetching batters config');
            const battersConfigRaw = await fetch('https://y3fmv3sypyoh9kpr.public.blob.vercel-storage.com/batters_config_v1.json');
            const battersConfig = await battersConfigRaw.json();

            const base_projection = battersConfig.base_projection;
            Logger.info(`using ${base_projection} for batter valuation basis`)

            Logger.info('fetching batters fangraphs data')
            const fangraphsResponse = await fetch(`https://www.fangraphs.com/api/projections?type=${base_projection}&stats=bat&pos=all`);
            const fangraphsData = await fangraphsResponse.json();

            const playerRows = fangraphsData.map((player: Record<string, unknown>) => {
                const filteredPlayer: Record<string, unknown> = {};
                Object.keys(battersConfig.categories).forEach(key => {
                    const category = battersConfig.categories[key];
                    const destinationKey = key; // category.destinationColumn || key;
                    if (player.hasOwnProperty(key)) {
                        filteredPlayer[destinationKey] = player[key];
                    } else if (category.formula) {
                        const expr = compileExpression(category.formula);
                        filteredPlayer[destinationKey] = expr(player);
                    }
                });
                return filteredPlayer;
            });

            Logger.info('calculating batters zScores');
            generateZValues(battersConfig, playerRows);

            Logger.info('prep data for batters insert');
            const columns = ['player_id', 'name', 'pa', 'ab', 'hr', 'bb', 'tb', 'obp', 'slg', 'sb', 'zhr', 'zbb', 'ztb', 'zobp', 'wobp', 'zslg', 'wslg', 'zwobp', 'zwslg', 'zsb', 'ztotal', 'is_active'];
            const valuesArrays = playerRows.map((player: Record<string, unknown>) => [
                player.playerid, player.PlayerName, player.PA, player.AB, player.HR, player.BB,
                player.TB, player.OBP, player.SLG, player.SB, player.zHR, player.zBB,
                player.zTB, player.zOBP, player.wOBP, player.zSLG, player.wSLG, player.zwOBP, player.zwSLG, player.zSB,
                player.zTOTAL, true,
            ]);

            Logger.info('perform batters SQL operations');
            for (let i = 0; i < valuesArrays.length; i += 500) {
                const batch = valuesArrays.slice(i, i + 500);
                const result = await sql`
                    INSERT INTO batters_values_2026 (${sql(columns)})
                    VALUES ${sql(batch)}
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
                      zobp = EXCLUDED.zobp,
                      wobp = EXCLUDED.wobp,
                      zslg = EXCLUDED.zslg,
                      wslg = EXCLUDED.wslg,
                      zwobp = EXCLUDED.zwobp,
                      zwslg = EXCLUDED.zwslg,
                      zsb = EXCLUDED.zsb,
                      ztotal = EXCLUDED.ztotal,
                      is_active = EXCLUDED.is_active
                `;
                battersSuccessfulRows += batch.length;
            }
        } catch (e) {
            Logger.error(`Unable to complete batter valuations: ${JSON.stringify(e)}`)
        }

        // pitchers eval
        try {
            Logger.info('fetching pitchers config');
            const pitchersConfigRaw = await fetch(
                'https://y3fmv3sypyoh9kpr.public.blob.vercel-storage.com/pitchers_config_v1.json'
            );
            const pitchersConfig = await pitchersConfigRaw.json();

            const base_projection = pitchersConfig.base_projection;
            Logger.info(`using ${base_projection} for pitcher valuation basis`);

            Logger.info('fetching pitchers fangraphs data');
            const fangraphsResponse = await fetch(
                `https://www.fangraphs.com/api/projections?type=${base_projection}&stats=pit&pos=all`
            );
            const fangraphsData = await fangraphsResponse.json();

            Logger.info('remove unnecessary stats');
            const playerRows = fangraphsData.map(
                (player: Record<string, unknown>) => {
                    const filteredPlayer: Record<string, unknown> = {};
                    Object.keys(pitchersConfig.categories).forEach((key) => {
                        const category = pitchersConfig.categories[key];
                        const destinationKey = key; // category.destinationColumn || key;
                        if (player.hasOwnProperty(key)) {
                            filteredPlayer[destinationKey] = player[key];
                        } else if (category.formula) {
                            const expr = compileExpression(category.formula);
                            filteredPlayer[destinationKey] = expr(player);
                        }
                    });
                    return filteredPlayer;
                }
            );

            generateZValues(pitchersConfig, playerRows);


            Logger.info('prep data for pitchers insert');
            const columns = ['player_id', 'name', 'gs', 'g', 'ip', 'era', 'whip', 'so', 'bb9', 'qs', 'svh', 'zera', 'zwhip', 'zso', 'zbb9', 'zqs', 'zsvh', 'zwera', 'zwwhip', 'zwbb9', 'ztotal', 'is_active', 'created_at', 'updated_at'];
            const valuesArrays = playerRows.map((player: Record<string, unknown>) => [
                player.playerid, player.PlayerName, player.GS, player.G, player.IP, player.ERA, player.WHIP, player.SO, player['BB/9'], player.QS, player.SVH, player.zERA, player.zWHIP, player.zSO, player['zBB/9'], player.zQS, player.zSVH, player.zwERA, player.zwWHIP, player['zwBB/9'], player.zTOTAL, true, new Date(), new Date()
            ]);

            Logger.info('perform pitchers SQL operations');
            for (let i = 0; i < valuesArrays.length; i += 500) {
                const batch = valuesArrays.slice(i, i + 500);
                const result = await sql`
                    INSERT INTO pitchers_values_2026 (${sql(columns)})
                    VALUES ${sql(batch)}
                    ON CONFLICT (player_id) DO UPDATE SET
                        name = EXCLUDED.name,
                        gs = EXCLUDED.gs,
                        g = EXCLUDED.g,
                        ip = EXCLUDED.ip,
                        era = EXCLUDED.era,
                        whip = EXCLUDED.whip,
                        so = EXCLUDED.so,
                        bb9 = EXCLUDED.bb9,
                        qs = EXCLUDED.qs,
                        svh = EXCLUDED.svh,
                        zera = EXCLUDED.zera,
                        zwhip = EXCLUDED.zwhip,
                        zso = EXCLUDED.zso,
                        zbb9 = EXCLUDED.zbb9,
                        zqs = EXCLUDED.zqs,
                        zsvh = EXCLUDED.zsvh,
                        zwera = EXCLUDED.zwera,
                        zwwhip = EXCLUDED.zwwhip,
                        zwbb9 = EXCLUDED.zwbb9,
                        ztotal = EXCLUDED.ztotal,
                        is_active = EXCLUDED.is_active,
                        updated_at = NOW()
                `;
                pitchersSuccessfulRows += batch.length;
            }
        } catch (e) {
            Logger.error(`Unable to complete pitcher valuations: ${JSON.stringify(e)}`);
        }

        return NextResponse.json(
            {
                success: true,
                battersInsertedRows: battersSuccessfulRows,
                pitchersInsertedRows: pitchersSuccessfulRows,
            },
            { status: 201 }
        );
    } catch (error) {
        Logger.error(`Unable to complete player valuations: ${JSON.stringify(error)}`);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to complete player valuations',
            },
            { status: 500 }
        );
    }
}
