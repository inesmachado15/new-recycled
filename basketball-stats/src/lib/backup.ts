import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { fmtMinutes } from './clock';
import { eff, fga, fgm, reb, summarizeGame } from './stats';
import { Game, Team } from './types';

export interface BackupData {
  teams: Team[];
  games: Game[];
}

const APP = 'basketstats';
const VERSION = 1;

const stamp = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
};

async function shareFile(name: string, content: string, mimeType: string, UTI: string, title: string) {
  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  file.create();
  file.write(content);
  await Sharing.shareAsync(file.uri, { mimeType, UTI, dialogTitle: title });
}

/** Cópia de segurança completa (equipas + jogos) num ficheiro JSON. */
export async function exportBackup(data: BackupData) {
  const payload = { app: APP, version: VERSION, exportedAt: new Date().toISOString(), ...data };
  await shareFile(
    `basket-stats_${stamp()}.json`,
    JSON.stringify(payload),
    'application/json',
    'public.json',
    'Cópia de segurança',
  );
}

/** Estatísticas de todos os jogos, uma linha por jogadora e jogo (abre no Excel/Numbers). */
export async function exportCsv(data: BackupData) {
  const cell = (v: string | number) => {
    const s = String(v);
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = [
    'Data', 'Equipa', 'Adversário', 'Formato', 'Resultado', 'Marcador',
    'Nº', 'Jogadora', 'MIN', 'PTS', 'LC', 'LCT', 'Int.', 'Int.T', 'Ext.', 'Ext.T', 'LL', 'LLT',
    'RO', 'RD', 'RT', 'AST', 'RB', 'DS', 'PE', 'FC', '+/-', 'VAL',
  ];
  const rows: (string | number)[][] = [];
  const games = [...data.games].sort((a, b) => a.date - b.date);
  for (const g of games) {
    const team = data.teams.find((t) => t.id === g.teamId);
    if (!team) continue;
    const s = summarizeGame(g);
    const res = !g.finished ? 'Em curso' : s.us > s.them ? 'V' : s.us < s.them ? 'D' : 'E';
    for (const pid of g.roster) {
      const p = team.players.find((x) => x.id === pid);
      const l = s.players[pid];
      if (!p || !l) continue;
      rows.push([
        new Date(g.date).toLocaleDateString('pt-PT'), team.name, g.opponent, g.format, res, `${s.us}-${s.them}`,
        p.number, p.name, g.periodLength ? fmtMinutes(l.secs) : '', l.pts,
        fgm(l), fga(l), l.inm, l.ina, l.outm, l.outa, l.ftm, l.fta,
        l.oreb, l.dreb, reb(l), l.ast, l.stl, l.blk, l.tov, l.pf, l.plusMinus, eff(l),
      ]);
    }
  }
  // Separador ";" e BOM para o Excel em português abrir as colunas e os acentos corretamente
  const csv = '﻿' + [header, ...rows].map((r) => r.map(cell).join(';')).join('\n');
  await shareFile(`basket-stats_${stamp()}.csv`, csv, 'text/csv', 'public.comma-separated-values-text', 'Exportar para Excel');
}

/** Abre o seletor de ficheiros e devolve os dados da cópia de segurança (ou null se cancelado). */
export async function pickBackup(): Promise<BackupData | null> {
  const res = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'public.json', '*/*'],
    copyToCacheDirectory: true,
  });
  if (res.canceled || !res.assets?.length) return null;
  const text = await new File(res.assets[0].uri).text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.replace(/^﻿/, ''));
  } catch {
    throw new Error('O ficheiro escolhido não é uma cópia de segurança válida.');
  }
  const p = parsed as Partial<BackupData> & { app?: string };
  if (p.app !== APP || !Array.isArray(p.teams) || !Array.isArray(p.games)) {
    throw new Error('O ficheiro escolhido não é uma cópia de segurança do Basket Stats.');
  }
  return { teams: p.teams, games: p.games };
}

/**
 * Junta duas bases de dados (ex.: iPhone + iPad).
 * Equipas com o mesmo id juntam as jogadoras; num jogo repetido fica a versão com mais jogadas.
 */
export function mergeData(current: BackupData, incoming: BackupData): BackupData {
  const teams = current.teams.map((t) => ({ ...t, players: [...t.players] }));
  for (const t of incoming.teams) {
    const cur = teams.find((x) => x.id === t.id);
    if (!cur) {
      teams.push(t);
      continue;
    }
    for (const p of t.players) if (!cur.players.some((x) => x.id === p.id)) cur.players.push(p);
  }
  const games = [...current.games];
  for (const g of incoming.games) {
    const i = games.findIndex((x) => x.id === g.id);
    if (i === -1) games.push(g);
    else if (g.events.length > games[i].events.length) games[i] = g;
  }
  games.sort((a, b) => b.date - a.date);
  return { teams, games };
}
