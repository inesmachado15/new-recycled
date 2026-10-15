import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/tabs';
import { colors } from '../../lib/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.green },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '800' },
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Jogos',
          tabBarIcon: ({ color, size }) => <Ionicons name="basketball" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: 'Equipas',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Relatórios',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="data"
        options={{
          title: 'Dados',
          tabBarIcon: ({ color, size }) => <Ionicons name="cloud-upload" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
