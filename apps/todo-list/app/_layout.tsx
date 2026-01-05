import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, StatusBar } from "react-native";
import { TimerProvider } from "@/contexts/TimerContext";
import { PomodoroProvider } from "@/contexts/PomodoroContext";
import Colors from "@/constants/Colors";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <TimerProvider>
        <PomodoroProvider>
          <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: Colors.white }]}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                contentStyle: { backgroundColor: Colors.white },
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
