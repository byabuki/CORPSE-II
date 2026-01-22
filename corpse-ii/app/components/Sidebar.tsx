import Link from 'next/link';
import { getTeamsFromDB } from '@/app/lib/helpers';

export default async function Sidebar() {
    const teams = await getTeamsFromDB();
    const teamNames = Object.keys(teams).sort();

    return (
        <aside className="w-64 bg-amber-50 border-r border-amber-200">
            <nav className="p-6">
                <ul className="space-y-4">
                    <li>
                        <Link
                            href="/"
                            className="block text-black hover:bg-amber-100 px-3 py-2 rounded transition-colors"
                        >
                            Home
                        </Link>
                    </li>
                    {teamNames.map((teamName) => (
                        <li key={teamName}>
                            <Link
                                href={`/teams/${encodeURIComponent(teamName)}`}
                                className="block text-black hover:bg-amber-100 px-3 py-2 rounded transition-colors"
                            >
                                {teamName}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
