import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useScheme } from '../hooks/useScheme';
import { useGameStore } from '../store/gameStore';

export default function RootLayout() {
  const initialize = useGameStore((s) => s.initialize);
  const isLoaded = useGameStore((s) => s.isLoaded);
  // Before the saved prefs load this follows the device's light/dark setting.
  const scheme = useScheme();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Web: paint the page behind the app in the theme color, so the strips the
  // browser shows around it (status bar, under the toolbar) match the app.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.documentElement.style.backgroundColor = scheme.background;
    document.body.style.backgroundColor = scheme.background;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', scheme.background);
  }, [scheme.background]);

  if (!isLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: scheme.background }]}>
        <Text style={[styles.loadingText, { color: scheme.text }]}>Viator</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: scheme.background }]}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="import-export" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="rules-reference" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 32, fontWeight: '800', letterSpacing: 1 },
});
