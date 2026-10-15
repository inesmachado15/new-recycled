import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, H2, Muted } from '../../components/ui';
import { BackupData, exportBackup, exportCsv, mergeData, pickBackup } from '../../lib/backup';
import { useStore } from '../../lib/store';
import { colors, radius } from '../../lib/theme';
import { useLayout } from '../../lib/useLayout';
import { APP_VERSION, APP_VERSION_DATE, APP_VERSION_NOTES } from '../../lib/version';

export default function DataScreen() {
  const { teams, games, replaceAll } = useStore();
  const [busy, setBusy] = useState(false);
  const { content } = useLayout();
  const empty = teams.length === 0 && games.length === 0;
  const players = teams.reduce((n, t) => n + t.players.length, 0);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      Alert.alert('Não foi possível concluir', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const describe = (d: BackupData) =>
    `${d.teams.length} equipa(s), ${d.teams.reduce((n, t) => n + t.players.length, 0)} jogadora(s) e ${d.games.length} jogo(s)`;

  const importBackup = () =>
    run(async () => {
      const incoming = await pickBackup();
      if (!incoming) return;
      const current = { teams, games };
      const options: Parameters<typeof Alert.alert>[2] = [{ text: 'Cancelar', style: 'cancel' }];
      if (!empty) {
        options.push({
          text: 'Juntar aos atuais',
          onPress: () => {
            replaceAll(mergeData(current, incoming));
            Alert.alert('Dados juntos', 'Os dados do ficheiro foram juntos aos deste aparelho.');
          },
        });
      }
      options.push({
        text: empty ? 'Importar' : 'Substituir tudo',
        style: empty ? 'default' : 'destructive',
        onPress: () => {
          replaceAll(incoming);
          Alert.alert('Dados importados', describe(incoming));
        },
      });
      Alert.alert(
        'Importar cópia de segurança',
        `O ficheiro tem ${describe(incoming)}.` +
          (empty ? '' : '\n\n“Juntar” mantém o que já tens e acrescenta o que falta. “Substituir” apaga os dados atuais.'),
        options,
      );
    });

  return (
    <ScrollView contentContainerStyle={[{ padding: 16, gap: 14, paddingBottom: 40 }, content]}>
      <View style={styles.stats}>
        <Stat value={teams.length} label="Equipas" />
        <Stat value={players} label="Jogadoras" />
        <Stat value={games.length} label="Jogos" />
      </View>

      <Card>
        <H2>Cópia de segurança</H2>
        <Muted style={{ marginBottom: 12 }}>
          Os dados ficam guardados só neste aparelho. Exporta uma cópia regularmente e guarda-a no iCloud Drive,
          envia-a por AirDrop para o Mac ou por email.
        </Muted>
        <Button title="Exportar cópia de segurança" disabled={busy || empty} onPress={() => run(() => exportBackup({ teams, games }))} />
      </Card>

      <Card>
        <H2>Importar / passar para outro aparelho</H2>
        <Muted style={{ marginBottom: 12 }}>
          Escolhe um ficheiro de cópia de segurança (por exemplo, feito no iPhone, para abrir no iPad). Podes juntar
          os dados aos que já tens ou substituí-los.
        </Muted>
        <Button title="Importar ficheiro" variant="ghost" disabled={busy} onPress={importBackup} />
      </Card>

      <Card>
        <H2>Excel / Numbers</H2>
        <Muted style={{ marginBottom: 12 }}>
          Exporta as estatísticas de todos os jogos numa folha de cálculo (uma linha por jogadora e jogo).
        </Muted>
        <Button title="Exportar para Excel (CSV)" variant="ghost" disabled={busy || games.length === 0} onPress={() => run(() => exportCsv({ teams, games }))} />
      </Card>

      <Muted style={styles.version}>
        Basket Stats · versão {APP_VERSION} ({APP_VERSION_DATE}){'\n'}
        {APP_VERSION_NOTES}
      </Muted>
    </ScrollView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: colors.greenDark, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center' },
  statVal: { color: colors.white, fontWeight: '900', fontSize: 22 },
  version: { textAlign: 'center', fontSize: 12, marginTop: 8 },
  statLabel: { color: '#CFE0D4', fontSize: 12, fontWeight: '600' },
});
