import { View, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useScheme } from '../hooks/useScheme';

export default function NotFoundScreen() {
  const scheme = useScheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Not found' }} />
      <View style={[styles.container, { backgroundColor: scheme.background }]}>
        <Link href="/" style={[styles.button, { color: scheme.text }]}>
          Go back to Home screen
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
  },
});