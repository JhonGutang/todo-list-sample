import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, StatusBar } from "react-native";
import { TimerProvider } from "@/contexts/TimerContext";
import { PomodoroProvider } from "@/contexts/PomodoroContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

function RootLayoutContent() {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      <TimerProvider>
        <PomodoroProvider>
          <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                contentStyle: { backgroundColor: theme.background },
              }}
            />
          </SafeAreaView>
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
