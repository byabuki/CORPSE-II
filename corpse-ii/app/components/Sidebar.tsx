'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [teams, setTeams] = useState<string[]>([]);

    useEffect(() => {
        // Fetch teams on client side
        const fetchTeams = async () => {
            try {
                const response = await fetch('/api/v1/fetch-teams');
                const data = await response.json();
                const teamNames = Object.keys(data).sort();
                setTeams(teamNames);
            } catch (error) {
                console.error('Failed to fetch teams:', error);
            }
        };

        fetchTeams();

        // Check initial window size
        const checkWidth = () => {
            setIsCollapsed(window.innerWidth < 1024);
        };

        checkWidth();

        // Add resize listener
        window.addEventListener('resize', checkWidth);

        return () => window.removeEventListener('resize', checkWidth);
    }, []);

    return (
        <aside className={`bg-amber-50 border-r border-amber-200 ${isCollapsed ? 'w-16' : 'w-64'}`}>
            <div className="p-4">
                {isCollapsed && (
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="w-full mb-4 p-2 bg-amber-100 hover:bg-amber-200 rounded text-black"
                        aria-label="Expand sidebar"
                    >
                        ☰
                    </button>
                )}
                {!isCollapsed && (
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="w-full mb-4 p-2 bg-amber-100 hover:bg-amber-200 rounded text-black"
                        aria-label="Collapse sidebar"
                    >
                        ☰
                    </button>
                )}
            </div>
            <nav className={`${isCollapsed ? 'hidden' : 'p-6'}`}>
                <ul className="space-y-4">
                    <li>
                        <Link
                            href="/"
                            className="block text-black hover:bg-amber-100 px-3 py-2 rounded transition-colors"
                        >
                            Home
                        </Link>
                    </li>
                    {teams.map((teamName) => (
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
