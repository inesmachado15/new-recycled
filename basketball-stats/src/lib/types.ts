export type Format = '5x5' | '3x3';

export interface Player {
  id: string;
  name: string;
  number: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  createdAt: number;
}

/**
 * Ações registáveis. Os lançamentos usam o "valor curto"/"valor longo" para
 * funcionar tanto em 5x5 (2/3 pontos) como em 3x3 (1/2 pontos).
 */
export type ActionType =
  | 'FTM' // lance livre convertido
  | 'FTX' // lance livre falhado
  | 'INM' // lançamento interior convertido (2P em 5x5, 1P em 3x3)
  | 'INX'
  | 'OUTM' // lançamento exterior convertido (3P em 5x5, 2P em 3x3)
  | 'OUTX'
  | 'OREB'
  | 'DREB'
  | 'AST'
  | 'STL'
  | 'BLK'
  | 'TOV'
  | 'PF'
  | 'OPP'; // pontos do adversário (usa `points`)

export interface GameEvent {
  id: string;
  at: number;
  period: number;
  type: ActionType;
  playerId?: string;
  /** Apenas para OPP */
  points?: number;
  /** Jogadores em campo no momento (para +/-) */
  onCourt?: string[];
}

export interface Game {
  id: string;
  teamId: string;
  opponent: string;
  date: number;
  format: Format;
  periods: number;
  currentPeriod: number;
  roster: string[];
  onCourt: string[];
  events: GameEvent[];
  finished: boolean;
  location?: string;
}
