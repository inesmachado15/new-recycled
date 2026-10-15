import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Comparison } from '../../components/Comparison';
import { Lineups } from '../../components/Lineups';
import { StatTable } from '../../components/StatTable';
import { Button, Card, Chip, Empty, H2, Muted } from '../../components/ui';
import { exportPdf, seasonReportHtml } from '../../lib/report';
import { avg, comparisonRows, seasonLineups, eff, fga, fgm, formatDate, pct, reb, summarizeGame, summarizeSeason } from '../../lib/stats';
import { useStore } from '../../lib/store';
import { colors, radius } from '../../lib/theme';
import { useLayout } from '../../lib/useLayout';

type Sort = 'pts' | 'reb' | 'ast' | 'eff';

export default function ReportsScreen() {
  const { teams, games } = useStore();
  const { content } = useLayout();
  const [teamId, setTeamId] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>('pts');
  const [busy, setBusy] = useState(false);
  const team = teams.find((t) => t.id === teamId) ?? teams[0];
  const s = useMemo(() => (team ? summarizeSeason(team, games) : null), [team, games]);

  if (!team || !s) {
    return <Empty title="Sem dados" text="Cria uma equipa e regista jogos para veres os relatórios." />;
  }

  const n = s.games.length;
  const players = s.players
    .filter((p) => p.gp > 0)
    .map((p) => ({
      ...p,
      sortVal: {
        pts: p.totals.pts,
        reb: reb(p.totals),
        ast: p.totals.ast,
        eff: eff(p.totals),
      }[sort] / p.gp,
    }))
    .sort((a, b) => b.sortVal - a.sortVal);

  const exportSeason = async () => {
    setBusy(true);
    try {
      await exportPdf(seasonReportHtml(team, s), `Relatório ${team.name}`);
    } catch (e) {
      Alert.alert('Não foi possível exportar', String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[{ padding: 16, gap: 14, paddingBottom: 40 }, content]}>
      {teams.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {teams.map((t) => (
            <Chip key={t.id} label={t.name} active={t.id === team.id} onPress={() => setTeamId(t.id)} />
          ))}
        </ScrollView>
      )}

      <View style={styles.kpis}>
        <Kpi label="Registo" value={`${s.wins}V-${s.losses}D`} />
        <Kpi label="Pts/jogo" value={avg(s.ptsFor, n)} />
        <Kpi label="Sofridos" value={avg(s.ptsAgainst, n)} />
        <Kpi label="LC%" value={pct(fgm(s.team), fga(s.team))} />
      </View>

      <Button title="📄 Exportar relatório da época (PDF)" disabled={busy || n === 0} onPress={exportSeason} />

      {n === 0 ? (
        <Muted style={{ textAlign: 'center' }}>Ainda não há jogos registados para {team.name}.</Muted>
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <H2 style={{ marginBottom: 0 }}>Médias por jogador</H2>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {(
              [
                ['pts', 'Pontos'],
                ['reb', 'Ressaltos'],
                ['ast', 'Assist.'],
                ['eff', 'Valoriz.'],
              ] as [Sort, string][]
            ).map(([k, l]) => (
              <Chip key={k} label={l} active={sort === k} onPress={() => setSort(k)} />
            ))}
          </View>
          <StatTable
            columns={[
              { key: 'gp', label: 'J', width: 34 },
              ...(s.timedGames > 0 ? [{ key: 'min', label: 'MIN', width: 48 }] : []),
              { key: 'pts', label: 'PTS', bold: true, width: 48 },
              { key: 'reb', label: 'RES', width: 48 },
              { key: 'ast', label: 'AST', width: 48 },
              { key: 'stl', label: 'RB', width: 44 },
              { key: 'blk', label: 'DS', width: 44 },
              { key: 'tov', label: 'PE', width: 44 },
              { key: 'fgp', label: 'LC%', width: 50 },
              { key: 'outp', label: 'Ext%', width: 50 },
              { key: 'ftp', label: 'LL%', width: 50 },
              { key: 'eff', label: 'VAL', width: 48 },
            ]}
            rows={players.map(({ player, gp, timedGp, totals: l }) => ({
              key: player.id,
              name: `${player.number} ${player.name}`,
              values: {
                gp,
                min: timedGp ? avg(l.secs / 60, timedGp) : '-',
                pts: avg(l.pts, gp),
                reb: avg(reb(l), gp),
                ast: avg(l.ast, gp),
                stl: avg(l.stl, gp),
                blk: avg(l.blk, gp),
                tov: avg(l.tov, gp),
                fgp: pct(fgm(l), fga(l)),
                outp: pct(l.outm, l.outa),
                ftp: pct(l.ftm, l.fta),
                eff: avg(eff(l), gp),
              },
            }))}
          />
          <Muted style={{ fontSize: 12 }}>Ext%: lançamentos exteriores (3P em 5x5, 2P em 3x3)</Muted>

          <Card>
            <H2>Médias por jogo vs adversários</H2>
            <Comparison us={team.name} them="Adversários" rows={comparisonRows(s.team, s.opp, s.games[n - 1].format, n)} />
          </Card>

          <Card>
            <H2>Melhores quintetos da época</H2>
            <Lineups lineups={seasonLineups(s.games)} players={team.players} timed={s.timedGames > 0} season />
          </Card>

          <Card>
            <H2>Jogos</H2>
            {[...s.games].reverse().map((g) => {
              const gs = summarizeGame(g);
              const r = !g.finished ? '…' : gs.us > gs.them ? 'V' : gs.us < gs.them ? 'D' : 'E';
              return (
                <Pressable key={g.id} style={styles.gameRow} onPress={() => router.push(`/game/${g.id}/report`)}>
                  <Text style={[styles.res, { color: r === 'V' ? colors.green : r === 'D' ? colors.red : colors.muted }]}>
                    {r}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.opp}>vs {g.opponent}</Text>
                    <Muted style={{ fontSize: 12 }}>{formatDate(g.date)}</Muted>
                  </View>
                  <Text style={styles.gameScore}>
                    {gs.us}–{gs.them}
                  </Text>
                  <Text style={styles.chev}>›</Text>
                </Pressable>
              );
            })}
          </Card>
        </>
      )}
    </ScrollView>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiVal}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kpis: { flexDirection: 'row', gap: 8 },
  kpi: {
    flex: 1,
    backgroundColor: colors.greenDark,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  kpiVal: { color: colors.white, fontWeight: '900', fontSize: 18 },
  kpiLabel: { color: '#CFE0D4', fontSize: 11, fontWeight: '600', marginTop: 2 },
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  res: { width: 22, fontWeight: '900', fontSize: 18, textAlign: 'center' },
  opp: { fontWeight: '700', color: colors.text },
  gameScore: { fontWeight: '900', fontSize: 16, color: colors.text, fontVariant: ['tabular-nums'] },
  chev: { fontSize: 22, color: colors.muted },
});
