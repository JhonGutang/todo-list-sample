import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, useColorScheme } from "react-native";
import { TimerProvider } from "@/contexts/TimerContext";
import { PomodoroProvider } from "@/contexts/PomodoroContext";

export default function RootLayout() {
  const scheme = useColorScheme();
  const backgroundColor = scheme === "dark" ? "#000000" : "#FFFFFF";

  return (
    <SafeAreaProvider>
      <TimerProvider>
        <PomodoroProvider>
          <SafeAreaView edges={["top", "left", "right"]} style={[styles.container, { backgroundColor }]}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                contentStyle: { backgroundColor },
              }}
            />
          </SafeAreaView>
        </PomodoroProvider>
      </TimerProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
