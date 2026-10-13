import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from '../lib/store';
import { colors } from '../lib/theme';

export default function RootLayout() {
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
