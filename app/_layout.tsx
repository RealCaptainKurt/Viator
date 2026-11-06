import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLOR_SCHEMES, DEFAULT_SCHEME } from '../constants/colorSchemes';
import { useGameStore } from '../store/gameStore';

export default function RootLayout() {
  const initialize = useGameStore((s) => s.initialize);
  const isLoaded = useGameStore((s) => s.isLoaded);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isLoaded) {
    const scheme = COLOR_SCHEMES[DEFAULT_SCHEME];
    return (
      <View style={[styles.loading, { backgroundColor: scheme.background }]}>
        <Text style={[styles.loadingText, { color: scheme.text }]}>Viator</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
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
