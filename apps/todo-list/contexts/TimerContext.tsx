import React, { createContext, useContext, useState, useCallback } from 'react';

interface TimerContextType {
    isTimerRunning: boolean;
    setTimerRunning: (running: boolean) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    const setTimerRunning = useCallback((running: boolean) => {
        setIsTimerRunning(running);
    }, []);

    return (
        <TimerContext.Provider value={{ isTimerRunning, setTimerRunning }}>
            {children}
        </TimerContext.Provider>
    );
}

export function useTimer() {
    const context = useContext(TimerContext);
    if (context === undefined) {
        throw new Error('useTimer must be used within a TimerProvider');
    }
    return context;
}
