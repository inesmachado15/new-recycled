import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import {
  avg,
  eff,
  fga,
  fgm,
  formatDate,
  GameSummary,
  pct,
  periodLabel,
  reb,
  SeasonSummary,
  shotLabels,
  StatLine,
  summarizeGame,
} from './stats';
import { Game, Team } from './types';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const css = `
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1B2420; margin: 24px; font-size: 11px; }
  h1 { color: #2F6B45; margin: 0 0 4px; font-size: 22px; }
  h2 { color: #2F6B45; font-size: 14px; margin: 20px 0 6px; border-bottom: 2px solid #E8892F; padding-bottom: 3px; }
  .muted { color: #6B7570; }
  .score { display: flex; align-items: center; justify-content: center; gap: 24px; background: #1F4A30; color: #fff;
           border-radius: 12px; padding: 14px; margin: 12px 0; }
  .score .n { font-size: 36px; font-weight: 900; }
  .score .t { font-size: 13px; font-weight: 700; text-align: center; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #2F6B45; color: #fff; padding: 5px 4px; font-size: 10px; }
  td { padding: 4px; border-bottom: 1px solid #DDE3DE; text-align: center; }
  td.l, th.l { text-align: left; }
  tr:nth-child(even) td { background: #F4F6F3; }
  tr.total td { font-weight: 800; background: #FCEBD9; }
  .cards { display: flex; gap: 8px; flex-wrap: wrap; }
  .card { flex: 1; min-width: 110px; border: 1px solid #DDE3DE; border-radius: 10px; padding: 8px; }
  .card b { display: block; font-size: 18px; color: #2F6B45; }
  footer { margin-top: 24px; font-size: 9px; color: #6B7570; text-align: center; }
`;

const page = (title: string, body: string) =>
  `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${css}</style></head><body>${body}<footer>Gerado com Basket Stats · ${new Date().toLocaleString('pt-PT')}</footer></body></html>`;

function lineCells(l: StatLine) {
  return `
    <td><b>${l.pts}</b></td>
    <td>${fgm(l)}/${fga(l)}</td><td>${pct(fgm(l), fga(l))}</td>
    <td>${l.inm}/${l.ina}</td>
    <td>${l.outm}/${l.outa}</td><td>${pct(l.outm, l.outa)}</td>
    <td>${l.ftm}/${l.fta}</td><td>${pct(l.ftm, l.fta)}</td>
    <td>${l.oreb}</td><td>${l.dreb}</td><td>${reb(l)}</td>
    <td>${l.ast}</td><td>${l.stl}</td><td>${l.blk}</td><td>${l.tov}</td><td>${l.pf}</td>
    <td>${l.plusMinus > 0 ? '+' : ''}${l.plusMinus}</td><td>${eff(l)}</td>`;
}

const boxHead = (labels: { inside: string; outside: string }) => `
  <tr><th class="l">#</th><th class="l">Jogador</th><th>PTS</th><th>LC</th><th>LC%</th>
  <th>${labels.inside}</th><th>${labels.outside}</th><th>${labels.outside}%</th><th>LL</th><th>LL%</th>
  <th>RO</th><th>RD</th><th>RT</th><th>AS</th><th>RB</th><th>DS</th><th>PE</th><th>FC</th><th>+/-</th><th>VAL</th></tr>`;

