import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TimerProvider, useTimer } from '@/contexts/TimerContext';
import { Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

function TabsContent() {
  const { isTimerRunning } = useTimer();
  const { theme, themeType } = useTheme();

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: 'transparent' }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          sceneStyle: { backgroundColor: 'transparent' },
          tabBarStyle: {
            backgroundColor: theme.tabBarBg,
            borderTopWidth: 0,
            elevation: 0,
            shadowColor: 'transparent',
            height: 70,
            paddingBottom: 8,
            paddingTop: 0,
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarItemStyle: {
            paddingVertical: 4,
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 4,
            textAlign: 'center',
          },
          tabBarIconStyle: {
            marginTop: 2,
            alignSelf: 'center',
            shadowColor: themeType === 'lantern-night' ? theme.shadowColor : 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: themeType === 'lantern-night' ? 0.8 : 0,
            shadowRadius: themeType === 'lantern-night' ? 10 : 0,
          },
        }}
        screenListeners={({ navigation, route }) => ({
          tabPress: (e) => {
            const routeName = route.name;
            const isFocused = navigation.isFocused();

            if (isTimerRunning && routeName !== 'pomodoro-timer' && !isFocused) {
              e.preventDefault();
              Alert.alert(
                'Timer Running',
                'Please pause or complete your timer before leaving this screen.',
                [{ text: 'OK', style: 'cancel' }]
              );
            }
          },
        })}
      >
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tasks',
            headerTitle: 'My Tasks',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "checkmark-done" : "checkmark-done-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="pomodoro-timer"
          options={{
            title: 'Focus',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "timer" : "timer-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="sample"
          options={{
            title: 'Sample',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "layers" : "layers-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

export default function TabLayout() {
  return (
    <TimerProvider>
      <TabsContent />
    </TimerProvider>
  );
}
