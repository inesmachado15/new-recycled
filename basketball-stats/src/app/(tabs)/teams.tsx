import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Empty, Input, Muted } from '../../components/ui';
import { useStore } from '../../lib/store';
import { colors, radius } from '../../lib/theme';

export default function TeamsScreen() {
  const { teams, addTeam } = useStore();
  const [name, setName] = useState('');

  const create = () => {
    const n = name.trim();
    if (!n) return;
    const t = addTeam(n);
    setName('');
    router.push(`/team/${t.id}`);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={90}>
      <FlatList
        data={teams}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListHeaderComponent={
          <View style={styles.add}>
            <Input
              style={{ flex: 1 }}
              placeholder="Nome da nova equipa"
              value={name}
              onChangeText={setName}
              onSubmitEditing={create}
              returnKeyType="done"
            />
            <Button title="Criar" onPress={create} disabled={!name.trim()} />
          </View>
        }
        ListEmptyComponent={
          <Empty title="Sem equipas" text="Cria a tua equipa e adiciona os jogadores com nome e número." />
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
            onPress={() => router.push(`/team/${item.id}`)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.name}</Text>
              <Muted>{item.players.length} jogadores</Muted>
            </View>
            <Text style={styles.chev}>›</Text>
          </Pressable>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  add: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '900', fontSize: 16 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  chev: { fontSize: 28, color: colors.muted },
});
