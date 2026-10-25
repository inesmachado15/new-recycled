import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../lib/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.green },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '800' },
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        // Altura explícita (ícone + nome + zona do indicador do iPhone) para os nomes não ficarem cortados
        tabBarStyle: { height: 62 + insets.bottom, paddingTop: 6, paddingBottom: insets.bottom + 6 },
        tabBarLabelStyle: { fontSize: 12, lineHeight: 16, height: 16, flexShrink: 0 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Jogos',
          tabBarIcon: ({ color, size }) => <Ionicons name="basketball" color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: 'Equipas',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Relatórios',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="data"
        options={{
          title: 'Dados',
          tabBarIcon: ({ color, size }) => <Ionicons name="cloud-upload" color={color as string} size={size} />,
        }}
      />
    </Tabs>
  );
}