export function gameReportHtml(game: Game, team: Team, s: GameSummary = summarizeGame(game)) {
  const labels = shotLabels(game.format);
  const rows = game.roster
    .map((id) => team.players.find((p) => p.id === id))
    .filter(Boolean)
    .map(
      (p) => `<tr><td class="l">${esc(p!.number)}</td><td class="l">${esc(p!.name)}</td>${lineCells(s.players[p!.id])}</tr>`,
    )
    .join('');
  const periods = s.byPeriod
    .map((_, i) => `<th>${periodLabel(game.format, game.periods, i + 1)}</th>`)
    .join('');
  const t = s.team;
  const leaders = (['pts', 'ast', 'stl'] as const).map((k) => {
    const best = game.roster
      .map((id) => ({ p: team.players.find((x) => x.id === id), v: s.players[id]?.[k] ?? 0 }))
      .sort((a, b) => b.v - a.v)[0];
    return best?.p ? `${esc(best.p.name)} (${best.v})` : '-';
  });
  const rebLeader = game.roster
    .map((id) => ({ p: team.players.find((x) => x.id === id), v: s.players[id] ? reb(s.players[id]) : 0 }))
    .sort((a, b) => b.v - a.v)[0];

  return page(
    `${team.name} vs ${game.opponent}`,
    `
    <h1>${esc(team.name)} vs ${esc(game.opponent)}</h1>
    <div class="muted">${formatDate(game.date)} · ${game.format}${game.location ? ' · ' + esc(game.location) : ''}${
      game.finished ? '' : ' · <b>em curso</b>'
    }</div>
    <div class="score">
      <div class="t">${esc(team.name)}<div class="n">${s.us}</div></div>
      <div class="t">–</div>
      <div class="t">${esc(game.opponent)}<div class="n">${s.them}</div></div>
    </div>
    <h2>Parciais</h2>
    <table><tr><th class="l">Equipa</th>${periods}<th>Total</th></tr>
      <tr><td class="l">${esc(team.name)}</td>${s.byPeriod.map((p) => `<td>${p.us}</td>`).join('')}<td><b>${s.us}</b></td></tr>
      <tr><td class="l">${esc(game.opponent)}</td>${s.byPeriod.map((p) => `<td>${p.them}</td>`).join('')}<td><b>${s.them}</b></td></tr>
    </table>
    <h2>Destaques</h2>
    <div class="cards">
      <div class="card">Pontos<b>${leaders[0]}</b></div>
      <div class="card">Ressaltos<b>${rebLeader?.p ? `${esc(rebLeader.p.name)} (${rebLeader.v})` : '-'}</b></div>
      <div class="card">Assistências<b>${leaders[1]}</b></div>
      <div class="card">Roubos<b>${leaders[2]}</b></div>
    </div>
    <h2>Ficha de jogo</h2>
    <table>${boxHead(labels)}${rows}
      <tr class="total"><td></td><td class="l">Equipa</td>${lineCells(t)}</tr>
    </table>
    <h2>Resumo da equipa</h2>
    <div class="cards">
      <div class="card">Lanç. campo<b>${pct(fgm(t), fga(t))}</b>${fgm(t)}/${fga(t)}</div>
      <div class="card">${labels.outside}<b>${pct(t.outm, t.outa)}</b>${t.outm}/${t.outa}</div>
      <div class="card">Lances livres<b>${pct(t.ftm, t.fta)}</b>${t.ftm}/${t.fta}</div>
      <div class="card">Ressaltos<b>${reb(t)}</b>${t.oreb} of. · ${t.dreb} def.</div>
      <div class="card">Perdas<b>${t.tov}</b>${t.ast} assist.</div>
    </div>
    <p class="muted" style="margin-top:12px">LC: lançamentos de campo · LL: lances livres · RO/RD/RT: ressaltos ofensivos/defensivos/total ·
    AS: assistências · RB: roubos · DS: desarmes · PE: perdas · FC: faltas · VAL: valorização</p>
  `,
  );
}

export function seasonReportHtml(team: Team, s: SeasonSummary) {
  const rows = s.players
    .filter((sp) => sp.gp > 0)
    .map(({ player, gp, totals: l }) => `
      <tr><td class="l">${esc(player.number)}</td><td class="l">${esc(player.name)}</td><td>${gp}</td>
      <td><b>${avg(l.pts, gp)}</b></td><td>${avg(reb(l), gp)}</td><td>${avg(l.ast, gp)}</td>
      <td>${avg(l.stl, gp)}</td><td>${avg(l.blk, gp)}</td><td>${avg(l.tov, gp)}</td><td>${avg(l.pf, gp)}</td>
      <td>${pct(fgm(l), fga(l))}</td><td>${pct(l.outm, l.outa)}</td><td>${pct(l.ftm, l.fta)}</td>
      <td>${avg(eff(l), gp)}</td><td>${l.pts}</td></tr>`)
    .join('');
  const games = s.games
    .map((g) => {
      const gs = summarizeGame(g);
      const r = !g.finished ? '…' : gs.us > gs.them ? 'V' : gs.us < gs.them ? 'D' : 'E';
      return `<tr><td class="l">${formatDate(g.date)}</td><td class="l">${esc(g.opponent)}</td><td>${g.format}</td><td><b>${r}</b></td><td>${gs.us}–${gs.them}</td></tr>`;
    })
    .join('');
  const n = s.games.length;
  return page(
    `${team.name} — Relatório da época`,
    `
    <h1>${esc(team.name)}</h1>
    <div class="muted">Relatório acumulado · ${n} jogo${n === 1 ? '' : 's'}</div>
    <div class="cards" style="margin-top:12px">
      <div class="card">Registo<b>${s.wins}V – ${s.losses}D</b></div>
      <div class="card">Pontos marcados<b>${avg(s.ptsFor, n)}</b>por jogo</div>
      <div class="card">Pontos sofridos<b>${avg(s.ptsAgainst, n)}</b>por jogo</div>
      <div class="card">Lanç. campo<b>${pct(fgm(s.team), fga(s.team))}</b></div>
    </div>
    <h2>Médias por jogador</h2>
    <table><tr><th class="l">#</th><th class="l">Jogador</th><th>J</th><th>PTS</th><th>RES</th><th>AST</th><th>RB</th><th>DS</th>
      <th>PE</th><th>FC</th><th>LC%</th><th>Ext%</th><th>LL%</th><th>VAL</th><th>PTS tot.</th></tr>${rows}</table>
    <h2>Jogos</h2>
    <table><tr><th class="l">Data</th><th class="l">Adversário</th><th>Formato</th><th>Res.</th><th>Marcador</th></tr>${games}</table>
  `,
  );
}

export async function exportPdf(html: string, title: string) {
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: title });
  } else {
    await Print.printAsync({ uri });
  }
}

export async function printHtml(html: string) {
  await Print.printAsync({ html });
}
