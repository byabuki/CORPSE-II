import { getBatterValuesFromDB, getPitcherValuesFromDB } from '@/app/lib/helpers';

interface PlayerRecord {
    team: string;
    ztotal: number;
}

export default async function Home() {
    const batterValues = (await getBatterValuesFromDB()) as unknown as PlayerRecord[];
    const pitcherValues = (await getPitcherValuesFromDB()) as unknown as PlayerRecord[];

    const batterTeamSums = batterValues.reduce((acc, batter) => {
        const team = batter.team;
        const ztotal = batter.ztotal;
        if (!acc[team]) acc[team] = 0;
        acc[team] += ztotal;
        return acc;
    }, {} as Record<string, number>);

    const pitcherTeamSums = pitcherValues.reduce((acc, pitcher) => {
        const team = pitcher.team;
        const ztotal = pitcher.ztotal;
        if (!acc[team]) acc[team] = 0;
        acc[team] += ztotal;
        return acc;
    }, {} as Record<string, number>);

    // Calculate percentiles for batters zTotal color coding
    const batterValuesList = Object.values(batterTeamSums).filter(val => val > 0).sort((a, b) => a - b);
    const getBatterPercentile = (value: number): number => {
        if (batterValuesList.length === 0) return 0;
        const index = batterValuesList.findIndex(val => val >= value);
        return index / (batterValuesList.length - 1);
    };

    const getBatterColor = (value: number): string | null => {
        const percentile = getBatterPercentile(value);
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

    // Calculate percentiles for pitchers zTotal color coding
    const pitcherValuesList = Object.values(pitcherTeamSums).filter(val => val > 0).sort((a, b) => a - b);
    const getPitcherPercentile = (value: number): number => {
        if (pitcherValuesList.length === 0) return 0;
        const index = pitcherValuesList.findIndex(val => val >= value);
        return index / (pitcherValuesList.length - 1);
    };

    const getPitcherColor = (value: number): string | null => {
        const percentile = getPitcherPercentile(value);
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

    return (
        <div className="min-h-full p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center">Scioscia&#39;s Pasta</h1>

                <table className="w-full table-auto border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2">Team</th>
                            <th className="border border-gray-300 px-4 py-2">Batters zTotal</th>
                            <th className="border border-gray-300 px-4 py-2">Pitchers zTotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from(new Set([...Object.keys(batterTeamSums), ...Object.keys(pitcherTeamSums)])).sort().map(team => {
                            const batterValue = batterTeamSums[team] || 0;
                            const pitcherValue = pitcherTeamSums[team] || 0;
                            return (
                                <tr key={team} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">{team}</td>
                                    <td
                                        className="border border-gray-300 px-4 py-2"
                                        style={{ backgroundColor: batterValue > 0 ? (getBatterColor(batterValue) || 'transparent') : 'transparent' }}
                                    >
                                        {batterValue.toFixed(3)}
                                    </td>
                                    <td
                                        className="border border-gray-300 px-4 py-2"
                                        style={{ backgroundColor: pitcherValue > 0 ? (getPitcherColor(pitcherValue) || 'transparent') : 'transparent' }}
                                    >
                                        {pitcherValue.toFixed(3)}
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
