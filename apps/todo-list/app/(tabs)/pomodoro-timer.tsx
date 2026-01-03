import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Vibration } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function PomodoroTimerPage() {
    const DEFAULT_MIN = 25;
    const [totalSeconds, setTotalSeconds] = useState(DEFAULT_MIN * 60);
    const [remaining, setRemaining] = useState(DEFAULT_MIN * 60);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        setRemaining(totalSeconds);
    }, [totalSeconds]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current as any);
        };
    }, []);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setRemaining((r) => {
                    if (r <= 1) {
                        // finished
                        if (intervalRef.current) clearInterval(intervalRef.current as any);
                        setIsRunning(false);
                        // vibrate and alert
                        Vibration.vibrate([500, 200, 500]);
                        Alert.alert('Timer finished', 'Pomodoro session complete');
                        return 0;
                    }
                    return r - 1;
                });
            }, 1000) as any;
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current as any);
            intervalRef.current = null;
        };
    }, [isRunning]);

    const startPause = () => {
        if (isRunning) {
            setIsRunning(false);
        } else {
            // can't start if no time
            if (remaining <= 0) setRemaining(totalSeconds);
            setIsRunning(true);
        }
    };

    const reset = () => {
        if (intervalRef.current) clearInterval(intervalRef.current as any);
        setIsRunning(false);
        setRemaining(totalSeconds);
    };

    const setPreset = (m: number) => {
        const secs = m * 60;
        setTotalSeconds(secs);
        setRemaining(secs);
        setIsRunning(false);
    };

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    return (
        <View style={styles.container}>

            <View style={styles.timerBox}>
                <Text style={styles.timerText}>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</Text>
            </View>

            <View style={styles.presetsRow}>
                <TouchableOpacity style={styles.preset} onPress={() => setPreset(25)}><Text style={styles.presetText}>25</Text></TouchableOpacity>
                <TouchableOpacity style={styles.preset} onPress={() => setPreset(15)}><Text style={styles.presetText}>15</Text></TouchableOpacity>
                <TouchableOpacity style={styles.preset} onPress={() => setPreset(5)}><Text style={styles.presetText}>5</Text></TouchableOpacity>
            </View>
            <View style={styles.controlsRow}>
                <TouchableOpacity style={styles.iconButton} onPress={startPause} accessibilityLabel={isRunning ? 'Pause' : 'Start'}>
                    <FontAwesome name={isRunning ? "pause" : "play"} size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={reset} accessibilityLabel="Reset">
                    <FontAwesome name="rotate-right" size={24} color="white" />
                </TouchableOpacity>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    timerBox: { alignItems: 'center', justifyContent: 'center', padding: 20, marginBottom: 28 },
    timerText: { fontSize: 84, fontWeight: '700' },
    controlsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 0 },
    button: { backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginHorizontal: 8 },
    buttonText: { color: '#fff', fontWeight: '600' },
    secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ccc' },
    secondaryText: { color: '#333' },
    iconButton: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#007bff', alignItems: 'center', justifyContent: 'center', marginHorizontal: 8 },
    iconText: { color: '#fff', fontSize: 28, fontWeight: '700' },
    presetsRow: { alignItems: 'center', paddingHorizontal: 16, marginBottom: 20, flexDirection: 'row', justifyContent: 'center' },
    preset: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: '#ddd', marginRight: 8, alignItems: 'center', justifyContent: 'center' },
    presetText: { fontSize: 16, fontWeight: '600' },
});
