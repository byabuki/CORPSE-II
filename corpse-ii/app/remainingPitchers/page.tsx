'use client';

import { useFantasyData } from '../context/FantasyDataContext';
import { useEffect, useState } from 'react';
import LoadingIndicator from '../components/LoadingIndicator';
import { PitcherRecord } from '../lib/types';
import { getColor } from '../lib/helpers';
import { getAllPitchers } from '../lib/api';

export default function RemainingPitchersPage() {
    const { pitchersValues, teamsAndPlayers } = useFantasyData();
    const [currentPage, setCurrentPage] = useState(1);
    const [allPitchers, setAllPitchers] = useState<PitcherRecord[]>();

    useEffect(() => {
        async function fetchAllPitchers() {
            const result = await getAllPitchers();
            console.log(result);
            setAllPitchers(result);
        }
        fetchAllPitchers();
    }, []);

    if (Object.keys(teamsAndPlayers).length === 0 || !pitchersValues || !allPitchers)
        return <LoadingIndicator />;

    // Filter remaining pitchers: start with allPitchers, remove those with player_id matching pitchersValues
    const remainingPitchers = allPitchers.filter(pitcher =>
        !pitchersValues?.some(val => (val as PitcherRecord).player_id === pitcher.player_id)
    ).sort((a, b) => b.ztotal - a.ztotal);

    console.log(pitchersValues);

    const pitchersPerPage = 25;
    const totalPages = Math.ceil(remainingPitchers.length / pitchersPerPage);
    const startIndex = (currentPage - 1) * pitchersPerPage;
    const endIndex = startIndex + pitchersPerPage;
    const currentPitchers = remainingPitchers.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="min-h-full p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold">Remaining Pitchers</h1>
                    <p className="text-gray-400 mt-2">{remainingPitchers.length} pitchers available</p>
                </div>

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
                            {currentPitchers.map((pitcher, index) => (
                                <tr key={pitcher.nameascii || index} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">{pitcher.name}</td>
                                    <td className="border border-gray-300 px-4 py-2">{pitcher.ip.toFixed(1)}</td>
                                    <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor(pitcher.so, pitchersValues.map(p => (p as PitcherRecord).so)) || 'transparent' }}>{pitcher.so.toFixed(1)}</td>
                                    <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor(pitcher.era, pitchersValues.map(p => (p as PitcherRecord).era)) || 'transparent' }}>{pitcher.era.toFixed(2)}</td>
                                    <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor(pitcher.whip, pitchersValues.map(p => (p as PitcherRecord).whip)) || 'transparent' }}>{pitcher.whip.toFixed(2)}</td>
                                    <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor(pitcher.bb9, pitchersValues.map(p => (p as PitcherRecord).bb9)) || 'transparent' }}>{pitcher.bb9.toFixed(2)}</td>
                                    <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor(pitcher.qs, pitchersValues.map(p => (p as PitcherRecord).qs)) || 'transparent' }}>{pitcher.qs.toFixed(1)}</td>
                                    <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor(pitcher.svh, pitchersValues.map(p => (p as PitcherRecord).svh)) || 'transparent' }}>{pitcher.svh.toFixed(1)}</td>
                                    <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor(pitcher.ztotal, pitchersValues.map(p => p.ztotal)) || 'transparent' }}>{pitcher.ztotal.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="mt-4 flex justify-between items-center">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                        >
                            Previous
                        </button>
                        <span className="text-gray-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}