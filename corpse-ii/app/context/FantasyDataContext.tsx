'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { TeamsAndPlayers, PlayerRecord, CategoriesConfig } from '../lib/types';
import { getCompleteBatterValues, getCompletePitcherValues, getTeamsAndPlayers } from '../lib/api';

interface FantasyDataContextType {
    teamsAndPlayers: TeamsAndPlayers;
    setTeamsAndPlayers: (newData: TeamsAndPlayers) => void;
    battersValues: PlayerRecord[] | undefined;
    setBattersValues: (values: PlayerRecord[] | undefined) => void;
    pitchersValues: PlayerRecord[] | undefined;
    setPitchersValues: (values: PlayerRecord[] | undefined) => void;
    battersConfig: CategoriesConfig | undefined;
    setBattersConfig: (config: CategoriesConfig | undefined) => void;
    pitchersConfig: CategoriesConfig | undefined;
    setPitchersConfig: (config: CategoriesConfig | undefined) => void;
    isLoadingComplete: boolean;
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
    const [battersConfig, setBattersConfig] = useState<CategoriesConfig>();
    const [pitchersConfig, setPitchersConfig] = useState<CategoriesConfig>();
    const [isLoadingComplete, setIsLoadingComplete] = useState<boolean>(false);

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
            }

            async function fetchBattersConfig() {
                try {
                    const battersConfigRaw = await fetch('https://y3fmv3sypyoh9kpr.public.blob.vercel-storage.com/batters_config_v1.json');
                    const battersConfig = await battersConfigRaw.json();
                    setBattersConfig(battersConfig);
                } catch (error) {
                    console.error('Failed to fetch batters config:', error);
                }
            }

            async function fetchPitchersConfig() {
                try {
                    const pitchersConfigRaw = await fetch(
                        'https://y3fmv3sypyoh9kpr.public.blob.vercel-storage.com/pitchers_config_v1.json'
                    );
                    const pitchersConfig = await pitchersConfigRaw.json();
                    setPitchersConfig(pitchersConfig);
                } catch (error) {
                    console.error('Failed to fetch pitchers config:', error);
                }
            }

            await Promise.all([getBatterValues(), getPitcherValues(), fetchTeams(), fetchBattersConfig(), fetchPitchersConfig()]);
            console.log('completed fetch of all CORPSE data');
            setIsLoadingComplete(true);
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
        battersConfig,
        setBattersConfig,
        pitchersConfig,
        setPitchersConfig,
        isLoadingComplete,
    };

    return (
        <FantasyDataContext.Provider value={value}>
            {children}
        </FantasyDataContext.Provider>
    );
}
