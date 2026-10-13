import { router } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Empty, Muted } from '../../components/ui';
import { formatDate, summarizeGame } from '../../lib/stats';
import { useStore } from '../../lib/store';
import { colors, radius } from '../../lib/theme';

export default function GamesScreen() {
  const { games, teams, deleteGame, ready } = useStore();
  const teamName = (id: string) => teams.find((t) => t.id === id)?.name ?? 'Equipa';

  const newGame = () => {
    if (teams.length === 0) {
      Alert.alert('Primeiro cria uma equipa', 'Adiciona a tua equipa e os jogadores para começar.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Criar equipa', onPress: () => router.push('/teams') },
      ]);
      return;
    }
    router.push('/game/new');
  };

  if (!ready) return null;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={games}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        ListEmptyComponent={
          <Empty
            title="Sem jogos"
            text="Regista as estatísticas de um jogo com um toque: escolhe a ação e depois o jogador."
          />
        }
        renderItem={({ item }) => {
          const s = summarizeGame(item);
          const result = !item.finished ? 'live' : s.us > s.them ? 'V' : s.us < s.them ? 'D' : 'E';
          return (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
              onPress={() =>
                router.push(item.finished ? `/game/${item.id}/report` : `/game/${item.id}/live`)
              }
              onLongPress={() =>
                Alert.alert('Apagar jogo?', `${teamName(item.teamId)} vs ${item.opponent}`, [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Apagar', style: 'destructive', onPress: () => deleteGame(item.id) },
                ])
              }
            >
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      result === 'live'
                        ? colors.orange
                        : result === 'V'
                          ? colors.green
                          : result === 'D'
                            ? colors.red
                            : colors.muted,
                  },
                ]}
              >
                <Text style={styles.badgeText}>{result === 'live' ? 'AO\nVIVO' : result}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>
                  {teamName(item.teamId)} vs {item.opponent}
                </Text>
                <Muted>
                  {formatDate(item.date)} · {item.format}
                  {item.location ? ` · ${item.location}` : ''}
                </Muted>
              </View>
              <Text style={styles.score}>
                {s.us}–{s.them}
              </Text>
            </Pressable>
          );
        }}
      />
      <View style={styles.fab}>
        <Button title="＋  Novo jogo" variant="accent" onPress={newGame} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  badge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.white, fontWeight: '900', fontSize: 11, textAlign: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  score: { fontSize: 22, fontWeight: '900', color: colors.text, fontVariant: ['tabular-nums'] },
  fab: { position: 'absolute', left: 16, right: 16, bottom: 16 },
});
