'use client';

import { useEffect, useState } from 'react';

const LOADING_MESSAGES = [
    '⏳',
    '⚾️',
    '📉',
    '📈',
    '📊',
    '🔜',
    'Loading',
    'Loading...',
    'Reloading the matrix',
    'Making your team projection worse',
    'Boiling the farfalle',
    'Simmering the pomodoro',
    'Comma separating some values',
    'Installing Excel',
    'Copy pasting from Google Sheets',
    'How do auction values work again?',
    'Imagine not having a projection system',
];

export default function LoadingIndicator() {
    const [loadingMessage, setLoadingMessage] = useState<string>();

    useEffect(() => {
        const randomMessage = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoadingMessage(randomMessage);
    }, []);

    return (
        <div className="min-h-full p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center">{loadingMessage}</h1>
            </div>
        </div>
    );
}