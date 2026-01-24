'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFantasyData } from './context/FantasyDataContext';
import LoadingIndicator from './components/LoadingIndicator';

function getPercentile(value: number, values: number[]) {
    if (values.length === 0) return 0;
    const index = values.findIndex(val => val >= value);
    return index / (values.length - 1);
};

function getColor(value: number, values: number[]): string | null {
    const percentile = getPercentile(value, values);
    if (percentile === 0.5) return null; // no color at 50th percentile
    let hue: number;
    let saturation: number;
    if (percentile < 0.5) {
        hue = 0;
        saturation = (0.5 - percentile) * 140;
    } else {
        hue = 120;
        saturation = (percentile - 0.5) * 140;
    }
    saturation = Math.min(saturation, 100);
    return `hsl(${hue}, ${saturation}%, 50%)`;
};

export default function Home() {
    const {
        battersValues,
        pitchersValues,
    } = useFantasyData();

    // State for chart view toggle - must be at top level before any conditional returns
    const [view, setView] = useState('both');

    if (!battersValues || !pitchersValues)
        return <LoadingIndicator />;

    const batterTeamSums = battersValues.reduce((acc, batter) => {
        const team = batter.team;
        const ztotal = batter.ztotal > 0 ? batter.ztotal : 0;
        if (!acc[team])
            acc[team] = 0;
        acc[team] += ztotal;
        return acc;
    }, {} as Record<string, number>);

    const pitcherTeamSums = pitchersValues.reduce((acc, pitcher) => {
        const team = pitcher.team;
        const ztotal = pitcher.ztotal > 0 ? pitcher.ztotal : 0;
        if (!acc[team])
            acc[team] = 0;
        acc[team] += ztotal;
        return acc;
    }, {} as Record<string, number>);

    // Calculate percentiles for batters zTotal color coding
    const batterValuesList = Object.values(batterTeamSums).filter(val => val > 0).sort((a, b) => a - b);

    // Calculate percentiles for pitchers zTotal color coding
    const pitcherValuesList = Object.values(pitcherTeamSums).filter(val => val > 0).sort((a, b) => a - b);

    // Prepare chart data
    const chartData = Array.from(new Set([...Object.keys(batterTeamSums), ...Object.keys(pitcherTeamSums)])).sort().map(team => ({
        name: team,
        battersValue: batterTeamSums[team] || 0,
        pitchersValue: pitcherTeamSums[team] || 0
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
                            Batters Value Only
                        </button>
                        <button
                            onClick={() => setView('pitchers')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                view === 'pitchers'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Pitchers Value Only
                        </button>
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
                                    <Bar dataKey="battersValue" fill="#3b82f6" name="Batters Value" stackId={view === 'both' ? 'stack' : undefined} />
                                )}
                                {(view === 'both' || view === 'pitchers') && (
                                    <Bar dataKey="pitchersValue" fill="#bd2929" name="Pitchers Value" stackId={view === 'both' ? 'stack' : undefined} />
                                )}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <table className="w-full table-auto border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                            <th className="border border-gray-300 px-4 py-2">Team</th>
                            <th className="border border-gray-300 px-4 py-2">Batters zTotal</th>
                            <th className="border border-gray-300 px-4 py-2">Pitchers zTotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from(new Set([...Object.keys(batterTeamSums), ...Object.keys(pitcherTeamSums)])).sort().map(team => {
                            const battersValue = batterTeamSums[team] || 0;
                            const pitchersValue = pitcherTeamSums[team] || 0;
                            return (
                                <tr key={team} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">{team}</td>
                                    <td
                                        className="border border-gray-300 px-4 py-2"
                                        style={{ backgroundColor: battersValue > 0 ? (getColor(battersValue, batterValuesList) || 'transparent') : 'transparent' }}
                                    >
                                        {battersValue.toFixed(3)}
                                    </td>
                                    <td
                                        className="border border-gray-300 px-4 py-2"
                                        style={{ backgroundColor: pitchersValue > 0 ? (getColor(pitchersValue, pitcherValuesList) || 'transparent') : 'transparent' }}
                                    >
                                        {pitchersValue.toFixed(3)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
