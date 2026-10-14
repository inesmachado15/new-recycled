import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fmtMinutes } from '../lib/clock';
import { LineupLine, plusMinusText } from '../lib/stats';
import { colors, radius } from '../lib/theme';
import { Player } from '../lib/types';
import { Muted } from './ui';

const PREVIEW = 5;

/** Lista de quintetos ordenada pelo +/-. */
export function Lineups({
  lineups,
  players,
  timed,
  season,
}: {
  lineups: LineupLine[];
  players: Player[];
  timed: boolean;
  season?: boolean;
}) {
  const [all, setAll] = useState(false);
  if (lineups.length === 0) {
    return <Muted>Ainda não há dados de quintetos — aparecem quando se marcam pontos com o cinco completo em campo.</Muted>;
  }
  const shown = all ? lineups : lineups.slice(0, PREVIEW);
  const byId = (id: string) => players.find((p) => p.id === id);

  return (
    <View style={{ gap: 8 }}>
      {shown.map((l, i) => {
        const pm = l.pf - l.pa;
        const ps = l.ids
          .map(byId)
          .filter((p): p is Player => !!p)
          .sort((a, b) => Number(a.number) - Number(b.number));
        return (
          <View key={l.key} style={styles.row}>
            <Text style={styles.rank}>{i + 1}</Text>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={styles.chips}>
                {ps.map((p) => (
                  <View key={p.id} style={styles.chip}>
                    <Text style={styles.chipText}>{p.number}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.names} numberOfLines={1}>
                {ps.map((p) => p.name.split(' ')[0]).join(' · ')}
              </Text>
              <Muted style={{ fontSize: 12 }}>
                {timed ? `${fmtMinutes(l.secs)} min · ` : ''}
                {l.pf}–{l.pa} pontos
                {season ? ` · ${l.games} jogo${l.games === 1 ? '' : 's'}` : ''}
              </Muted>
            </View>
            <Text style={[styles.pm, { color: pm > 0 ? colors.green : pm < 0 ? colors.red : colors.muted }]}>
              {plusMinusText(pm)}
            </Text>
          </View>
        );
      })}
      {lineups.length > PREVIEW && (
        <Pressable onPress={() => setAll((v) => !v)} hitSlop={8}>
          <Text style={styles.more}>{all ? 'Mostrar menos' : `Ver todos (${lineups.length})`}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 10,
  },
  rank: { width: 18, fontWeight: '900', color: colors.muted, textAlign: 'center' },
  chips: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  chip: {
    minWidth: 28,
    height: 26,
    paddingHorizontal: 4,
    borderRadius: 6,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { color: colors.white, fontWeight: '900', fontSize: 13 },
  names: { fontSize: 12, fontWeight: '600', color: colors.text },
  pm: { fontSize: 24, fontWeight: '900', minWidth: 52, textAlign: 'right', fontVariant: ['tabular-nums'] },
  more: { textAlign: 'center', color: colors.green, fontWeight: '800', paddingVertical: 6 },
});
