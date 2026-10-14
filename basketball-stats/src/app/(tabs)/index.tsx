import { router } from 'expo-router';
import { Alert, FlatList, ImageBackground, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Button, Empty, Muted } from '../../components/ui';
import { CLUB } from '../../lib/club';
import { formatDate, summarizeGame } from '../../lib/stats';
import { useStore } from '../../lib/store';
import { colors, radius } from '../../lib/theme';

export default function GamesScreen() {
  const { games, teams, deleteGame, ready } = useStore();
  const { width } = useWindowDimensions();
  const heroWidth = width - 32;
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

  const record = games.reduce(
    (acc, g) => {
      if (!g.finished) return acc;
      const s = summarizeGame(g);
      if (s.us > s.them) acc.w++;
      else if (s.us < s.them) acc.l++;
      return acc;
    },
    { w: 0, l: 0 },
  );

  const hero = (
    <ImageBackground
      source={require('../../../assets/banner.png')}
      style={[styles.hero, { width: heroWidth, height: (heroWidth * 520) / 1200 }]}
      imageStyle={{ borderRadius: radius.lg }}
      resizeMode="cover"
    >
      <Text style={styles.heroClub}>{CLUB.name.toUpperCase()}</Text>
      <Text style={styles.heroTeam}>{CLUB.team}</Text>
      <View style={styles.heroRecord}>
        <Text style={styles.heroRecordText}>
          {record.w}V · {record.l}D
        </Text>
      </View>
    </ImageBackground>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={games}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        ListHeaderComponent={hero}
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
  hero: {
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  heroClub: { color: '#CFE0D4', fontWeight: '800', fontSize: 12, letterSpacing: 1.5 },
  heroTeam: { color: colors.white, fontWeight: '900', fontSize: 26, marginTop: 2, maxWidth: '58%' },
  heroRecord: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: colors.orange,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  heroRecordText: { color: colors.white, fontWeight: '900', fontSize: 13 },
  fab: { position: 'absolute', left: 16, right: 16, bottom: 16 },
});
