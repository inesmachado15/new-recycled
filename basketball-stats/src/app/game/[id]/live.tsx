import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GameClock } from '../../../components/GameClock';
import { Button, Muted } from '../../../components/ui';
import {
  fmtMinutes,
  hasClock,
  liveRemaining,
  overtimeLength,
  parseClock,
  playedSeconds,
  settle,
  setRemaining,
  startClock,
  stopClock,
} from '../../../lib/clock';
import { actionLabel, eventPoints, periodLabel, reb, summarizeGame } from '../../../lib/stats';
import { NewEvent, useStore } from '../../../lib/store';
import { colors, radius } from '../../../lib/theme';
import { ActionType, GameEvent, Player, Side } from '../../../lib/types';

type Tone = 'make' | 'miss' | 'neutral' | 'bad';
type PadAction = { type: ActionType; tone: Tone; side: Side };

const OUR_PAD: [ActionType, Tone][] = [
  ['INM', 'make'], ['INX', 'miss'], ['OUTM', 'make'], ['OUTX', 'miss'],
  ['FTM', 'make'], ['FTX', 'miss'], ['OREB', 'neutral'], ['DREB', 'neutral'],
  ['AST', 'neutral'], ['STL', 'neutral'], ['BLK', 'neutral'], ['TOV', 'bad'],
  ['PF', 'bad'],
];

const THEIR_PAD: [ActionType, Tone][] = [
  ['INM', 'make'], ['INX', 'miss'], ['OUTM', 'make'], ['OUTX', 'miss'],
  ['FTM', 'make'], ['FTX', 'miss'], ['OREB', 'neutral'], ['DREB', 'neutral'],
  ['TOV', 'bad'], ['PF', 'bad'],
];

const MISSES: ActionType[] = ['INX', 'OUTX', 'FTX'];

type FollowUp = { kind: 'assist'; scorer: string } | { kind: 'rebound'; shooter: Side } | null;

