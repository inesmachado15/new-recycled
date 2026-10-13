import { Game } from './types';

export const hasClock = (g: Game) => !!g.periodLength;

export const overtimeLength = (g: Game) => Math.min(300, g.periodLength ?? 0);

const baseRemaining = (g: Game) => g.clockRemaining ?? g.periodLength ?? 0;

/** Tempo que falta no período, em segundos (contando o tempo a correr). */
export function liveRemaining(g: Game, now = Date.now()) {
  const r = baseRemaining(g);
  if (!g.clockRunning || !g.clockStartedAt) return r;
  return Math.max(0, r - (now - g.clockStartedAt) / 1000);
}

/** Consolida o tempo decorrido: desconta no relógio e soma aos jogadores em campo. */
export function settle(g: Game, now = Date.now()): Game {
  if (!g.clockRunning || !g.clockStartedAt) return g;
  const r = baseRemaining(g);
  const elapsed = Math.min(r, Math.max(0, (now - g.clockStartedAt) / 1000));
  const secondsPlayed = { ...(g.secondsPlayed ?? {}) };
  g.onCourt.forEach((id) => (secondsPlayed[id] = (secondsPlayed[id] ?? 0) + elapsed));
  return { ...g, clockRemaining: r - elapsed, clockStartedAt: now, secondsPlayed };
}

export function startClock(g: Game, now = Date.now()): Game {
  if (!hasClock(g) || liveRemaining(g, now) <= 0) return g;
  return { ...settle(g, now), clockRunning: true, clockStartedAt: now };
}

export function stopClock(g: Game, now = Date.now()): Game {
  return { ...settle(g, now), clockRunning: false, clockStartedAt: undefined };
}

export function setRemaining(g: Game, seconds: number, now = Date.now()): Game {
  const s = settle(g, now);
  return { ...s, clockRemaining: Math.max(0, seconds), clockStartedAt: s.clockRunning ? now : undefined };
}

/** Segundos jogados por um jogador, incluindo o tempo a correr agora. */
export function playedSeconds(g: Game, id: string, now = Date.now()) {
  const base = g.secondsPlayed?.[id] ?? 0;
  if (!g.clockRunning || !g.clockStartedAt || !g.onCourt.includes(id)) return base;
  return base + (baseRemaining(g) - liveRemaining(g, now));
}

export function fmtClock(seconds: number) {
  const s = Math.max(0, seconds);
  if (s < 60) return s.toFixed(1); // últimos segundos com décimas
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
}

export function fmtMinutes(seconds: number) {
  const m = Math.floor(seconds / 60);
  const r = Math.round(seconds % 60);
  return r === 60 ? `${m + 1}:00` : `${m}:${String(r).padStart(2, '0')}`;
}

/** "7:32" ou "73" ou "7m32" → segundos; null se inválido. */
export function parseClock(text: string): number | null {
  const t = text.trim();
  const m = t.match(/^(\d{1,2})(?::|m|\.)?(\d{2})?$/);
  if (!m) return null;
  if (m[2] === undefined) return Number(m[1]) * 60;
  const sec = Number(m[2]);
  if (sec >= 60) return null;
  return Number(m[1]) * 60 + sec;
}
