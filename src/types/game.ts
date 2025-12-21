export interface Player {
  name: string;
  isDealer: boolean;
}

export interface Set {
  bid: number;
  teamA: number;
  teamB: number;
  biddingTeam: "A" | "B";
  bidderPlayer: string;
  type: "normal" | "shelem" | "double_shelem" | "double_penalty";
}

export type GameSettings = {
  withJoker: boolean;
  targetScore: number;
  sets: number;
  doublePenalty: boolean;
  shelemScore: number | string;
  mode: "target" | "sets";
};