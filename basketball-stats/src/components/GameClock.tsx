import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { fmtClock, liveRemaining } from '../lib/clock';
import { colors, radius } from '../lib/theme';
import { Game } from '../lib/types';

/** Relógio do jogo: toca para iniciar/parar, mantém premido para acertar. */
export function GameClock({
  game,
  onToggle,
  onExpire,
  onEdit,
}: {
  game: Game;
  onToggle: () => void;
  onExpire: () => void;
  onEdit: () => void;
}) {
  const [, setTick] = useState(0);
  const expired = useRef(false);
  const running = !!game.clockRunning;

  useEffect(() => {
    if (!running) return;
    expired.current = false;
    const t = setInterval(() => setTick((x) => x + 1), 100);
    return () => clearInterval(t);
  }, [running]);

  const remaining = liveRemaining(game);

  useEffect(() => {
    if (running && remaining <= 0 && !expired.current) {
      expired.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      onExpire();
    }
  });

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
        onToggle();
      }}
      onLongPress={onEdit}
      style={({ pressed }) => [styles.box, running && styles.running, pressed && { opacity: 0.8 }]}
    >
      <Text style={[styles.time, remaining <= 0 && { color: colors.red }]}>{fmtClock(remaining)}</Text>
      <Text style={styles.state}>{running ? '❚❚ parar' : '▶ iniciar'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 104,
  },
  running: { borderColor: colors.orange },
  time: { color: '#FFD08A', fontSize: 30, fontWeight: '900', fontVariant: ['tabular-nums'] },
  state: { color: '#CFE0D4', fontSize: 11, fontWeight: '700' },
});
