import apiClient from "./client";

// 팀 인터페이스
export interface Team {
  userId?: string;
  squadId?: string;
  name: string;
  isAI?: boolean;
  isUserTeam?: boolean;
  formation?: string;
  players?: any[];
}

// 스코어 인터페이스
export interface Score {
  home: number;
  away: number;
}

// 매치 인터페이스
export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  status: "scheduled" | "in_progress" | "completed";
  score?: Score;
  startTime?: string;
  endTime?: string;
  matchDuration?: number;
  createdAt: string;
}

// 매치 이벤트 인터페이스
export interface MatchEvent {
  type: string;
  minute: number;
  team: "home" | "away";
  playerId?: string;
  playerName?: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
  description: string;
  currentScore?: Score;
}

// 매치 통계 인터페이스
export interface MatchStatistics {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
  passes: { home: number; away: number };
  passAccuracy: { home: number; away: number };
  playerStats: { home: any[]; away: any[] };
}

// 매치 분석 인터페이스
export interface MatchAnalysis {
  summary: string;
  keyPlayers: { home: string[]; away: string[] };
  tacticalInsights: { home: string; away: string };
  improvementSuggestions: { home: string; away: string };
}

// 매치 작업 상태 인터페이스
export interface MatchJob {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  matchId?: string;
  result?: {
    homeScore: number;
    awayScore: number;
    winner: "home" | "away" | "draw";
  };
  error?: string;
}

// 빠른 매치 생성 (AI 상대)
export const createQuickMatch = async (squadId: string): Promise<Match> => {
  const response = await apiClient.post<Match>("/matches/quick", { squadId });
  return response.data;
};

// 게임 매치 생성 (비동기 방식으로 변경)
export const createGameMatch = async (
  squadId: string
): Promise<{ jobId: string; message: string }> => {
  const response = await apiClient.post<{ jobId: string; message: string }>(
    "/matches/game",
    { squadId }
  );
  return response.data;
};

// 매치 작업 상태 조회
export const checkMatchJobStatus = async (jobId: string): Promise<MatchJob> => {
  const response = await apiClient.get<MatchJob>(`/matches/jobs/${jobId}`);
  return response.data;
};

// 매치 상세 조회
export const getMatchById = async (id: string): Promise<Match> => {
  const response = await apiClient.get<Match>(`/matches/${id}`);
  return response.data;
};

// 사용자 매치 목록 조회
export const getUserMatches = async (): Promise<Match[]> => {
  const response = await apiClient.get<Match[]>("/matches");
  return response.data;
};

// 매치 이벤트 조회
export const getMatchEvents = async (id: string): Promise<MatchEvent[]> => {
  const response = await apiClient.get<MatchEvent[]>(`/matches/${id}/events`);
  return response.data;
};

// 매치 통계 조회
export const getMatchStatistics = async (
  id: string
): Promise<MatchStatistics> => {
  const response = await apiClient.get<MatchStatistics>(
    `/matches/${id}/statistics`
  );
  return response.data;
};

// 매치 분석 조회
export const getMatchAnalysis = async (id: string): Promise<MatchAnalysis> => {
  const response = await apiClient.get<MatchAnalysis>(
    `/matches/${id}/analysis`
  );
  return response.data;
};

// 매치 공유
export const shareMatch = async (id: string): Promise<{ imageUrl: string }> => {
  const response = await apiClient.post<{ imageUrl: string }>(
    `/matches/${id}/share`
  );
  return response.data;
};
