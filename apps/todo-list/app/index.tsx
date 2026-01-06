import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

export default function Index() {
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)/tasks');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.logo, { color: theme.primary }]}>Momentum</Text>
        <Text style={[styles.creator, { color: theme.textSecondary }]}>Created by JBG Dev</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 1,
  },
  creator: {
    fontSize: 16,
    fontWeight: '500',
  },
});

