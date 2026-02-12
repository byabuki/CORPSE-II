'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFantasyData } from './context/FantasyDataContext';
import LoadingIndicator from './components/LoadingIndicator';
import { calculateMean, calculateStdDev } from './lib/stats';
import { getColor } from './lib/helpers';

const PER_PLAYER_ENABLED = false;

export default function Home() {
    const {
        battersValues,
        isLoadingComplete,
        pitchersValues,
        teamsAndPlayers,
    } = useFantasyData();

    // State for chart view toggle
    const [view, setView] = useState('both');

    if (!isLoadingComplete)
        return <LoadingIndicator />;

    const batterTeamSums = Object.entries(teamsAndPlayers).reduce((batterAcc, [team, players]) => {
        batterAcc[team] = 0;
        for (const playerName of players) {
            const batter = battersValues!.find(b => b.nameascii === playerName && b.team === team);
            if (batter) {
                if (process.env.NODE_ENV)
                    console.log(`add batter ${batter.nameascii} to team ${team}, value ${batter.ztotal}`);
                const ztotal = batter.ztotal > 0 ? batter.ztotal : 0;
                batterAcc[team] += ztotal;
            }
        }
        return batterAcc;
    }, {} as Record<string, number>);

    const batterValuesAvg = calculateMean(Object.values(batterTeamSums));
    const batterValuesStdDev = calculateStdDev(Object.values(batterTeamSums), batterValuesAvg);
    const batterZzs = Object.fromEntries(
        Object.entries(batterTeamSums).map(([team, zTotalSum]) =>
            [team, ((zTotalSum - batterValuesAvg) / batterValuesStdDev) ]
        )
    );

    const pitcherTeamSums = Object.entries(teamsAndPlayers).reduce((pitcherAcc, [team, players]) => {
        pitcherAcc[team] = 0;
        for (const playerName of players) {
            const pitcher = pitchersValues!.find(p => p.nameascii === playerName && p.team === team);
            if (pitcher) {
                if (process.env.NODE_ENV)
                    console.log(`add pitcher ${pitcher.nameascii} to team ${team}, value ${pitcher.ztotal}`);
                const ztotal = pitcher.ztotal > 0 ? pitcher.ztotal : 0;
                pitcherAcc[team] += ztotal;
            }
        }
        return pitcherAcc;
    }, {} as Record<string, number>);

    const pitcherValuesAvg = calculateMean(Object.values(pitcherTeamSums));
    const pitcherValuesStdDev = calculateStdDev(Object.values(pitcherTeamSums), pitcherValuesAvg);
    const pitcherZzs = Object.fromEntries(
        Object.entries(pitcherTeamSums).map(([team, zTotalSum]) =>
            [team, ((zTotalSum - pitcherValuesAvg) / pitcherValuesStdDev) ]
        )
    );

    const offPlus = Object.fromEntries(
        Object.entries(batterZzs).map(([team, z]) => [team, ((z - 0) / 3 + 1) * 100])
    );

    const pitchPlus = Object.fromEntries(
        Object.entries(pitcherZzs).map(([team, z]) => [team, ((z - 0) / 3 + 1) * 100])
    );

    // Calculate player counts per team
    const batterCounts = Object.entries(teamsAndPlayers).reduce((acc, [team, players]) => {
        let count = 0;
        for (const playerName of players) {
            const batter = battersValues!.find(b => b.nameascii === playerName && b.team === team);
            if (batter) {
                count++;
            }
        }
        acc[team] = count;
        return acc;
    }, {} as Record<string, number>);

    const pitcherCounts = Object.entries(teamsAndPlayers).reduce((acc, [team, players]) => {
        let count = 0;
        for (const playerName of players) {
            const pitcher = pitchersValues!.find(p => p.nameascii === playerName && p.team === team);
            if (pitcher) {
                count++;
            }
        }
        acc[team] = count;
        return acc;
    }, {} as Record<string, number>);

    // Calculate per-player values
    const offPlusPerBatter = Object.fromEntries(
        Object.entries(offPlus).map(([team, value]) => [team, value / (batterCounts[team] || 1)])
    );

    const pitchPlusPerPitcher = Object.fromEntries(
        Object.entries(pitchPlus).map(([team, value]) => [team, value / (pitcherCounts[team] || 1)])
    );

    const teamZzTotals = Object.entries(teamsAndPlayers).reduce((teamZzTotalsAcc, [team, ]) => {
        teamZzTotalsAcc[team] = batterZzs[team] + pitcherZzs[team];

        return teamZzTotalsAcc;
    }, {} as Record<string, number>);

    const sortedTeams = Object.keys(teamsAndPlayers).sort((a, b) => teamZzTotals[b] - teamZzTotals[a]);

    // Prepare chart data
    const chartData = Array.from(new Set([...Object.keys(batterTeamSums), ...Object.keys(pitcherTeamSums)])).sort().map(team => ({
        name: team,
        battersValue: offPlus[team] || 0,
        pitchersValue: pitchPlus[team] || 0,
        battersPerPlayerValue: offPlusPerBatter[team] || 0,
        pitchersPerPlayerValue: pitchPlusPerPitcher[team] || 0
    }));

    return (
        <div className="min-h-full p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center">Scioscia&#39;s Pasta</h1>

                <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Team Values Comparison</h2>

                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={() => setView('both')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                view === 'both'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Both
                        </button>
                        <button
                            onClick={() => setView('batters')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                view === 'batters'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Offense+ Only
                        </button>
                        <button
                            onClick={() => setView('pitchers')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                view === 'pitchers'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Pitching+ Only
                        </button>
                        {PER_PLAYER_ENABLED ? (
                            <>
                                <button
                                    onClick={() => setView('battersPerPlayer')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        view === 'battersPerPlayer'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Offense+ per Batter
                                </button>
                                <button
                                    onClick={() => setView('pitchersPerPlayer')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        view === 'pitchersPerPlayer'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Pitching+ per Pitcher
                                </button>
                            </>
                        ) : null}
                    </div>

                    <div className="h-[500px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={120} dx={-40} dy={40} />
                                <YAxis />
                                <Tooltip />
                                <Legend verticalAlign="top" />
                                {(view === 'both' || view === 'batters') && (
                                    <Bar dataKey="battersValue" fill="#3b82f6" name="Offense+" stackId={view === 'both' ? 'stack' : undefined} />
                                )}
                                {(view === 'both' || view === 'pitchers') && (
                                    <Bar dataKey="pitchersValue" fill="#bd2929" name="Pitching+" stackId={view === 'both' ? 'stack' : undefined} />
                                )}
                                {view === 'battersPerPlayer' && (
                                    <Bar dataKey="battersPerPlayerValue" fill="#3b82f6" name="Offense+ per Batter" />
                                )}
                                {view === 'pitchersPerPlayer' && (
                                    <Bar dataKey="pitchersPerPlayerValue" fill="#bd2929" name="Pitching+ per Pitcher" />
                                )}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <table className="w-full table-auto border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                            <th className="border border-gray-300 px-4 py-2">Team</th>
                            <th className="border border-gray-300 px-4 py-2">Batters zScore</th>
                            <th className="border border-gray-300 px-4 py-2">Pitchers zScore</th>
                            <th className="border border-gray-300 px-4 py-2">Total zScore</th>
                            <th className="border border-gray-300 px-4 py-2">Wins</th>
                            <th className="border border-gray-300 px-4 py-2">Losses</th>
                            <th className="border border-gray-300 px-4 py-2">Win%</th>
                            <th className="border border-gray-300 px-4 py-2">Offense+</th>
                            <th className="border border-gray-300 px-4 py-2">Pitching+</th>
                            {PER_PLAYER_ENABLED ? (
                                <>
                                    <th className="border border-gray-300 px-4 py-2">Offense+ per Batter</th>
                                    <th className="border border-gray-300 px-4 py-2">Pitching+ per Pitcher</th>
                                </>
                            ) : null}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTeams.map(team => {
                            const battersZScore = batterZzs[team];
                            const pitchersZScore = pitcherZzs[team];
                            const totalZScore = teamZzTotals[team];
                            const wins = teamZzTotals[team] * 23 / 2 + 132;
                            const losses = 264 - wins;
                            const winPercentage = wins / 264;
                            return (
                                <tr key={team} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">{team}</td>
                                    <td
                                        className="border border-gray-300 px-4 py-2"
                                        style={{ backgroundColor: getColor(battersZScore, Object.values(batterZzs)) || 'transparent' }}
                                    >
                                        {battersZScore.toFixed(2)}
                                    </td>
                                    <td
                                        className="border border-gray-300 px-4 py-2"
                                        style={{ backgroundColor: getColor(pitchersZScore, Object.values(pitcherZzs)) || 'transparent' }}
                                    >
                                        {pitchersZScore.toFixed(2)}
                                    </td>
                                    <td
                                        className="border border-gray-300 px-4 py-2"
                                        style={{ backgroundColor: getColor(totalZScore, Object.values(teamZzTotals)) || 'transparent' }}
                                    >
                                        {totalZScore.toFixed(2)}
                                    </td>
                                    <td
                                        className="border border-gray-300 px-4 py-2"
                                        style={{ backgroundColor: 'transparent' }}
                                    >
                                        {wins.toFixed(1)}
                                    </td>
                                    <td
                                        className="border border-gray-300 px-4 py-2"
                                        style={{ backgroundColor: 'transparent' }}
                                    >
                                        {losses.toFixed(1)}
                                    </td>
                                    <td
                                        className="border border-gray-300 px-4 py-2"
                                        style={{ backgroundColor: getColor(totalZScore, Object.values(teamZzTotals)) || 'transparent' }}
                                    >
                                        {winPercentage.toFixed(3)}
                                    </td>
                                    <td
                                        className="border border-gray-300 px-4 py-2"
                                        style={{ backgroundColor: getColor(battersZScore, Object.values(batterZzs)) || 'transparent' }}
                                    >
                                        {offPlus[team].toFixed(3)}
                                    </td>
                                    <td
                                        className="border border-gray-300 px-4 py-2"
                                        style={{ backgroundColor: getColor(pitchersZScore, Object.values(pitcherZzs)) || 'transparent' }}
                                    >
                                        {pitchPlus[team].toFixed(3)}
                                    </td>
                                    {PER_PLAYER_ENABLED ? (
                                        <>
                                            <td
                                                className="border border-gray-300 px-4 py-2"
                                                style={{ backgroundColor: getColor(battersZScore, Object.values(batterZzs)) || 'transparent' }}
                                            >
                                                {offPlusPerBatter[team].toFixed(3)}
                                            </td>
                                            <td
                                                className="border border-gray-300 px-4 py-2"
                                                style={{ backgroundColor: getColor(pitchersZScore, Object.values(pitcherZzs)) || 'transparent' }}
                                            >
                                                {pitchPlusPerPitcher[team].toFixed(3)}
                                            </td>
                                        </>
                                    ) : null}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
