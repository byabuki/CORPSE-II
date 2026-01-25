export interface CategoryConfig {
  noValuation?: boolean;
  destinationColumn?: string;
  isPositiveStat?: boolean;
  isRateStat: boolean;
  formula?: string;
  denominator?: string;
}

export type CategoriesConfig = {
  base_projection: string;
  categories: Record<string, CategoryConfig>;
};

export interface Player {
  name: string;
  years: string;
  tag: string;
}

export interface TeamsAndPlayers {
  [teamName: string]: string[];
}

export type PlayerValues = Record<string, unknown>[];

export interface PlayerRecord {
    team: string;
    ztotal: number;
    nameascii?: string;
    name?: string;
}

export interface BatterRecord {
    id: number;
    name: string;
    nameascii: string;
    player: string;
    player_id: string;
    team: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    ab: number;
    bb: number;
    hr: number;
    pa: number;
    sb: number;
    slg: number;
    obp: number;
    tb: number;
    wobp: number;
    wslg: number;
    zbb: number;
    zhr: number;
    zobp: number;
    zsb: number;
    zslg: number;
    ztb: number;
    ztotal: number;
    zwobp: number;
    zwslg: number;
}

export interface PitcherRecord {
    id: number;
    name: string;
    nameascii: string;
    player: string;
    player_id: string;
    team: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    bb9: number;
    era: number;
    g: number;
    gs: number;
    ip: number;
    qs: number;
    so: number;
    svh: number;
    whip: number;
    zbb9: number;
    zera: number;
    zqs: number;
    zso: number;
    zsvh: number;
    ztotal: number;
    zwbb9: number;
    zwera: number;
    zwhip: number;
    zwwhip: number;
}
