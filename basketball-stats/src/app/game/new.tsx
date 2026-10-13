import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chip, H2, Input, Muted } from '../../components/ui';
import { useStore } from '../../lib/store';
import { colors } from '../../lib/theme';
import { Format } from '../../lib/types';

export default function NewGameScreen() {
  const { teams, createGame } = useStore();
  const [teamId, setTeamId] = useState('');
  const [opponent, setOpponent] = useState('');
  const [location, setLocation] = useState('');
  const [format, setFormat] = useState<Format>('5x5');
  const [periods, setPeriods] = useState(4);
  const [minutes, setMinutes] = useState(10);
  const team = teams.find((t) => t.id === teamId) ?? teams[0];
  const [roster, setRoster] = useState<string[]>([]);
  const [starters, setStarters] = useState<string[]>([]);
  const maxOnCourt = format === '3x3' ? 3 : 5;

  useEffect(() => {
    setRoster(team?.players.map((p) => p.id) ?? []);
    setStarters([]);
  }, [team?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPeriods(format === '3x3' ? 1 : 4);
    setStarters((s) => s.slice(0, maxOnCourt));
  }, [format, maxOnCourt]);

  const players = useMemo(
    () => [...(team?.players ?? [])].sort((a, b) => Number(a.number) - Number(b.number)),
    [team],
  );

  const toggleRoster = (id: string) => {
    setRoster((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));
    setStarters((s) => s.filter((x) => x !== id));
  };
  const toggleStarter = (id: string) => {
    if (!roster.includes(id)) setRoster((r) => [...r, id]);
    setStarters((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : s.length < maxOnCourt ? [...s, id] : s,
    );
  };

  const start = () => {
    if (!team) return;
    const g = createGame({
      teamId: team.id,
      opponent: opponent.trim() || 'Adversário',
      location: location.trim() || undefined,
      date: Date.now(),
      format,
      periods,
      periodLength: minutes * 60,
      clockRemaining: minutes * 60,
      secondsPlayed: {},
      roster,
      onCourt: starters.length ? starters : roster.slice(0, maxOnCourt),
    });
    router.replace(`/game/${g.id}/live`);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
      <Card>
        <H2>Equipa</H2>
        <View style={styles.wrap}>
          {teams.map((t) => (
            <Chip key={t.id} label={t.name} active={t.id === team?.id} onPress={() => setTeamId(t.id)} />
          ))}
        </View>
        <H2 style={{ marginTop: 14 }}>Adversário</H2>
        <Input placeholder="Nome do adversário" value={opponent} onChangeText={setOpponent} />
        <Input
          style={{ marginTop: 8 }}
          placeholder="Local / competição (opcional)"
          value={location}
          onChangeText={setLocation}
        />
      </Card>

      <Card>
        <H2>Formato</H2>
        <View style={styles.wrap}>
          <Chip label="5x5" active={format === '5x5'} onPress={() => setFormat('5x5')} />
          <Chip label="3x3" active={format === '3x3'} onPress={() => setFormat('3x3')} />
        </View>
        <H2 style={{ marginTop: 14 }}>Períodos</H2>
        <View style={styles.wrap}>
          {[1, 2, 4].map((n) => (
            <Chip key={n} label={String(n)} active={periods === n} onPress={() => setPeriods(n)} />
          ))}
        </View>
        <H2 style={{ marginTop: 14 }}>Minutos por período</H2>
        <View style={styles.wrap}>
          {[0, 5, 8, 10, 12].map((n) => (
            <Chip
              key={n}
              label={n === 0 ? 'Sem relógio' : `${n} min`}
              active={minutes === n}
              onPress={() => setMinutes(n)}
            />
          ))}
        </View>
        {minutes === 0 && <Muted style={{ marginTop: 8 }}>Sem relógio não são contados os minutos dos jogadores.</Muted>}
      </Card>

      <Card>
        <H2>Convocados</H2>
        <Muted style={{ marginBottom: 10 }}>
          Toca para convocar · ⭐ marca o cinco inicial ({starters.length}/{maxOnCourt})
        </Muted>
        {players.length === 0 && <Muted>Esta equipa não tem jogadores. Adiciona-os em Equipas.</Muted>}
        {players.map((p) => {
          const on = roster.includes(p.id);
          const star = starters.includes(p.id);
          return (
            <Pressable key={p.id} onPress={() => toggleRoster(p.id)} style={[styles.row, !on && { opacity: 0.4 }]}>
              <View style={[styles.check, on && styles.checkOn]}>{on && <Text style={styles.tick}>✓</Text>}</View>
              <Text style={styles.num}>{p.number}</Text>
              <Text style={styles.name}>{p.name}</Text>
              <Pressable hitSlop={10} onPress={() => toggleStarter(p.id)}>
                <Text style={{ fontSize: 22, opacity: star ? 1 : 0.25 }}>⭐</Text>
              </Pressable>
            </Pressable>
          );
        })}
      </Card>

      <Button title="Começar jogo" variant="accent" onPress={start} disabled={!team || roster.length === 0} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.green, borderColor: colors.green },
  tick: { color: colors.white, fontWeight: '900' },
  num: { width: 32, fontWeight: '900', color: colors.blue, fontSize: 16 },
  name: { flex: 1, fontSize: 16, color: colors.text, fontWeight: '600' },
});
