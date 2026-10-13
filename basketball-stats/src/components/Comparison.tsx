import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../lib/theme';

export function Comparison({
  us,
  them,
  rows,
}: {
  us: string;
  them: string;
  rows: { label: string; us: string; them: string }[];
}) {
  return (
    <View>
      <View style={styles.row}>
        <Text style={[styles.val, styles.head]} numberOfLines={1}>{us}</Text>
        <Text style={styles.label} />
        <Text style={[styles.val, styles.head]} numberOfLines={1}>{them}</Text>
      </View>
      {rows.map((r) => (
        <View key={r.label} style={styles.row}>
          <Text style={styles.val}>{r.us}</Text>
          <Text style={styles.label}>{r.label}</Text>
          <Text style={styles.val}>{r.them}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  val: { flex: 1, textAlign: 'center', fontWeight: '700', color: colors.text, fontSize: 13, fontVariant: ['tabular-nums'] },
  head: { color: colors.green, fontWeight: '900' },
  label: { width: 104, textAlign: 'center', color: colors.muted, fontSize: 12, fontWeight: '600' },
});
