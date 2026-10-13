import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Game, GameEvent, Player, Team } from './types';

const KEY = 'basketstats:v1';

interface Data {
  teams: Team[];
  games: Game[];
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

interface Store extends Data {
  ready: boolean;
  addTeam: (name: string) => Team;
  updateTeam: (id: string, patch: Partial<Omit<Team, 'id'>>) => void;
  deleteTeam: (id: string) => void;
  addPlayer: (teamId: string, name: string, number: string) => void;
  updatePlayer: (teamId: string, player: Player) => void;
  removePlayer: (teamId: string, playerId: string) => void;
  createGame: (g: Omit<Game, 'id' | 'events' | 'finished' | 'currentPeriod'>) => Game;
  updateGame: (id: string, patch: Partial<Omit<Game, 'id'>>) => void;
  deleteGame: (id: string) => void;
  addEvent: (gameId: string, e: Omit<GameEvent, 'id' | 'at'>) => void;
  removeEvent: (gameId: string, eventId: string) => void;
  undo: (gameId: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>({ teams: [], games: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setData(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data, ready]);

  const mapTeam = useCallback(
    (id: string, fn: (t: Team) => Team) =>
      setData((d) => ({ ...d, teams: d.teams.map((t) => (t.id === id ? fn(t) : t)) })),
    [],
  );
  const mapGame = useCallback(
    (id: string, fn: (g: Game) => Game) =>
      setData((d) => ({ ...d, games: d.games.map((g) => (g.id === id ? fn(g) : g)) })),
    [],
  );

  const store = useMemo<Store>(
    () => ({
      ...data,
      ready,
      addTeam: (name) => {
        const team: Team = { id: uid(), name, players: [], createdAt: Date.now() };
        setData((d) => ({ ...d, teams: [...d.teams, team] }));
        return team;
      },
      updateTeam: (id, patch) => mapTeam(id, (t) => ({ ...t, ...patch })),
      deleteTeam: (id) =>
        setData((d) => ({
          teams: d.teams.filter((t) => t.id !== id),
          games: d.games.filter((g) => g.teamId !== id),
        })),
      addPlayer: (teamId, name, number) =>
        mapTeam(teamId, (t) => ({ ...t, players: [...t.players, { id: uid(), name, number }] })),
      updatePlayer: (teamId, player) =>
        mapTeam(teamId, (t) => ({
          ...t,
          players: t.players.map((p) => (p.id === player.id ? player : p)),
        })),
      removePlayer: (teamId, playerId) =>
        mapTeam(teamId, (t) => ({ ...t, players: t.players.filter((p) => p.id !== playerId) })),
      createGame: (g) => {
        const game: Game = { ...g, id: uid(), events: [], finished: false, currentPeriod: 1 };
        setData((d) => ({ ...d, games: [game, ...d.games] }));
        return game;
      },
      updateGame: (id, patch) => mapGame(id, (g) => ({ ...g, ...patch })),
      deleteGame: (id) => setData((d) => ({ ...d, games: d.games.filter((g) => g.id !== id) })),
      addEvent: (gameId, e) =>
        mapGame(gameId, (g) => ({ ...g, events: [...g.events, { ...e, id: uid(), at: Date.now() }] })),
      removeEvent: (gameId, eventId) =>
        mapGame(gameId, (g) => ({ ...g, events: g.events.filter((e) => e.id !== eventId) })),
      undo: (gameId) => mapGame(gameId, (g) => ({ ...g, events: g.events.slice(0, -1) })),
    }),
    [data, ready, mapTeam, mapGame],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore fora do StoreProvider');
  return s;
}
