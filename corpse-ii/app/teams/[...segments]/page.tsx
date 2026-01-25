'use client';

import { useFantasyData } from '../../context/FantasyDataContext';
import { useEffect, useState } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';
import { BatterRecord, PitcherRecord } from '../../lib/types';
import { getColor } from '../../lib/helpers';

interface PageProps {
    params: {
        segments: string[];
    };
}

export default function TeamPage({ params }: PageProps) {
    const { battersValues, pitchersValues, teamsAndPlayers } = useFantasyData();

    const [teamName, setTeamName] = useState('');

    useEffect(() => {
        async function setName() {
            const { segments } = await params;
            const name = decodeURIComponent(segments.join('/'));
            setTeamName(name);
        }
        setName();
    }, [params]);

    if (!teamName)
        return null;

    if (Object.keys(teamsAndPlayers).length === 0 || !pitchersValues || !battersValues)
        return <LoadingIndicator />;

    const teamPlayers = teamsAndPlayers[teamName];

    const teamBatters = (battersValues?.filter(batter => batter.nameascii && teamPlayers?.includes(batter.nameascii)) as unknown as BatterRecord[]).sort((a, b) => b.ztotal - a.ztotal);
    const teamPitchers = (pitchersValues?.filter(pitcher => pitcher.nameascii && teamPlayers?.includes(pitcher.nameascii)) as unknown as PitcherRecord[]).sort((a, b) => b.ztotal - a.ztotal);

    return (
        <div className="min-h-full p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold">{teamName}</h1>
                    <p className="text-gray-400 mt-2">{teamPlayers.length} players</p>
                </div>

                {teamBatters.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Batters</h2>
                        <table className="w-full table-auto border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-800">
                                    <th className="border border-gray-300 px-4 py-2">Player Name</th>
                                    <th className="border border-gray-300 px-4 py-2">PA</th>
                                    <th className="border border-gray-300 px-4 py-2">HR</th>
                                    <th className="border border-gray-300 px-4 py-2">SB</th>
                                    <th className="border border-gray-300 px-4 py-2">BB</th>
                                    <th className="border border-gray-300 px-4 py-2">TB</th>
                                    <th className="border border-gray-300 px-4 py-2">OBP</th>
                                    <th className="border border-gray-300 px-4 py-2">SLG</th>
                                    <th className="border border-gray-300 px-4 py-2">zTotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamBatters.map((batter, index) => {
                                    if (process.env.NODE_ENV)
                                        console.log(batter);
                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="border border-gray-300 px-4 py-2">{batter.name}</td>
                                            <td className="border border-gray-300 px-4 py-2">{batter.pa.toFixed(1)}</td>
                                            <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor((batter as BatterRecord).hr, battersValues.map(b => (b as BatterRecord).hr)) || 'transparent' }}>{(batter as BatterRecord).hr.toFixed(1)}</td>
                                            <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor((batter as BatterRecord).sb, battersValues.map(b => (b as BatterRecord).sb)) || 'transparent' }}>{(batter as BatterRecord).sb.toFixed(1)}</td>
                                            <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor((batter as BatterRecord).bb, battersValues.map(b => (b as BatterRecord).bb)) || 'transparent' }}>{(batter as BatterRecord).bb.toFixed(1)}</td>
                                            <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor((batter as BatterRecord).tb, battersValues.map(b => (b as BatterRecord).tb)) || 'transparent' }}>{(batter as BatterRecord).tb.toFixed(1)}</td>
                                            <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor((batter as BatterRecord).obp, battersValues.map(b => (b as BatterRecord).obp)) || 'transparent' }}>{(batter as BatterRecord).obp.toFixed(3)}</td>
                                            <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor((batter as BatterRecord).slg, battersValues.map(b => (b as BatterRecord).slg)) || 'transparent' }}>{(batter as BatterRecord).slg.toFixed(3)}</td>
                                            <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor(batter.ztotal, battersValues.map(b => b.ztotal)) || 'transparent' }}>{batter.ztotal.toFixed(2)}</td>
                                        </tr>
                                    );
                                }
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {teamPitchers.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Pitchers</h2>
                        <table className="w-full table-auto border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-800">
                                    <th className="border border-gray-300 px-4 py-2">Player Name</th>
                                    <th className="border border-gray-300 px-4 py-2">IP</th>
                                    <th className="border border-gray-300 px-4 py-2">K</th>
                                    <th className="border border-gray-300 px-4 py-2">ERA</th>
                                    <th className="border border-gray-300 px-4 py-2">WHIP</th>
                                    <th className="border border-gray-300 px-4 py-2">BB/9</th>
                                    <th className="border border-gray-300 px-4 py-2">QS</th>
                                    <th className="border border-gray-300 px-4 py-2">SVH</th>
                                    <th className="border border-gray-300 px-4 py-2">zTotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamPitchers.map((pitcher, index) => {
                                    if (process.env.NODE_ENV)
                                        console.log(pitcher);
                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="border border-gray-300 px-4 py-2">{pitcher.name}</td>
                                            <td className="border border-gray-300 px-4 py-2">{pitcher.ip.toFixed(1)}</td>
                                            <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor((pitcher as PitcherRecord).so, pitchersValues.map(p => (p as PitcherRecord).so)) || 'transparent' }}>{(pitcher as PitcherRecord).so.toFixed(1)}</td>
                                            <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor((pitcher as PitcherRecord).era, pitchersValues.map(p => (p as PitcherRecord).era)) || 'transparent' }}>{(pitcher as PitcherRecord).era.toFixed(2)}</td>
                                            <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor((pitcher as PitcherRecord).whip, pitchersValues.map(p => (p as PitcherRecord).whip)) || 'transparent' }}>{(pitcher as PitcherRecord).whip.toFixed(2)}</td>
                                            <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor((pitcher as PitcherRecord).bb9, pitchersValues.map(p => (p as PitcherRecord).bb9)) || 'transparent' }}>{(pitcher as PitcherRecord).bb9.toFixed(2)}</td>
                                            <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor((pitcher as PitcherRecord).qs, pitchersValues.map(p => (p as PitcherRecord).qs)) || 'transparent' }}>{(pitcher as PitcherRecord).qs.toFixed(1)}</td>
                                            <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor((pitcher as PitcherRecord).svh, pitchersValues.map(p => (p as PitcherRecord).svh)) || 'transparent' }}>{(pitcher as PitcherRecord).svh.toFixed(1)}</td>
                                            <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor(pitcher.ztotal, pitchersValues.map(p => p.ztotal)) || 'transparent' }}>{pitcher.ztotal.toFixed(2)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
