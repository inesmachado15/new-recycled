import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, H2, Input, Muted } from '../../components/ui';
import { useStore } from '../../lib/store';
import { colors, radius } from '../../lib/theme';
import { Player } from '../../lib/types';
import { useLayout } from '../../lib/useLayout';

export default function TeamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { teams, updateTeam, deleteTeam, addPlayer, updatePlayer, removePlayer } = useStore();
  const { content } = useLayout();
  const team = teams.find((t) => t.id === id);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [editing, setEditing] = useState<Player | null>(null);

  if (!team) return null;

  const players = [...team.players].sort((a, b) => Number(a.number) - Number(b.number));

  const save = () => {
    const n = name.trim();
    if (!n) return;
    if (editing) {
      updatePlayer(team.id, { ...editing, name: n, number: number.trim() });
      setEditing(null);
    } else {
      addPlayer(team.id, n, number.trim());
    }
    setName('');
    setNumber('');
  };

  const rename = () =>
    Alert.prompt(
      'Nome da equipa',
      undefined,
      (v) => v?.trim() && updateTeam(team.id, { name: v.trim() }),
      'plain-text',
      team.name,
    );

  const remove = () =>
    Alert.alert('Apagar equipa?', 'Os jogos desta equipa também serão apagados.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: () => {
          deleteTeam(team.id);
          router.back();
        },
      },
    ]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={90}>
      <Stack.Screen options={{ title: team.name }} />
      <FlatList
        data={players}
        keyExtractor={(p) => p.id}
        contentContainerStyle={[{ padding: 16, gap: 8 }, content]}
        ListHeaderComponent={
          <Card style={{ marginBottom: 8 }}>
            <H2>{editing ? 'Editar jogador' : 'Adicionar jogador'}</H2>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Input
                style={{ width: 70, textAlign: 'center' }}
                placeholder="Nº"
                keyboardType="number-pad"
                maxLength={3}
                value={number}
                onChangeText={setNumber}
              />
              <Input
                style={{ flex: 1 }}
                placeholder="Nome"
                value={name}
                onChangeText={setName}
                onSubmitEditing={save}
                returnKeyType="done"
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              {editing && (
                <Button
                  title="Cancelar"
                  variant="ghost"
                  style={{ flex: 1 }}
                  onPress={() => {
                    setEditing(null);
                    setName('');
                    setNumber('');
                  }}
                />
              )}
              <Button
                title={editing ? 'Guardar' : 'Adicionar'}
                style={{ flex: 1 }}
                onPress={save}
                disabled={!name.trim()}
              />
            </View>
          </Card>
        }
        ListEmptyComponent={<Muted style={{ textAlign: 'center', marginTop: 20 }}>Ainda sem jogadores.</Muted>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => {
              setEditing(item);
              setName(item.name);
              setNumber(item.number);
            }}
            onLongPress={() =>
              Alert.alert(`Remover ${item.name}?`, undefined, [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Remover', style: 'destructive', onPress: () => removePlayer(team.id, item.id) },
              ])
            }
          >
            <View style={styles.jersey}>
              <Text style={styles.jerseyText}>{item.number || '–'}</Text>
            </View>
            <Text style={styles.name}>{item.name}</Text>
            <Muted>editar</Muted>
          </Pressable>
        )}
        ListFooterComponent={
          <View style={{ gap: 8, marginTop: 24 }}>
            <Muted style={{ textAlign: 'center' }}>Toca para editar · mantém premido para remover</Muted>
            {Platform.OS !== 'android' && <Button title="Mudar nome da equipa" variant="ghost" onPress={rename} />}
            <Button title="Apagar equipa" variant="danger" onPress={remove} />
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  jersey: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jerseyText: { color: colors.white, fontWeight: '900', fontSize: 16 },
  name: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text },
});
