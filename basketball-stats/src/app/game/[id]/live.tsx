import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Muted } from '../../../components/ui';
import { periodLabel, reb, shotLabels, summarizeGame } from '../../../lib/stats';
import { useStore } from '../../../lib/store';
import { colors, radius } from '../../../lib/theme';
import { ActionType, GameEvent, Player } from '../../../lib/types';

type PadAction = { type: ActionType; label: string; tone: 'make' | 'miss' | 'neutral' | 'bad' | 'opp'; points?: number };

export default function LiveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { games, teams, addEvent, removeEvent, undo, updateGame } = useStore();
  const game = games.find((g) => g.id === id);
  const team = teams.find((t) => t.id === game?.teamId);
  const insets = useSafeAreaInsets();

  const [selAction, setSelAction] = useState<PadAction | null>(null);
  const [selPlayer, setSelPlayer] = useState<string | null>(null);
  const [assistFor, setAssistFor] = useState<string | null>(null);
  const [subsOpen, setSubsOpen] = useState(false);

  const summary = useMemo(() => (game ? summarizeGame(game) : null), [game]);

  const pad = useMemo<PadAction[]>(() => {
    const l = shotLabels(game?.format ?? '5x5');
    return [
      { type: 'INM', label: `${l.inside} ✓`, tone: 'make' },
      { type: 'INX', label: `${l.inside} ✗`, tone: 'miss' },
      { type: 'OUTM', label: `${l.outside} ✓`, tone: 'make' },
      { type: 'OUTX', label: `${l.outside} ✗`, tone: 'miss' },
      { type: 'FTM', label: 'LL ✓', tone: 'make' },
      { type: 'FTX', label: 'LL ✗', tone: 'miss' },
      { type: 'OREB', label: 'Ress. Of.', tone: 'neutral' },
      { type: 'DREB', label: 'Ress. Def.', tone: 'neutral' },
      { type: 'AST', label: 'Assist.', tone: 'neutral' },
      { type: 'STL', label: 'Roubo', tone: 'neutral' },
      { type: 'BLK', label: 'Desarme', tone: 'neutral' },
      { type: 'TOV', label: 'Perda', tone: 'bad' },
      { type: 'PF', label: 'Falta', tone: 'bad' },
      { type: 'OPP', label: 'Adv +1', tone: 'opp', points: 1 },
      { type: 'OPP', label: 'Adv +2', tone: 'opp', points: 2 },
      ...(game?.format === '3x3' ? [] : [{ type: 'OPP' as const, label: 'Adv +3', tone: 'opp' as const, points: 3 }]),
    ];
  }, [game?.format]);

  if (!game || !team || !summary) return null;

  const playerById = (pid?: string) => team.players.find((p) => p.id === pid);
  const onCourt = game.onCourt.map((pid) => playerById(pid)).filter(Boolean) as Player[];
  const bench = game.roster.filter((pid) => !game.onCourt.includes(pid));
  const teamFouls = game.events.filter((e) => e.type === 'PF' && e.period === game.currentPeriod).length;
  const maxOnCourt = game.format === '3x3' ? 3 : 5;

  const commit = (action: PadAction, playerId?: string) => {
    const base: Omit<GameEvent, 'id' | 'at'> = {
      period: game.currentPeriod,
      type: action.type,
      playerId,
      points: action.points,
    };
    if (action.type === 'OPP' || action.type === 'INM' || action.type === 'OUTM' || action.type === 'FTM') {
      base.onCourt = [...game.onCourt];
    }
    addEvent(game.id, base);
    Haptics.impactAsync(
      action.tone === 'make' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
    ).catch(() => {});
    setSelAction(null);
    setSelPlayer(null);
    setAssistFor(
      (action.type === 'INM' || action.type === 'OUTM') && playerId && game.onCourt.length > 1 ? playerId : null,
    );
  };

  const tapAction = (a: PadAction) => {
    if (a.type === 'OPP') return commit(a);
    if (selPlayer) return commit(a, selPlayer);
    setSelAction((cur) => (cur?.label === a.label ? null : a));
    Haptics.selectionAsync().catch(() => {});
  };

  const tapPlayer = (pid: string) => {
    if (selAction) return commit(selAction, pid);
    setSelPlayer((cur) => (cur === pid ? null : pid));
    Haptics.selectionAsync().catch(() => {});
  };

  const giveAssist = (pid: string) => {
    addEvent(game.id, { period: game.currentPeriod, type: 'AST', playerId: pid });
    Haptics.selectionAsync().catch(() => {});
    setAssistFor(null);
  };

  const changePeriod = (delta: number) => {
    const next = game.currentPeriod + delta;
    if (next < 1) return;
    if (next > game.periods && delta > 0) {
      Alert.alert(
        'Fim do tempo regulamentar',
        summary.us === summary.them ? 'O jogo está empatado.' : 'Queres terminar o jogo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Prolongamento', onPress: () => updateGame(game.id, { currentPeriod: next }) },
          { text: 'Terminar jogo', style: 'destructive', onPress: finish },
        ],
      );
      return;
    }
    updateGame(game.id, { currentPeriod: next });
  };

  const finish = () => {
    updateGame(game.id, { finished: true });
    router.replace(`/game/${game.id}/report`);
  };

  const confirmFinish = () =>
    Alert.alert('Terminar jogo?', `${team.name} ${summary.us} – ${summary.them} ${game.opponent}`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Terminar', onPress: finish },
    ]);

  const toggleCourt = (pid: string) => {
    const isOn = game.onCourt.includes(pid);
    if (!isOn && game.onCourt.length >= maxOnCourt) {
      Alert.alert('Campo cheio', `Já tens ${maxOnCourt} jogadores em campo. Tira um primeiro.`);
      return;
    }
    updateGame(game.id, {
      onCourt: isOn ? game.onCourt.filter((x) => x !== pid) : [...game.onCourt, pid],
    });
  };

  const describe = (e: GameEvent) => {
    if (e.type === 'OPP') return `${game.opponent} +${e.points}`;
    const p = playerById(e.playerId);
    const label = pad.find((a) => a.type === e.type)?.label ?? e.type;
    return `#${p?.number ?? '?'} ${p?.name ?? ''} · ${label}`;
  };

  const recent = [...game.events].reverse().slice(0, 6);
  const hint = selAction
    ? `Agora toca no jogador → ${selAction.label}`
    : selPlayer
      ? `Agora toca na ação para #${playerById(selPlayer)?.number} ${playerById(selPlayer)?.name}`
      : 'Toca numa ação e depois no jogador (ou ao contrário)';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen
        options={{
          title: `vs ${game.opponent}`,
          headerRight: () => (
            <Pressable hitSlop={10} onPress={() => router.push(`/game/${game.id}/report`)}>
              <Text style={{ color: colors.white, fontWeight: '700' }}>Relatório</Text>
            </Pressable>
          ),
        }}
      />

      {/* Marcador */}
      <View style={styles.board}>
        <View style={styles.side}>
          <Text style={styles.boardTeam} numberOfLines={1}>{team.name}</Text>
          <Text style={styles.boardScore}>{summary.us}</Text>
          <Text style={[styles.fouls, teamFouls >= 4 && { color: colors.orange }]}>Faltas: {teamFouls}</Text>
        </View>
        <View style={styles.periodBox}>
          <Pressable hitSlop={10} onPress={() => changePeriod(-1)}>
            <Text style={styles.periodArrow}>‹</Text>
          </Pressable>
          <Text style={styles.period}>{periodLabel(game.format, game.periods, game.currentPeriod)}</Text>
          <Pressable hitSlop={10} onPress={() => changePeriod(1)}>
            <Text style={styles.periodArrow}>›</Text>
          </Pressable>
        </View>
        <View style={styles.side}>
          <Text style={styles.boardTeam} numberOfLines={1}>{game.opponent}</Text>
          <Text style={styles.boardScore}>{summary.them}</Text>
          <Text style={styles.fouls}> </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 12, gap: 10, paddingBottom: 12 }}>
        <Text style={[styles.hint, (selAction || selPlayer) && styles.hintActive]}>{hint}</Text>

        {/* Campo com jogadores */}
        <View style={styles.court}>
          <View style={styles.courtArc} />
          <View style={styles.players}>
            {onCourt.map((p) => {
              const l = summary.players[p.id];
              const fouls = l?.pf ?? 0;
              const sel = selPlayer === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => tapPlayer(p.id)}
                  style={({ pressed }) => [
                    styles.player,
                    sel && styles.playerSel,
                    !!selAction && styles.playerTarget,
                    pressed && { transform: [{ scale: 0.96 }] },
                  ]}
                >
                  <View style={styles.playerTop}>
                    <View style={styles.jersey}>
                      <Text style={styles.jerseyText}>{p.number}</Text>
                    </View>
                    <Text style={styles.playerName} numberOfLines={1}>{p.name}</Text>
                  </View>
                  <Text style={styles.playerStats}>
                    {l?.pts ?? 0} pts · {l ? reb(l) : 0} r · {l?.ast ?? 0} a
                  </Text>
                  <View style={styles.foulRow}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.foulDot,
                          i < fouls && { backgroundColor: fouls >= 4 ? colors.red : colors.orange },
                        ]}
                      />
                    ))}
                  </View>
                </Pressable>
              );
            })}
            {onCourt.length === 0 && <Muted>Sem jogadores em campo — usa “Substituições”.</Muted>}
          </View>
        </View>

        {assistFor && (
          <View style={styles.assist}>
            <Text style={styles.assistTitle}>Assistência de…</Text>
            <View style={styles.assistRow}>
              {onCourt
                .filter((p) => p.id !== assistFor)
                .map((p) => (
                  <Pressable key={p.id} style={styles.assistBtn} onPress={() => giveAssist(p.id)}>
                    <Text style={styles.assistBtnText}>#{p.number}</Text>
                  </Pressable>
                ))}
              <Pressable style={[styles.assistBtn, styles.assistNone]} onPress={() => setAssistFor(null)}>
                <Text style={[styles.assistBtnText, { color: colors.muted }]}>Sem</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Ações */}
        <View style={styles.pad}>
          {pad.map((a) => {
            const active = selAction?.label === a.label;
            return (
              <Pressable
                key={a.label}
                onPress={() => tapAction(a)}
                style={({ pressed }) => [
                  styles.action,
                  toneStyle[a.tone],
                  active && styles.actionActive,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.actionText, a.tone === 'opp' && { color: colors.white }]}>{a.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Últimas jogadas */}
        <View style={styles.log}>
          <Text style={styles.logTitle}>Últimas jogadas</Text>
          {recent.length === 0 && <Muted>Ainda nada registado.</Muted>}
          {recent.map((e) => (
            <Pressable
              key={e.id}
              onLongPress={() =>
                Alert.alert('Apagar jogada?', describe(e), [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Apagar', style: 'destructive', onPress: () => removeEvent(game.id, e.id) },
                ])
              }
              style={styles.logRow}
            >
              <Text style={styles.logPeriod}>{periodLabel(game.format, game.periods, e.period)}</Text>
              <Text style={styles.logText} numberOfLines={1}>{describe(e)}</Text>
            </Pressable>
          ))}
          {recent.length > 0 && <Muted style={{ fontSize: 12, marginTop: 4 }}>Mantém premido para apagar</Muted>}
        </View>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <Button small title={`Subst. (${bench.length})`} variant="ghost" style={{ flex: 1 }} onPress={() => setSubsOpen(true)} />
        <Button
          small
          title="↶ Desfazer"
          variant="ghost"
          style={{ flex: 1 }}
          disabled={game.events.length === 0}
          onPress={() => {
            undo(game.id);
            setAssistFor(null);
          }}
        />
        <Button small title="Terminar" variant="accent" style={{ flex: 1 }} onPress={confirmFinish} />
      </View>

      <Modal visible={subsOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSubsOpen(false)}>
        <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
          <View style={styles.modalHead}>
            <Text style={styles.modalTitle}>Em campo ({game.onCourt.length}/{maxOnCourt})</Text>
            <Button small title="Feito" onPress={() => setSubsOpen(false)} />
          </View>
          <Muted style={{ marginBottom: 12 }}>Toca para entrar ou sair de campo.</Muted>
          <ScrollView contentContainerStyle={{ gap: 8 }}>
            {game.roster.map((pid) => {
              const p = playerById(pid);
              if (!p) return null;
              const on = game.onCourt.includes(pid);
              const l = summary.players[pid];
              return (
                <Pressable key={pid} onPress={() => toggleCourt(pid)} style={[styles.subRow, on && styles.subRowOn]}>
                  <View style={styles.jersey}>
                    <Text style={styles.jerseyText}>{p.number}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subName}>{p.name}</Text>
                    <Muted>
                      {l?.pts ?? 0} pts · {l?.pf ?? 0} faltas
                    </Muted>
                  </View>
                  <Text style={[styles.subState, on && { color: colors.green }]}>{on ? 'EM CAMPO' : 'BANCO'}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const toneStyle = StyleSheet.create({
  make: { backgroundColor: colors.greenLight, borderColor: colors.green },
  miss: { backgroundColor: colors.white, borderColor: colors.border },
  neutral: { backgroundColor: colors.white, borderColor: colors.border },
  bad: { backgroundColor: colors.redLight, borderColor: colors.red },
  opp: { backgroundColor: colors.greenDark, borderColor: colors.greenDark },
});

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.greenDark,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  side: { flex: 1, alignItems: 'center' },
  boardTeam: { color: '#CFE0D4', fontWeight: '700', fontSize: 13 },
  boardScore: { color: colors.white, fontWeight: '900', fontSize: 40, fontVariant: ['tabular-nums'] },
  fouls: { color: '#CFE0D4', fontSize: 12 },
  periodBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  periodArrow: { color: colors.white, fontSize: 28, fontWeight: '700', paddingHorizontal: 4 },
  period: { color: colors.orange, fontWeight: '900', fontSize: 16, minWidth: 44, textAlign: 'center' },
  hint: {
    textAlign: 'center',
    color: colors.muted,
    fontWeight: '600',
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  hintActive: { backgroundColor: colors.orangeLight, color: '#8A4A0E' },
  court: {
    backgroundColor: colors.court,
    borderRadius: radius.lg,
    padding: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#C9AE73',
  },
  courtArc: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    alignSelf: 'center',
    top: -150,
  },
  players: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  player: {
    width: '31.5%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.md,
    padding: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  playerSel: { borderColor: colors.orange, backgroundColor: colors.orangeLight },
  playerTarget: { borderColor: colors.green, borderStyle: 'dashed' },
  playerTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  jersey: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 4,
    borderRadius: 7,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jerseyText: { color: colors.white, fontWeight: '900', fontSize: 14 },
  playerName: { flex: 1, fontWeight: '700', color: colors.text, fontSize: 13 },
  playerStats: { fontSize: 11, color: colors.muted, marginTop: 4, fontWeight: '600' },
  foulRow: { flexDirection: 'row', gap: 3, marginTop: 5 },
  foulDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  assist: { backgroundColor: colors.orangeLight, borderRadius: radius.md, padding: 10 },
  assistTitle: { fontWeight: '800', color: '#8A4A0E', marginBottom: 6 },
  assistRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  assistBtn: {
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: colors.orange,
  },
  assistNone: { borderColor: colors.border },
  assistBtnText: { fontWeight: '800', color: colors.text },
  pad: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  action: {
    width: '23%',
    flexGrow: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  actionActive: { borderColor: colors.orange, borderWidth: 3, backgroundColor: colors.orangeLight },
  actionText: { fontWeight: '800', fontSize: 14, color: colors.text },
  log: { backgroundColor: colors.card, borderRadius: radius.md, padding: 12 },
  logTitle: { fontWeight: '800', color: colors.text, marginBottom: 6 },
  logRow: { flexDirection: 'row', gap: 8, paddingVertical: 5 },
  logPeriod: { width: 40, color: colors.muted, fontWeight: '700', fontSize: 13 },
  logText: { flex: 1, color: colors.text, fontSize: 14 },
  bottom: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  modalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: colors.text },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  subRowOn: { borderColor: colors.green, backgroundColor: colors.greenLight },
  subName: { fontWeight: '700', fontSize: 16, color: colors.text },
  subState: { fontWeight: '900', fontSize: 12, color: colors.muted },
});
