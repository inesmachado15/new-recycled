import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Comparison } from '../../../components/Comparison';
import { Lineups } from '../../../components/Lineups';
import { StatTable } from '../../../components/StatTable';
import { Button, Card, H2, Muted } from '../../../components/ui';
import { fmtMinutes, hasClock } from '../../../lib/clock';
import { exportPdf, gameReportHtml, printHtml } from '../../../lib/report';
import {
  comparisonRows,
  eff,
  fga,
  fgm,
  formatDate,
  pct,
  periodLabel,
  reb,
  shotLabels,
  StatLine,
  summarizeGame,
  summarizeLineups,
} from '../../../lib/stats';
import { useStore } from '../../../lib/store';
import { colors, radius } from '../../../lib/theme';

export default function GameReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { games, teams, updateGame } = useStore();
  const game = games.find((g) => g.id === id);
  const team = teams.find((t) => t.id === game?.teamId);
  const s = useMemo(() => (game ? summarizeGame(game) : null), [game]);
  const [busy, setBusy] = useState(false);

  if (!game || !team || !s) return null;
  const labels = shotLabels(game.format);

  const timed = hasClock(game);
  const values = (l: StatLine) => ({
    min: fmtMinutes(l.secs),
    pts: l.pts,
    fg: `${fgm(l)}/${fga(l)}`,
    fgp: pct(fgm(l), fga(l)),
    out: `${l.outm}/${l.outa}`,
    ft: `${l.ftm}/${l.fta}`,
    reb: reb(l),
    ast: l.ast,
    stl: l.stl,
    blk: l.blk,
    tov: l.tov,
    pf: l.pf,
    pm: `${l.plusMinus > 0 ? '+' : ''}${l.plusMinus}`,
    eff: eff(l),
  });

  const rows = game.roster
    .map((pid) => team.players.find((p) => p.id === pid))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({ key: p.id, name: `${p.number} ${p.name}`, values: values(s.players[p.id]) }));

  const top = (fn: (l: StatLine) => number) =>
    game.roster
      .map((pid) => ({ p: team.players.find((x) => x.id === pid), v: fn(s.players[pid]) }))
      .sort((a, b) => b.v - a.v)[0];

  const leaders = [
    { label: 'Pontos', ...top((l) => l.pts) },
    { label: 'Ressaltos', ...top(reb) },
    { label: 'Assist.', ...top((l) => l.ast) },
    { label: 'Valoriz.', ...top(eff) },
  ];

  const html = () => gameReportHtml(game, team, s);
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      Alert.alert('Não foi possível exportar', String(e));
    } finally {
      setBusy(false);
    }
  };

  const shareText = () => {
    const lines = rows
      .filter((r) => Number(r.values.pts) > 0 || Number(r.values.reb) > 0 || Number(r.values.ast) > 0)
      .sort((a, b) => Number(b.values.pts) - Number(a.values.pts))
      .map((r) => `${r.name}: ${r.values.pts} pts, ${r.values.reb} res, ${r.values.ast} ast`);
    Share.share({
      message: `🏀 ${team.name} ${s.us} – ${s.them} ${game.opponent}\n${formatDate(game.date)}\n\n${lines.join('\n')}`,
    });
  };

  const t = s.team;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
      <Stack.Screen options={{ title: `vs ${game.opponent}` }} />

      <View style={styles.board}>
        <View style={styles.side}>
          <Text style={styles.team} numberOfLines={1}>{team.name}</Text>
          <Text style={styles.score}>{s.us}</Text>
        </View>
        <Text style={styles.status}>{game.finished ? 'FINAL' : 'EM CURSO'}</Text>
        <View style={styles.side}>
          <Text style={styles.team} numberOfLines={1}>{game.opponent}</Text>
          <Text style={styles.score}>{s.them}</Text>
        </View>
      </View>
      <Muted style={{ textAlign: 'center', marginTop: -6 }}>
        {formatDate(game.date)} · {game.format}
        {game.location ? ` · ${game.location}` : ''}
      </Muted>

      <View style={styles.actions}>
        <Button title="PDF" style={{ flex: 1 }} disabled={busy} onPress={() => run(() => exportPdf(html(), 'Relatório do jogo'))} />
        <Button title="Imprimir" variant="ghost" style={{ flex: 1 }} disabled={busy} onPress={() => run(() => printHtml(html()))} />
        <Button title="Partilhar" variant="ghost" style={{ flex: 1 }} onPress={shareText} />
      </View>

      <Card>
        <H2>Parciais</H2>
        <View style={styles.periodRow}>
          <Text style={[styles.pCell, styles.pName]} />
          {s.byPeriod.map((_, i) => (
            <Text key={i} style={[styles.pCell, styles.pHead]}>{periodLabel(game.format, game.periods, i + 1)}</Text>
          ))}
        </View>
        {(['us', 'them'] as const).map((k) => (
          <View key={k} style={styles.periodRow}>
            <Text style={[styles.pCell, styles.pName]} numberOfLines={1}>{k === 'us' ? team.name : game.opponent}</Text>
            {s.byPeriod.map((p, i) => (
              <Text key={i} style={styles.pCell}>{p[k]}</Text>
            ))}
          </View>
        ))}
      </Card>

      <Card>
        <H2>Destaques</H2>
        <View style={styles.leaders}>
          {leaders.map((l) => (
            <View key={l.label} style={styles.leader}>
              <Muted style={{ fontSize: 12 }}>{l.label}</Muted>
              <Text style={styles.leaderVal}>{l.v ? l.v : '–'}</Text>
              <Text style={styles.leaderName} numberOfLines={1}>{l.v ? l.p?.name : 'Ninguém'}</Text>
            </View>
          ))}
        </View>
      </Card>

      <H2 style={{ marginBottom: 0 }}>Ficha de jogo</H2>
      <StatTable
        columns={[
          ...(timed ? [{ key: 'min', label: 'MIN', width: 54 }] : []),
          { key: 'pts', label: 'PTS', bold: true },
          { key: 'fg', label: 'LC', width: 54 },
          { key: 'fgp', label: 'LC%', width: 50 },
          { key: 'out', label: labels.outside, width: 50 },
          { key: 'ft', label: 'LL', width: 50 },
          { key: 'reb', label: 'RES' },
          { key: 'ast', label: 'AST' },
          { key: 'stl', label: 'RB' },
          { key: 'blk', label: 'DS' },
          { key: 'tov', label: 'PE' },
          { key: 'pf', label: 'FC' },
          { key: 'pm', label: '+/-' },
          { key: 'eff', label: 'VAL' },
        ]}
        rows={rows}
        total={{ name: 'Equipa', values: values(t) }}
      />
      <Muted style={{ fontSize: 12 }}>
        LC: lanç. de campo · LL: lances livres · RB: roubos · DS: desarmes · PE: perdas · FC: faltas · VAL: valorização
      </Muted>

      <Card>
        <H2>{team.name} vs {game.opponent}</H2>
        <Comparison us={team.name} them={game.opponent} rows={comparisonRows(t, s.opp, game.format)} />
      </Card>

      <Card>
        <H2>Quintetos (+/-)</H2>
        <Lineups lineups={summarizeLineups(game)} players={team.players} timed={timed} />
      </Card>

      {game.finished ? (
        <Button
          title="Reabrir jogo"
          variant="ghost"
          onPress={() => {
            updateGame(game.id, { finished: false });
            router.replace(`/game/${game.id}/live`);
          }}
        />
      ) : (
        <Button title="Voltar ao jogo" variant="accent" onPress={() => router.back()} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.greenDark,
    borderRadius: radius.lg,
    padding: 16,
  },
  side: { flex: 1, alignItems: 'center' },
  team: { color: '#CFE0D4', fontWeight: '700' },
  score: { color: colors.white, fontSize: 44, fontWeight: '900', fontVariant: ['tabular-nums'] },
  status: { color: colors.orange, fontWeight: '900', fontSize: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  periodRow: { flexDirection: 'row', alignItems: 'center' },
  pCell: { flex: 1, textAlign: 'center', paddingVertical: 6, fontSize: 15, color: colors.text, fontWeight: '600' },
  pHead: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  pName: { flex: 2.4, textAlign: 'left', fontWeight: '800' },
  leaders: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  leader: {
    width: '48.5%',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 10,
  },
  leaderVal: { fontSize: 24, fontWeight: '900', color: colors.green },
  leaderName: { fontWeight: '700', color: colors.text },
});
