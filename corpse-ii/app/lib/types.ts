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
