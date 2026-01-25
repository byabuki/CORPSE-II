'use client';

import { useFantasyData } from '../context/FantasyDataContext';
import { useEffect, useState } from 'react';
import LoadingIndicator from '../components/LoadingIndicator';
import { BatterRecord } from '../lib/types';
import { getColor, statKeys, getIsRateStat, getWeightedStatValue } from '../lib/helpers';
import { getAllBatters } from '../lib/api';

export default function RemainingBattersPage() {
    const {
        battersValues,
        isLoadingComplete,
        battersConfig
    } = useFantasyData();
    const [currentPage, setCurrentPage] = useState(1);
    const [allBatters, setAllBatters] = useState<BatterRecord[]>();

    useEffect(() => {
        async function fetchAllBatters() {
            const result = await getAllBatters();
            console.log(result);
            setAllBatters(result);
        }
        fetchAllBatters();
    }, []);

    if (!isLoadingComplete || !allBatters)
        return <LoadingIndicator />;

    // Filter remaining batters: start with allBatters, remove those with player_id matching battersValues
    const remainingBatters = allBatters.filter(batter =>
        !battersValues?.some(val => (val as BatterRecord).player_id === batter.player_id)
    ).sort((a, b) => b.ztotal - a.ztotal);

    console.log(battersValues);

    const battersPerPage = 25;
    const totalPages = Math.ceil(remainingBatters.length / battersPerPage);
    const startIndex = (currentPage - 1) * battersPerPage;
    const endIndex = startIndex + battersPerPage;
    const currentBatters = remainingBatters.slice(startIndex, endIndex);

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
                    <h1 className="text-4xl font-bold">Remaining Batters</h1>
                    <p className="text-gray-400 mt-2">{remainingBatters.length} batters available</p>
                </div>

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
                            {currentBatters.map((batter, index) => (
                                <tr key={batter.nameascii || index} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">{batter.name}</td>
                                    <td className="border border-gray-300 px-4 py-2">{batter.pa.toFixed(1)}</td>
                                    <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor(batter.hr, battersValues!.map(b => (b as BatterRecord).hr)) || 'transparent' }}>{batter.hr.toFixed(1)}</td>
                                    <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor(batter.sb, battersValues!.map(b => (b as BatterRecord).sb)) || 'transparent' }}>{batter.sb.toFixed(1)}</td>
                                    <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor(batter.bb, battersValues!.map(b => (b as BatterRecord).bb)) || 'transparent' }}>{batter.bb.toFixed(1)}</td>
                                    <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor(batter.tb, battersValues!.map(b => (b as BatterRecord).tb)) || 'transparent' }}>{batter.tb.toFixed(1)}</td>
                                    <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor(getWeightedStatValue(batter, 'obp', getIsRateStat(battersConfig, statKeys.batter.obp)), battersValues!.map(b => getWeightedStatValue(b as BatterRecord, 'obp', getIsRateStat(battersConfig, statKeys.batter.obp)))) || 'transparent' }}>{batter.obp.toFixed(3)}</td>
                                    <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor(getWeightedStatValue(batter, 'slg', getIsRateStat(battersConfig, statKeys.batter.slg)), battersValues!.map(b => getWeightedStatValue(b as BatterRecord, 'slg', getIsRateStat(battersConfig, statKeys.batter.slg)))) || 'transparent' }}>{batter.slg.toFixed(3)}</td>
                                    <td className="border border-gray-300 px-4 py-2" style={{ backgroundColor: getColor(batter.ztotal, battersValues!.map(b => b.ztotal)) || 'transparent' }}>{batter.ztotal.toFixed(2)}</td>
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