export default function LiveScreen() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { games, teams, addEvents, removeEvent, undo, mutateGame } = useStore();
  const game = games.find((g) => g.id === id);
  const team = teams.find((t) => t.id === game?.teamId);
  const insets = useSafeAreaInsets();

  const [selAction, setSelAction] = useState<PadAction | null>(null);
  const [selPlayer, setSelPlayer] = useState<string | null>(null);
  const [followUp, setFollowUp] = useState<FollowUp>(null);
  const [subsOpen, setSubsOpen] = useState(false);

  // Atualiza os minutos dos jogadores enquanto o relógio corre
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!game?.clockRunning) return;
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [game?.clockRunning]);

  const summary = useMemo(() => (game ? summarizeGame(game) : null), [game]);

  if (!game || !team || !summary) return null;

  const fmt = game.format;
  const timed = hasClock(game);
  const playerById = (pid?: string) => team.players.find((p) => p.id === pid);
  const onCourt = game.onCourt.map((pid) => playerById(pid)).filter(Boolean) as Player[];
  const bench = game.roster.filter((pid) => !game.onCourt.includes(pid));
  const fouls = (side: Side) =>
    game.events.filter(
      (e) => e.type === 'PF' && e.period === game.currentPeriod && (e.side ?? 'us') === side,
    ).length;
  const maxOnCourt = fmt === '3x3' ? 3 : 5;
  const ourPad: PadAction[] = OUR_PAD.map(([type, tone]) => ({ type, tone, side: 'us' }));
  const theirPad: PadAction[] = THEIR_PAD.map(([type, tone]) => ({ type, tone, side: 'them' }));

  const base = (type: ActionType, side: Side, playerId?: string): NewEvent => {
    const e: NewEvent = { period: game.currentPeriod, type, side, playerId };
    if (timed) e.clock = liveRemaining(game);
    if (eventPoints(e as GameEvent, fmt) > 0) e.onCourt = [...game.onCourt];
    return e;
  };

  const commit = (action: PadAction, playerId?: string) => {
    const events = [base(action.type, action.side, playerId)];
    // Roubo nosso = perda de bola do adversário
    if (action.side === 'us' && action.type === 'STL') events.push(base('TOV', 'them'));
    addEvents(game.id, events);
    Haptics.impactAsync(
      action.tone === 'make' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
    ).catch(() => {});
    setSelAction(null);
    setSelPlayer(null);
    if (action.side === 'us' && (action.type === 'INM' || action.type === 'OUTM') && playerId && onCourt.length > 1) {
      setFollowUp({ kind: 'assist', scorer: playerId });
    } else if (MISSES.includes(action.type)) {
      setFollowUp({ kind: 'rebound', shooter: action.side });
    } else {
      setFollowUp(null);
    }
  };

  const tapAction = (a: PadAction) => {
    if (a.side === 'them') return commit(a);
    if (selPlayer) return commit(a, selPlayer);
    setSelAction((cur) => (cur?.type === a.type ? null : a));
    Haptics.selectionAsync().catch(() => {});
  };

  const tapPlayer = (pid: string) => {
    if (selAction) return commit(selAction, pid);
    setSelPlayer((cur) => (cur === pid ? null : pid));
    Haptics.selectionAsync().catch(() => {});
  };

  const giveAssist = (pid: string) => {
    addEvents(game.id, [base('AST', 'us', pid)]);
    Haptics.selectionAsync().catch(() => {});
    setFollowUp(null);
  };

  const giveRebound = (shooter: Side, pid?: string) => {
    // Quem ressalta o lançamento da própria equipa faz ressalto ofensivo
    if (pid) addEvents(game.id, [base(shooter === 'us' ? 'OREB' : 'DREB', 'us', pid)]);
    else addEvents(game.id, [base(shooter === 'them' ? 'OREB' : 'DREB', 'them')]);
    Haptics.selectionAsync().catch(() => {});
    setFollowUp(null);
  };

  const toggleClock = () => mutateGame(game.id, (g) => (g.clockRunning ? stopClock(g) : startClock(g)));

  const editClock = () => {
    if (Platform.OS !== 'ios') return;
    Alert.prompt(
      'Acertar relógio',
      'Tempo restante no período (ex.: 7:32)',
      (v) => {
        const secs = parseClock(v ?? '');
        if (secs == null) return Alert.alert('Formato inválido', 'Usa minutos:segundos, por exemplo 7:32.');
        mutateGame(game.id, (g) => setRemaining(g, secs));
      },
      'plain-text',
      fmtMinutes(Math.floor(liveRemaining(game))),
      'numbers-and-punctuation',
    );
  };

  const goToPeriod = (next: number) =>
    mutateGame(game.id, (g) => ({
      ...stopClock(g),
      currentPeriod: next,
      clockRemaining: next > g.periods ? overtimeLength(g) : g.periodLength,
    }));

  const changePeriod = (delta: number) => {
    const next = game.currentPeriod + delta;
    if (next < 1) return;
    if (delta < 0) {
      Alert.alert('Voltar ao período anterior?', 'O relógio fica parado e mantém o tempo atual.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Voltar', onPress: () => mutateGame(game.id, (g) => ({ ...stopClock(g), currentPeriod: next })) },
      ]);
      return;
    }
    if (next > game.periods) {
      Alert.alert(
        'Fim do tempo regulamentar',
        summary.us === summary.them ? 'O jogo está empatado.' : 'Queres terminar o jogo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Prolongamento', onPress: () => goToPeriod(next) },
          { text: 'Terminar jogo', style: 'destructive', onPress: finish },
        ],
      );
      return;
    }
    Alert.alert(`Passar para ${periodLabel(fmt, game.periods, next)}?`, timed ? 'O relógio é reposto.' : undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Avançar', onPress: () => goToPeriod(next) },
    ]);
  };

  const finish = () => {
    mutateGame(game.id, (g) => ({ ...stopClock(g), finished: true }));
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
    // Consolida os minutos antes de mudar quem está em campo
    mutateGame(game.id, (g) => {
      const s = settle(g);
      return { ...s, onCourt: isOn ? s.onCourt.filter((x) => x !== pid) : [...s.onCourt, pid] };
    });
  };

  const describe = (e: GameEvent) => {
    const label = actionLabel(e.type, fmt, e.points);
    if (e.side === 'them' || e.type === 'OPP') return `${game.opponent} · ${label}`;
    const p = playerById(e.playerId);
    return `#${p?.number ?? '?'} ${p?.name ?? ''} · ${label}`;
  };

  const recent = [...game.events].reverse().slice(0, 8);
  const hint = selAction
    ? `Agora toca no jogador → ${actionLabel(selAction.type, fmt)}`
    : selPlayer
      ? `Agora toca na ação para #${playerById(selPlayer)?.number} ${playerById(selPlayer)?.name}`
      : 'Toca numa ação e depois no jogador (ou ao contrário)';

  const renderPad = (pad: PadAction[], dark: boolean) => (
    <View style={styles.pad}>
      {pad.map((a) => {
        const active = selAction?.type === a.type && selAction.side === a.side;
        return (
          <Pressable
            key={a.side + a.type}
            onPress={() => tapAction(a)}
            style={({ pressed }) => [
              styles.action,
              dark ? darkTone[a.tone] : toneStyle[a.tone],
              active && styles.actionActive,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={[styles.actionText, dark && { color: colors.white }]}>{actionLabel(a.type, fmt)}</Text>
          </Pressable>
        );
      })}
    </View>
  );

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
          <Text style={[styles.fouls, fouls('us') >= 4 && { color: colors.orange }]}>Faltas: {fouls('us')}</Text>
        </View>
        <View style={styles.center}>
          {timed && (
            <GameClock
              game={game}
              onToggle={toggleClock}
              onEdit={editClock}
              onExpire={() => mutateGame(game.id, stopClock)}
            />
          )}
          <View style={styles.periodBox}>
            <Pressable hitSlop={12} onPress={() => changePeriod(-1)}>
              <Text style={styles.periodArrow}>‹</Text>
            </Pressable>
            <Text style={styles.period}>{periodLabel(fmt, game.periods, game.currentPeriod)}</Text>
            <Pressable hitSlop={12} onPress={() => changePeriod(1)}>
              <Text style={styles.periodArrow}>›</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.side}>
          <Text style={styles.boardTeam} numberOfLines={1}>{game.opponent}</Text>
          <Text style={styles.boardScore}>{summary.them}</Text>
          <Text style={[styles.fouls, fouls('them') >= 4 && { color: colors.orange }]}>Faltas: {fouls('them')}</Text>
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
              const pf = l?.pf ?? 0;
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
                        style={[styles.foulDot, i < pf && { backgroundColor: pf >= 4 ? colors.red : colors.orange }]}
                      />
                    ))}
                    {timed && <Text style={styles.mins}>{fmtMinutes(playedSeconds(game, p.id))}</Text>}
                  </View>
                </Pressable>
              );
            })}
            {onCourt.length === 0 && <Muted>Sem jogadores em campo — usa “Subst.”.</Muted>}
          </View>
        </View>

        {followUp?.kind === 'assist' && (
          <View style={styles.follow}>
            <Text style={styles.followTitle}>Assistência de…</Text>
            <View style={styles.followRow}>
              {onCourt
                .filter((p) => p.id !== followUp.scorer)
                .map((p) => (
                  <Pressable key={p.id} style={styles.followBtn} onPress={() => giveAssist(p.id)}>
                    <Text style={styles.followBtnText}>#{p.number}</Text>
                  </Pressable>
                ))}
              <Pressable style={[styles.followBtn, styles.followNone]} onPress={() => setFollowUp(null)}>
                <Text style={[styles.followBtnText, { color: colors.muted }]}>Sem</Text>
              </Pressable>
            </View>
          </View>
        )}

        {followUp?.kind === 'rebound' && (
          <View style={styles.follow}>
            <Text style={styles.followTitle}>
              Ressalto {followUp.shooter === 'us' ? '(lançamento nosso)' : `(lançamento de ${game.opponent})`}
            </Text>
            <View style={styles.followRow}>
              {onCourt.map((p) => (
                <Pressable key={p.id} style={styles.followBtn} onPress={() => giveRebound(followUp.shooter, p.id)}>
                  <Text style={styles.followBtnText}>#{p.number}</Text>
                </Pressable>
              ))}
              <Pressable
                style={[styles.followBtn, { backgroundColor: colors.greenDark, borderColor: colors.greenDark }]}
                onPress={() => giveRebound(followUp.shooter)}
              >
                <Text style={[styles.followBtnText, { color: colors.white }]}>Adversário</Text>
              </Pressable>
              <Pressable style={[styles.followBtn, styles.followNone]} onPress={() => setFollowUp(null)}>
                <Text style={[styles.followBtnText, { color: colors.muted }]}>Ignorar</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Ações da nossa equipa */}
        <Text style={styles.section}>{team.name}</Text>
        {renderPad(ourPad, false)}
        <Muted style={{ fontSize: 12, marginTop: -4 }}>Um roubo regista também uma perda de bola do adversário.</Muted>

        {/* Ações do adversário (só equipa) */}
        <View style={styles.oppBox}>
          <Text style={[styles.section, { color: colors.white, marginBottom: 6 }]}>{game.opponent} · registo direto</Text>
          {renderPad(theirPad, true)}
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
              <Text style={styles.logPeriod}>
                {periodLabel(fmt, game.periods, e.period)}
                {e.clock != null ? ` ${fmtMinutes(Math.floor(e.clock))}` : ''}
              </Text>
              <Text style={[styles.logText, (e.side === 'them' || e.type === 'OPP') && { color: colors.muted }]} numberOfLines={1}>
                {describe(e)}
              </Text>
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
            setFollowUp(null);
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
          <Muted style={{ marginBottom: 12 }}>
            Toca para entrar ou sair de campo.{timed ? ' Os minutos são contados enquanto o relógio corre.' : ''}
          </Muted>
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
                      {timed ? ` · ${fmtMinutes(playedSeconds(game, pid))} min` : ''}
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
});

