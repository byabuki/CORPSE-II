import Link from 'next/link';
import { getTeamsFromDB, getCompleteBatterValues, getCompletePitcherValues } from '@/app/lib/helpers';

interface BatterRecord {
    name: string;
    pa: number;
    hr: number;
    sb: number;
    bb: number;
    tb: number;
    obp: number;
    slg: number;
}

interface PitcherRecord {
    name: string;
    ip: number;
    so: number;
    era: number;
    whip: number;
    bb9: number;
    qs: number;
    svh: number;
}

interface PageProps {
    params: Promise<{
        segments: string[];
    }>;
}

export default async function TeamPage({ params }: PageProps) {
    const teams = await getTeamsFromDB();
    const batterValues = await getCompleteBatterValues();
    const pitcherValues = await getCompletePitcherValues();

    const { segments } = await params;
    const teamName = decodeURIComponent(segments.join('/'));
    const teamPlayers = teams[teamName];

    const teamBatters = batterValues.filter(batter => teamPlayers.includes(batter.nameascii as string)) as unknown as BatterRecord[];
    const teamPitchers = pitcherValues.filter(pitcher => teamPlayers.includes(pitcher.nameascii as string)) as unknown as PitcherRecord[];


    if (!teamPlayers) {
        return (
            <div className="flex items-center justify-center min-h-full">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Team Not Found</h1>
                    <p className="text-gray-400 mb-8">The team &#34;{teamName}&#34; could not be found.</p>
                    <Link
                        href="/teams"
                        className="text-blue-400 hover:text-blue-300 underline"
                    >
                        ← Back to Teams
                    </Link>
                </div>
            </div>
        );
    }

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
                                </tr>
                            </thead>
                            <tbody>
                                {teamBatters.map((batter, index) => (



                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2">{batter.name}</td>
                                        <td className="border border-gray-300 px-4 py-2">{batter.pa.toFixed(1)}</td>
                                        <td className="border border-gray-300 px-4 py-2">{batter.hr.toFixed(1)}</td>
                                        <td className="border border-gray-300 px-4 py-2">{batter.sb.toFixed(1)}</td>
                                        <td className="border border-gray-300 px-4 py-2">{batter.bb.toFixed(1)}</td>
                                        <td className="border border-gray-300 px-4 py-2">{batter.tb.toFixed(1)}</td>
                                        <td className="border border-gray-300 px-4 py-2">{batter.obp.toFixed(3)}</td>
                                        <td className="border border-gray-300 px-4 py-2">{batter.slg.toFixed(3)}</td>
                                    </tr>
                                ))}
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
                                </tr>
                            </thead>
                            <tbody>
                                {teamPitchers.map((pitcher, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2">{pitcher.name}</td>
                                        <td className="border border-gray-300 px-4 py-2">{pitcher.ip.toFixed(1)}</td>
                                        <td className="border border-gray-300 px-4 py-2">{pitcher.so.toFixed(1)}</td>
                                        <td className="border border-gray-300 px-4 py-2">{pitcher.era.toFixed(2)}</td>
                                        <td className="border border-gray-300 px-4 py-2">{pitcher.whip.toFixed(2)}</td>
                                        <td className="border border-gray-300 px-4 py-2">{pitcher.bb9.toFixed(2)}</td>
                                        <td className="border border-gray-300 px-4 py-2">{pitcher.qs.toFixed(1)}</td>
                                        <td className="border border-gray-300 px-4 py-2">{pitcher.svh.toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="text-blue-400 hover:text-blue-300 underline"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
