import { playedSeconds } from './clock';
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
  /** segundos jogados */
  secs: number;
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
  secs: 0,
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
  /** Estatísticas do adversário (só como equipa) */
  opp: StatLine;
}

export const isTheirs = (e: GameEvent) => e.side === 'them' || e.type === 'OPP';

export function summarizeGame(game: Game): GameSummary {
  const players: Record<string, StatLine> = {};
  game.roster.forEach((id) => (players[id] = emptyLine()));
  const team = emptyLine();
  const opp = emptyLine();
  const byPeriod = Array.from({ length: Math.max(game.periods, game.currentPeriod) }, () => ({
    us: 0,
    them: 0,
  }));
  let us = 0;
  let them = 0;

  for (const e of game.events) {
    const pts = eventPoints(e, game.format);
    const p = byPeriod[e.period - 1] ?? (byPeriod[e.period - 1] = { us: 0, them: 0 });
    if (isTheirs(e)) {
      them += pts;
      p.them += pts;
      e.onCourt?.forEach((id) => players[id] && (players[id].plusMinus -= pts));
      if (e.type === 'OPP') opp.pts += pts;
      else applyEvent(opp, e, game.format);
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
  opp.plusMinus = them - us;
  const now = Date.now();
  for (const id of Object.keys(players)) {
    players[id].secs = playedSeconds(game, id, now);
    team.secs += players[id].secs;
  }
  return { us, them, byPeriod, players, team, opp };
}

export interface SeasonPlayer {
  player: Player;
  gp: number;
  /** jogos com relógio (para a média de minutos) */
  timedGp: number;
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
  opp: StatLine;
  /** Jogos com relógio (para médias de minutos) */
  timedGames: number;
}

export function summarizeSeason(team: Team, games: Game[]): SeasonSummary {
  const list = games
    .filter((g) => g.teamId === team.id && g.events.length > 0)
    .sort((a, b) => a.date - b.date);
  const map = new Map<string, SeasonPlayer>();
  team.players.forEach((p) => map.set(p.id, { player: p, gp: 0, timedGp: 0, totals: emptyLine() }));
  let wins = 0;
  let losses = 0;
  let ptsFor = 0;
  let ptsAgainst = 0;
  let teamTotals = emptyLine();
  let oppTotals = emptyLine();
  let timedGames = 0;

  for (const g of list) {
    const s = summarizeGame(g);
    ptsFor += s.us;
    ptsAgainst += s.them;
    if (g.finished) {
      if (s.us > s.them) wins++;
      else if (s.us < s.them) losses++;
    }
    teamTotals = addLines(teamTotals, s.team);
    oppTotals = addLines(oppTotals, s.opp);
    if (g.periodLength) timedGames++;
    for (const id of g.roster) {
      const sp = map.get(id);
      if (!sp) continue;
      sp.gp++;
      if (g.periodLength) sp.timedGp++;
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
    opp: oppTotals,
    timedGames,
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

export function actionLabel(type: ActionType, format: Format, points?: number) {
  const l = shotLabels(format);
  const map: Record<ActionType, string> = {
    INM: `${l.inside} ✓`,
    INX: `${l.inside} ✗`,
    OUTM: `${l.outside} ✓`,
    OUTX: `${l.outside} ✗`,
    FTM: 'LL ✓',
    FTX: 'LL ✗',
    OREB: 'Ress. Of.',
    DREB: 'Ress. Def.',
    AST: 'Assist.',
    STL: 'Roubo',
    BLK: 'Desarme',
    TOV: 'Perda',
    PF: 'Falta',
    OPP: `+${points ?? 0}`,
  };
  return map[type];
}

/** Linhas de comparação entre a nossa equipa e o adversário (por jogo ou média). */
export function comparisonRows(us: StatLine, them: StatLine, format: Format, games = 1) {
  const l = shotLabels(format);
  const n = (v: number) => (games === 1 ? String(v) : avg(v, games));
  const shot = (m: number, a: number) => (a === 0 ? `${n(m)}/${n(a)}` : `${n(m)}/${n(a)} · ${pct(m, a)}`);
  return [
    { label: 'Pontos', us: n(us.pts), them: n(them.pts) },
    { label: 'Lanç. campo', us: shot(fgm(us), fga(us)), them: shot(fgm(them), fga(them)) },
    { label: l.inside, us: shot(us.inm, us.ina), them: shot(them.inm, them.ina) },
    { label: l.outside, us: shot(us.outm, us.outa), them: shot(them.outm, them.outa) },
    { label: 'Lances livres', us: shot(us.ftm, us.fta), them: shot(them.ftm, them.fta) },
    { label: 'Ress. ofensivos', us: n(us.oreb), them: n(them.oreb) },
    { label: 'Ress. defensivos', us: n(us.dreb), them: n(them.dreb) },
    { label: 'Ressaltos', us: n(reb(us)), them: n(reb(them)) },
    { label: 'Perdas de bola', us: n(us.tov), them: n(them.tov) },
    { label: 'Roubos', us: n(us.stl), them: '–' },
    { label: 'Assistências', us: n(us.ast), them: '–' },
    { label: 'Faltas', us: n(us.pf), them: n(them.pf) },
  ];
}
