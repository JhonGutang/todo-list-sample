import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TimerProvider, useTimer } from '@/contexts/TimerContext';
import { Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

function TabsContent() {
  const { isTimerRunning } = useTimer();

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarStyle: {
            backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            height: 60,
            paddingBottom: 8,
            paddingTop: 0,
            ...(Platform.OS === 'ios' && {
              backdropFilter: 'blur(10px)',
            }),
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginTop: 2,
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
            tabBarIcon: ({ color, size, focused }) => (
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
