import '../lib/webShims';
import { Stack } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from '../lib/store';
import { colors } from '../lib/theme';

export default function RootLayout() {
  // iPhone só na vertical; no iPad pode rodar (o ecrã de jogo usa duas colunas na horizontal)
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const { width, height } = Dimensions.get('screen');
    const lock =
      Math.min(width, height) >= 600
        ? ScreenOrientation.OrientationLock.DEFAULT
        : ScreenOrientation.OrientationLock.PORTRAIT_UP;
    ScreenOrientation.lockAsync(lock).catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.green },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: '800' },
            contentStyle: { backgroundColor: colors.bg },
            headerBackTitle: 'Voltar',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="team/[id]" options={{ title: 'Equipa' }} />
          <Stack.Screen name="game/new" options={{ title: 'Novo jogo', presentation: 'modal' }} />
          <Stack.Screen name="game/[id]/live" options={{ title: 'Jogo', gestureEnabled: false }} />
          <Stack.Screen name="game/[id]/report" options={{ title: 'Relatório' }} />
        </Stack>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
