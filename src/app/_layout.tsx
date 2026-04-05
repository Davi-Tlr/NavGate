import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0a0f1e' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="aerodromo/[icao]"
          options={{ title: 'Detalhes' }}
        />
        <Stack.Screen
          name="metar/[icao]"
          options={{ title: 'METAR / TAF' }}
        />
      </Stack>
    </>
  );
}