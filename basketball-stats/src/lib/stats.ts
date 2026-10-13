import { ActionType, Format, Game, GameEvent, Player, Team } from './types';

export interface StatLine {
  pts: number;
  ftm: number;
  fta: number;
  inm: number;
  ina: number;
  outm: number;
  outa: number;
  oreb: number;
  dreb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  pf: number;
  plusMinus: number;
}

export const emptyLine = (): StatLine => ({
  pts: 0,
  ftm: 0,
  fta: 0,
  inm: 0,
  ina: 0,
  outm: 0,
  outa: 0,
  oreb: 0,
  dreb: 0,
  ast: 0,
  stl: 0,
  blk: 0,
  tov: 0,
  pf: 0,
  plusMinus: 0,
});

export const shotValues = (format: Format) =>
  format === '3x3' ? { inside: 1, outside: 2 } : { inside: 2, outside: 3 };

export function eventPoints(e: GameEvent, format: Format): number {
  const v = shotValues(format);
  switch (e.type) {
    case 'FTM':
      return 1;
    case 'INM':
      return v.inside;
    case 'OUTM':
      return v.outside;
    case 'OPP':
      return e.points ?? 0;
    default:
      return 0;
  }
}

export const isOurScore = (t: ActionType) => t === 'FTM' || t === 'INM' || t === 'OUTM';

export function applyEvent(line: StatLine, e: GameEvent, format: Format) {
  const pts = eventPoints(e, format);
  switch (e.type) {
    case 'FTM':
      line.ftm++;
      line.fta++;
      break;
    case 'FTX':
      line.fta++;
      break;
    case 'INM':
      line.inm++;
      line.ina++;
      break;
    case 'INX':
      line.ina++;
      break;
    case 'OUTM':
      line.outm++;
      line.outa++;
      break;
    case 'OUTX':
      line.outa++;
      break;
    case 'OREB':
      line.oreb++;
      break;
    case 'DREB':
      line.dreb++;
      break;
    case 'AST':
      line.ast++;
      break;
    case 'STL':
      line.stl++;
      break;
    case 'BLK':
      line.blk++;
      break;
    case 'TOV':
      line.tov++;
      break;
    case 'PF':
      line.pf++;
      break;
  }
  line.pts += e.type === 'OPP' ? 0 : pts;
}

export const reb = (l: StatLine) => l.oreb + l.dreb;
export const fgm = (l: StatLine) => l.inm + l.outm;
export const fga = (l: StatLine) => l.ina + l.outa;
export const pct = (m: number, a: number) => (a === 0 ? '-' : `${Math.round((m / a) * 100)}%`);
export const eff = (l: StatLine) =>
  l.pts + reb(l) + l.ast + l.stl + l.blk - (fga(l) - fgm(l)) - (l.fta - l.ftm) - l.tov;

export function addLines(a: StatLine, b: StatLine): StatLine {
  const out = emptyLine();
  (Object.keys(out) as (keyof StatLine)[]).forEach((k) => (out[k] = a[k] + b[k]));
  return out;
}

export interface GameSummary {
  us: number;
  them: number;
  byPeriod: { us: number; them: number }[];
  players: Record<string, StatLine>;
  team: StatLine;
}

export function summarizeGame(game: Game): GameSummary {
  const players: Record<string, StatLine> = {};
  game.roster.forEach((id) => (players[id] = emptyLine()));
  const team = emptyLine();
  const byPeriod = Array.from({ length: Math.max(game.periods, game.currentPeriod) }, () => ({
    us: 0,
    them: 0,
  }));
  let us = 0;
  let them = 0;

  for (const e of game.events) {
    const pts = eventPoints(e, game.format);
    const p = byPeriod[e.period - 1] ?? (byPeriod[e.period - 1] = { us: 0, them: 0 });
    if (e.type === 'OPP') {
      them += pts;
      p.them += pts;
      e.onCourt?.forEach((id) => players[id] && (players[id].plusMinus -= pts));
      continue;
    }
    if (isOurScore(e.type)) {
      us += pts;
      p.us += pts;
      e.onCourt?.forEach((id) => players[id] && (players[id].plusMinus += pts));
    }
    applyEvent(team, e, game.format);
    if (e.playerId) {
      if (!players[e.playerId]) players[e.playerId] = emptyLine();
      applyEvent(players[e.playerId], e, game.format);
    }
  }
  team.plusMinus = us - them;
  return { us, them, byPeriod, players, team };
}

export interface SeasonPlayer {
  player: Player;
  gp: number;
  totals: StatLine;
}

export interface SeasonSummary {
  games: Game[];
  wins: number;
  losses: number;
  ptsFor: number;
  ptsAgainst: number;
  players: SeasonPlayer[];
  team: StatLine;
}

export function summarizeSeason(team: Team, games: Game[]): SeasonSummary {
  const list = games
    .filter((g) => g.teamId === team.id && g.events.length > 0)
    .sort((a, b) => a.date - b.date);
  const map = new Map<string, SeasonPlayer>();
  team.players.forEach((p) => map.set(p.id, { player: p, gp: 0, totals: emptyLine() }));
  let wins = 0;
  let losses = 0;
  let ptsFor = 0;
  let ptsAgainst = 0;
  let teamTotals = emptyLine();

  for (const g of list) {
    const s = summarizeGame(g);
    ptsFor += s.us;
    ptsAgainst += s.them;
    if (g.finished) {
      if (s.us > s.them) wins++;
      else if (s.us < s.them) losses++;
    }
    teamTotals = addLines(teamTotals, s.team);
    for (const id of g.roster) {
      const sp = map.get(id);
      if (!sp) continue;
      sp.gp++;
      sp.totals = addLines(sp.totals, s.players[id] ?? emptyLine());
    }
  }
  return {
    games: list,
    wins,
    losses,
    ptsFor,
    ptsAgainst,
    players: [...map.values()].sort((a, b) => b.totals.pts / (b.gp || 1) - a.totals.pts / (a.gp || 1)),
    team: teamTotals,
  };
}

export const avg = (v: number, n: number) => (n === 0 ? '0.0' : (v / n).toFixed(1));

export const periodLabel = (format: Format, periods: number, n: number) => {
  if (n > periods) return `P${n - periods}`; // prolongamento
  if (format === '3x3') return periods === 1 ? 'Jogo' : `${n}ª`;
  return `${n}º P`;
};

export const shotLabels = (format: Format) =>
  format === '3x3' ? { inside: '1P', outside: '2P' } : { inside: '2P', outside: '3P' };

export const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
