import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../lib/theme';

export interface Column {
  key: string;
  label: string;
  width?: number;
  bold?: boolean;
}

/** Tabela com 1ª coluna fixa e resto com scroll horizontal. */
export function StatTable({
  columns,
  rows,
  total,
  nameWidth = 120,
}: {
  columns: Column[];
  rows: { key: string; name: string; values: Record<string, string | number> }[];
  total?: { name: string; values: Record<string, string | number> };
  nameWidth?: number;
}) {
  const all = total ? [...rows, { key: '__total', ...total }] : rows;
  return (
    <View style={styles.wrap}>
      <View style={{ width: nameWidth }}>
        <Text style={[styles.head, styles.cell, { textAlign: 'left' }]}>Jogador</Text>
        {all.map((r, i) => (
          <Text
            key={r.key}
            numberOfLines={1}
            style={[styles.cell, styles.name, i % 2 === 1 && styles.zebra, r.key === '__total' && styles.total]}
          >
            {r.name}
          </Text>
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          <View style={{ flexDirection: 'row' }}>
            {columns.map((c) => (
              <Text key={c.key} style={[styles.head, styles.cell, { width: c.width ?? 44 }]}>
                {c.label}
              </Text>
            ))}
          </View>
          {all.map((r, i) => (
            <View
              key={r.key}
              style={[{ flexDirection: 'row' }, i % 2 === 1 && styles.zebra, r.key === '__total' && styles.total]}
            >
              {columns.map((c) => (
                <Text
                  key={c.key}
                  style={[styles.cell, { width: c.width ?? 44 }, (c.bold || r.key === '__total') && { fontWeight: '800' }]}
                >
                  {r.values[c.key]}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  head: { backgroundColor: colors.green, color: colors.white, fontWeight: '800', fontSize: 12 },
  cell: { height: 34, lineHeight: 34, textAlign: 'center', fontSize: 13, color: colors.text, paddingHorizontal: 6 },
  name: { textAlign: 'left', fontWeight: '600' },
  zebra: { backgroundColor: colors.bg },
  total: { backgroundColor: colors.orangeLight },
});
