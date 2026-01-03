import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, useColorScheme } from "react-native";

export default function RootLayout() {
  const scheme = useColorScheme();
  const backgroundColor = scheme === "dark" ? "#000000" : "#FFFFFF";

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor }]}> 
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true,
            contentStyle: { backgroundColor },
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
