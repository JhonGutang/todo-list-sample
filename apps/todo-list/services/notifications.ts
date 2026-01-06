import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Task, ReminderPreset } from '@todolist/shared-types';

/**
 * Configure how notifications are handled when the app is in the foreground
 */
export function setupNotificationHandler() {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

/**
 * Request notification permissions from the user
 * @returns Promise<boolean> - true if permissions granted, false otherwise
 */
export async function requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
        console.warn('Notifications only work on physical devices');
        return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        // Request critical alert permissions for iOS (bypasses Do Not Disturb)
        // and standard permissions for Android
        const { status } = await Notifications.requestPermissionsAsync({
            ios: {
                allowAlert: true,
                allowSound: true,
                allowBadge: true,
                allowCriticalAlerts: true, // iOS critical alerts
            },
            android: {},
        });
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
    }

    // Configure notification channel for Android with MAXIMUM importance
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('task-alarms', {
            name: 'Task Alarms',
            importance: Notifications.AndroidImportance.MAX, // Maximum importance for alarm
            vibrationPattern: [0, 500, 500, 500], // Stronger vibration
            lightColor: '#FF0000',
            sound: 'default', // Will use system default alarm sound
            enableLights: true,
            enableVibrate: true,
            showBadge: true,
        });
    }

    return true;
}

/**
 * Calculate the reminder time based on start time and preset
 * @param startTime - ISO timestamp of when task starts
 * @param preset - Reminder preset (5min, 1min, 30sec)
 * @returns Date object for when to trigger the reminder
 */
export function calculateReminderTime(startTime: string, preset: ReminderPreset): Date {
    const startDate = new Date(startTime);
    const reminderDate = new Date(startDate);

    switch (preset) {
        case '5min':
            reminderDate.setMinutes(reminderDate.getMinutes() - 5);
            break;
        case '1min':
            reminderDate.setMinutes(reminderDate.getMinutes() - 1);
            break;
        case '30sec':
            reminderDate.setSeconds(reminderDate.getSeconds() - 30);
            break;
    }

    return reminderDate;
}

/**
 * Schedule a task reminder notification
 * @param task - Task object with startTime and reminderPreset
 * @returns Promise<string | null> - Notification ID if scheduled, null otherwise
 */
export async function scheduleTaskReminder(task: Task): Promise<string | null> {
    // Validate task has required fields
    if (!task.startTime || !task.reminderPreset) {
        console.log('Task missing startTime or reminderPreset, skipping notification');
        return null;
    }

    // Request permissions if not already granted
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
        console.warn('Cannot schedule notification without permissions');
        return null;
    }

    // Calculate when to trigger the reminder
    const reminderTime = calculateReminderTime(task.startTime, task.reminderPreset);
    const now = new Date();

    // Don't schedule if reminder time is in the past
    if (reminderTime <= now) {
        console.log('Reminder time is in the past, skipping notification');
        return null;
    }

    // Cancel existing notification if task already has one
    if (task.notificationId) {
        await cancelTaskReminder(task.notificationId);
    }

    // Get reminder label for display
    const reminderLabel = getReminderLabel(task.reminderPreset);

    try {
        // Schedule the notification with alarm-style settings
        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: '🚨 TASK ALARM',
                body: `${task.name} starts in ${reminderLabel}!`,
                data: { taskId: task.id },
                sound: true,
                priority: Notifications.AndroidNotificationPriority.MAX,
                // iOS critical alert - bypasses Do Not Disturb
                ...(Platform.OS === 'ios' && {
                    sound: 'default',
                    critical: true,
                    criticalVolume: 1.0,
                }),
            },
            trigger: {
                type: 'date' as const,
                date: reminderTime,
                channelId: Platform.OS === 'android' ? 'task-alarms' : undefined,
            } as Notifications.DateTriggerInput,
        });

        console.log(`Scheduled ALARM notification ${notificationId} for task ${task.name} at ${reminderTime.toISOString()}`);
        return notificationId;
    } catch (error) {
        console.error('Failed to schedule alarm notification:', error);
        return null;
    }
}

/**
 * Cancel a scheduled task reminder
 * @param notificationId - ID of the notification to cancel
 */
export async function cancelTaskReminder(notificationId: string): Promise<void> {
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log(`Cancelled notification ${notificationId}`);
    } catch (error) {
        console.error('Failed to cancel notification:', error);
    }
}

/**
 * Get human-readable label for reminder preset
 */
function getReminderLabel(preset: ReminderPreset): string {
    switch (preset) {
        case '5min':
            return '5 minutes';
        case '1min':
            return '1 minute';
        case '30sec':
            return '30 seconds';
    }
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getAllScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
}
