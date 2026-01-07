import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import ModalBase from '../ModalBase';
import { getNoteForTask, saveTaskNote } from '../../services/taskNotes';

interface Props {
    taskId: string;
}

const MAX_CHARACTERS = 50000;
const AUTOSAVE_DELAY = 500;

export default function PersonalNotesSection({ taskId }: Props) {
    const { theme } = useTheme();
    const [note, setNote] = useState<string>('');
    const [characterCount, setCharacterCount] = useState<number>(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load note on mount
    useEffect(() => {
        loadNote();
    }, [taskId]);

    const loadNote = async () => {
        try {
            setIsLoading(true);
            const taskNote = await getNoteForTask(taskId);
            if (taskNote) {
                setNote(taskNote.content);
                setCharacterCount(taskNote.character_count);
            }
        } catch (error) {
            console.error('Failed to load note:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced autosave (500ms delay)
    const handleNoteChange = (text: string) => {
        // Enforce character limit
        if (text.length > MAX_CHARACTERS) {
            return;
        }

        setNote(text);
        setCharacterCount(text.length);

        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout for autosave
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await saveTaskNote(taskId, text);
            } catch (error) {
                console.error('Failed to save note:', error);
            }
        }, AUTOSAVE_DELAY);
    };

    // Save on modal close
    const handleClose = async () => {
        // Cancel pending autosave
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Immediate save
        try {
            await saveTaskNote(taskId, note);
        } catch (error) {
            console.error('Failed to save note on close:', error);
        }

        setIsExpanded(false);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    if (isLoading) {
        return null;
    }

    const previewText = note.trim() || 'Add notes for this task...';
    const isPlaceholder = !note.trim();

    return (
        <>
            {/* Expanded Preview Card - Fills Remaining Space */}
            <Pressable
                style={[
                    styles.previewCard,
                    {
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                        borderRadius: theme.cardRadius,
                    },
                ]}
                onPress={() => setIsExpanded(true)}
            >
                <View style={styles.previewHeader}>
                    <Ionicons name="document-text-outline" size={20} color={theme.textPrimary} />
                    <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>
                        PERSONAL NOTES
                    </Text>
                </View>
                <ScrollView
                    style={styles.previewScrollView}
                    contentContainerStyle={styles.previewScrollContent}
                    showsVerticalScrollIndicator={true}
                >
                    <Text
                        style={[
                            styles.previewText,
                            { color: isPlaceholder ? theme.textTertiary : theme.textPrimary },
                        ]}
                    >
                        {previewText}
                    </Text>
                </ScrollView>
            </Pressable>

            {/* Expanded Editor Modal */}
            <ModalBase
                visible={isExpanded}
                onClose={handleClose}
                maxHeight="60%"
                useKeyboardAvoidingView={true}
            >
                <View style={styles.editorContainer}>
                    {/* Header */}
                    <View style={[styles.editorHeader, { borderBottomColor: theme.border }]}>
                        <View style={styles.editorHeaderLeft}>
                            <Ionicons name="document-text" size={24} color={theme.primary} />
                            <Text style={[styles.editorTitle, { color: theme.textPrimary }]}>
                                Personal Notes
                            </Text>
                        </View>
                        <View style={styles.editorHeaderRight}>
                            <Text style={[styles.characterCount, { color: theme.textSecondary }]}>
                                {characterCount.toLocaleString()} characters
                            </Text>
                            <Pressable onPress={handleClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={theme.textSecondary} />
                            </Pressable>
                        </View>
                    </View>

                    {/* Text Editor - Scrollable */}
                    <ScrollView
                        style={styles.editorScrollView}
                        contentContainerStyle={styles.editorScrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        <TextInput
                            style={[
                                styles.textEditor,
                                {
                                    color: theme.textPrimary,
                                    backgroundColor: theme.background,
                                },
                            ]}
                            value={note}
                            onChangeText={handleNoteChange}
                            placeholder="Start typing your notes..."
                            placeholderTextColor={theme.textTertiary}
                            multiline
                            textAlignVertical="top"
                            autoFocus
                            maxLength={MAX_CHARACTERS}
                        />
                    </ScrollView>
                </View>
            </ModalBase>
        </>
    );
}

const styles = StyleSheet.create({
    // Preview Card Styles
    previewCard: {
        maxHeight: 300, // Fixed max height to fit within screen
        padding: 16,
        borderWidth: 1,
        marginTop: 12,
        minHeight: 250, // Minimum height to ensure visibility
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    previewLabel: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    previewScrollView: {
        flex: 1,
    },
    previewScrollContent: {
        flexGrow: 1,
    },
    previewText: {
        fontSize: 15,
        lineHeight: 22,
    },

    // Editor Modal Styles
    editorContainer: {
        height: Dimensions.get('window').height * 0.6, // Fixed 60% height
    },
    editorScrollView: {
        flex: 1,
    },
    editorScrollContent: {
        flexGrow: 1,
    },
    editorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    editorHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    editorTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    editorHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    characterCount: {
        fontSize: 12,
        fontWeight: '500',
    },
    closeButton: {
        padding: 4,
    },
    textEditor: {
        minHeight: Dimensions.get('window').height * 0.5, // Minimum height for scrolling
        padding: 16,
        fontSize: 16,
        lineHeight: 24,
    },
});
