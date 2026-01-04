import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { TimerProvider, useTimer } from '@/contexts/TimerContext';
import { Alert } from 'react-native';

function TabsContent() {
  const { isTimerRunning } = useTimer();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
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
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="tasks" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="pomodoro-timer"
        options={{
          title: 'Pomodoro',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="timer" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <TimerProvider>
      <TabsContent />
    </TimerProvider>
  );
}
