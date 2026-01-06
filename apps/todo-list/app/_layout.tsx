import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, StatusBar } from "react-native";
import { TimerProvider } from "@/contexts/TimerContext";
import { PomodoroProvider } from "@/contexts/PomodoroContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { ThemeBackground } from "@/components/ThemeBackground";
import { useEffect, useState } from "react";
import * as Notifications from 'expo-notifications';
import { setupNotificationHandler } from "@/services/notifications";
import { getTaskById } from "@/services/tasks";
import AlarmModal from "@/components/AlarmModal";
import { Task } from "@todolist/shared-types";

function RootLayoutContent() {
  const { theme, isDark } = useTheme();
  const [alarmTask, setAlarmTask] = useState<Task | null>(null);
  const [showAlarmModal, setShowAlarmModal] = useState(false);

  useEffect(() => {
    setupNotificationHandler();
    const foregroundSubscription = Notifications.addNotificationReceivedListener(async notification => {
      const taskId = notification.request.content.data.taskId as string;
      if (taskId) {
        const task = await getTaskById(taskId);
        if (task) {
          setAlarmTask(task);
          setShowAlarmModal(true);
        }
      }
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const taskId = response.notification.request.content.data.taskId;
      if (taskId) {
        console.log('User tapped notification for task:', taskId);
      }
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      <TimerProvider>
        <PomodoroProvider>
          <ThemeBackground>
            <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: 'transparent' }]}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  gestureEnabled: true,
                  contentStyle: { backgroundColor: 'transparent' },
                }}
              />
              <AlarmModal
                visible={showAlarmModal}
                task={alarmTask}
                onDismiss={() => {
                  setShowAlarmModal(false);
                  setAlarmTask(null);
                }}
              />
            </SafeAreaView>
          </ThemeBackground>
        </PomodoroProvider>
      </TimerProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
});
