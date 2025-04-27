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
  CREATED = "CREATED", // 매치 생성됨
  STARTED = "STARTED", // 매치 시작됨
  IN_PROGRESS = "IN_PROGRESS", // 매치 진행중
  ENDED = "ENDED", // 매치 종료
}

// 작업 상태 enum (백엔드와 동일하게 유지)
export enum JobDetailStatus {
  MATCHMAKING = "MATCHMAKING", // 매칭 중
  OPPONENT_FOUND = "OPPONENT_FOUND", // 대결상대 찾음
  PREPARING_STADIUM = "PREPARING_STADIUM", // 경기장 준비중
  PLAYERS_ENTERING = "PLAYERS_ENTERING", // 선수입장중
  SIMULATING = "SIMULATING", // 시뮬레이션 중
  SAVING_RESULT = "SAVING_RESULT", // 결과 저장 중
  COMPLETED = "COMPLETED", // 완료
  FAILED = "FAILED", // 실패
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

export interface MatchJobStatusResponse {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  detailStatus?: string; // 상세 상태
  progressMessage?: string; // 진행 상태 메시지
  createdAt: Date;
  matchId?: string;
  result?: {
    homeScore: number;
    awayScore: number;
    winner: "home" | "away" | "draw";
  };
  error?: string;
}