const darkTone = StyleSheet.create({
  make: { backgroundColor: '#3E7D55', borderColor: '#5E9B73' },
  miss: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.25)' },
  neutral: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.25)' },
  bad: { backgroundColor: '#7A3330', borderColor: '#A3504B' },
});

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.greenDark,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  side: { flex: 1, alignItems: 'center' },
  center: { alignItems: 'center', gap: 6 },
  boardTeam: { color: '#CFE0D4', fontWeight: '700', fontSize: 13 },
  boardScore: { color: colors.white, fontWeight: '900', fontSize: 38, fontVariant: ['tabular-nums'] },
  fouls: { color: '#CFE0D4', fontSize: 12 },
  periodBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    paddingHorizontal: 6,
  },
  periodArrow: { color: colors.white, fontSize: 26, fontWeight: '700', paddingHorizontal: 6 },
  period: { color: colors.orange, fontWeight: '900', fontSize: 15, minWidth: 40, textAlign: 'center' },
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
  foulRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 5 },
  foulDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border },
  mins: { marginLeft: 'auto', fontSize: 11, fontWeight: '700', color: colors.blue, fontVariant: ['tabular-nums'] },
  follow: { backgroundColor: colors.orangeLight, borderRadius: radius.md, padding: 10 },
  followTitle: { fontWeight: '800', color: '#8A4A0E', marginBottom: 6 },
  followRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  followBtn: {
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: colors.orange,
  },
  followNone: { borderColor: colors.border },
  followBtnText: { fontWeight: '800', color: colors.text },
  section: { fontWeight: '800', color: colors.text, fontSize: 14 },
  pad: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  action: {
    width: '23%',
    flexGrow: 1,
    paddingVertical: 13,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  actionActive: { borderColor: colors.orange, borderWidth: 3, backgroundColor: colors.orangeLight },
  actionText: { fontWeight: '800', fontSize: 14, color: colors.text },
  oppBox: { backgroundColor: colors.greenDark, borderRadius: radius.lg, padding: 10 },
  log: { backgroundColor: colors.card, borderRadius: radius.md, padding: 12 },
  logTitle: { fontWeight: '800', color: colors.text, marginBottom: 6 },
  logRow: { flexDirection: 'row', gap: 8, paddingVertical: 5 },
  logPeriod: { width: 76, color: colors.muted, fontWeight: '700', fontSize: 13, fontVariant: ['tabular-nums'] },
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
