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
  type: "normal" | "shelem" | "double_penalty";
}