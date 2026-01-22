import Link from 'next/link';
import { getTeamsFromDB } from '@/app/lib/helpers';

export default async function TeamsPage() {
    const teams = await getTeamsFromDB();
    const teamNames = Object.keys(teams);

    return (
        <div className="min-h-full p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center">CORPSE II Teams</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamNames.map((teamName) => (
                        <Link
                            key={teamName}
                            href={`/teams/${encodeURIComponent(teamName)}`}
                            className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <h2 className="text-2xl font-semibold mb-2">{teamName}</h2>
                            <p className="text-gray-300">
                                {teams[teamName].length} players
                            </p>
                        </Link>
                    ))}
                </div>

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
