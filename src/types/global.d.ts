// 전역 타입 선언

// API 응답 메타 데이터
export interface ApiResponseMeta {
  status: number;
  message: string;
}

// API 응답 래퍼
export interface ApiResponse<T> {
  data: T;
  meta: ApiResponseMeta;
}

// 매치 상태 enum (백엔드와 동일하게 유지)
export enum MatchStatus {
  MATCHMAKING = "MATCHMAKING", // 매칭 중
  OPPONENT_FOUND = "OPPONENT_FOUND", // 대결상대 찾음
  PREPARING_STADIUM = "PREPARING_STADIUM", // 경기장 준비중
  PLAYERS_ENTERING = "PLAYERS_ENTERING", // 선수입장중
  MATCH_STARTED = "MATCH_STARTED", // 경기 시작
  SIMULATION_ACTIVE = "SIMULATION_ACTIVE", // 시뮬레이션 진행중
  MATCH_ENDED = "MATCH_ENDED", // 경기 종료
}

export interface MatchEvent {
  minute: number;
  type: string;
  team: "home" | "away";
  playerName: string;
  description: string;
}

export interface MatchStatistics {
  possession: number;
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  offsides: number;
  passes: number;
  passAccuracy: number;
  tackles: number;
}

export interface MatchResult {
  homeScore: number;
  awayScore: number;
  winner: "home" | "away" | "draw";
}

export interface MatchData {
  id: string;
  matchType: "quick" | "game";
  homeTeam: {
    userId: string;
    squadId: string;
    mmrBefore?: number;
    mmrAfter?: number;
  };
  awayTeam: {
    userId: string;
    squadId: string;
    mmrBefore?: number;
    mmrAfter?: number;
  };
  result: MatchResult;
  status: MatchStatus;
  events?: MatchEvent[];
  statistics?: {
    home: MatchStatistics;
    away: MatchStatistics;
  };
  aiAnalysis?: string;
  createdAt?: Date;
}
