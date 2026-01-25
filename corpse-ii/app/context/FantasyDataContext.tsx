'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { TeamsAndPlayers, PlayerRecord } from '../lib/types';
import { getCompleteBatterValues, getCompletePitcherValues, getTeamsAndPlayers } from '../lib/api';

interface FantasyDataContextType {
    teamsAndPlayers: TeamsAndPlayers;
    setTeamsAndPlayers: (newData: TeamsAndPlayers) => void;
    battersValues: PlayerRecord[] | undefined;
    setBattersValues: (values: PlayerRecord[] | undefined) => void;
    pitchersValues: PlayerRecord[] | undefined;
    setPitchersValues: (values: PlayerRecord[] | undefined) => void;
}

const FantasyDataContext = createContext<FantasyDataContextType | undefined>(undefined);

export function useFantasyData() {
    const context = useContext(FantasyDataContext);
    if (context === undefined) {
        throw new Error('useFantasyData must be used within a FantasyDataProvider');
    }
    return context;
}

export function FantasyDataProvider({ children }: { children: ReactNode }) {
    const [teamsAndPlayers, setTeamsAndPlayersState] = useState<TeamsAndPlayers>({});
    const [battersValues, setBattersValues] = useState<PlayerRecord[]>();
    const [pitchersValues, setPitchersValues] = useState<PlayerRecord[]>();

    useEffect(() => {
        async function getCorpseValues() {
            async function getBatterValues() {
                try {
                    const result = (await getCompleteBatterValues()) as unknown as PlayerRecord[];
                    setBattersValues(result);
                } catch (e) {
                    console.error(`Could not retrieve batters data: ${e}`);
                    setBattersValues([]);
                }
            }

            async function getPitcherValues() {
                try {
                    const result = (await getCompletePitcherValues()) as unknown as PlayerRecord[];
                    setPitchersValues(result);
                } catch (e) {
                    console.error(`Could not retrieve pitchers data: ${e}`);
                    setPitchersValues([]);
                }
            }

            async function fetchTeams() {
                try {
                    const result = await getTeamsAndPlayers();
                    setTeamsAndPlayersState(result);
                } catch (error) {
                    console.error('Failed to fetch teams:', error);
                }
            };

            await Promise.all([getBatterValues(), getPitcherValues(), fetchTeams()]);
            console.log('completed fetch of all CORPSE data');
        }
        console.log('fetch players and values');
        getCorpseValues();
    }, []);

    const setTeamsAndPlayers = (newData: TeamsAndPlayers) => {
        setTeamsAndPlayersState(newData);
    };

    const value = {
        teamsAndPlayers,
        setTeamsAndPlayers,
        battersValues,
        setBattersValues,
        pitchersValues,
        setPitchersValues,
    };

    return (
        <FantasyDataContext.Provider value={value}>
            {children}
        </FantasyDataContext.Provider>
    );
}
