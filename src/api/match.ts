import { authFetch } from "./client";
import { MatchData, MatchEvent, MatchStatistics } from "../types/global";

const API_BASE = "/api/matches";

/**
 * 빠른 대전 매치 생성
 */
export const createQuickMatch = async (squadId: string): Promise<MatchData> => {
  const response = await authFetch(`${API_BASE}/quick`, {
    method: "POST",
    body: JSON.stringify({ squadId }),
  });

  return response;
};

/**
 * 게임 대전 매치 생성 (비동기)
 */
export const createGameMatch = async (
  squadId: string
): Promise<{ jobId: string; message: string }> => {
  const response = await authFetch(`${API_BASE}/game`, {
    method: "POST",
    body: JSON.stringify({ squadId }),
  });

  return response;
};

/**
 * 매치 작업 상태 조회
 */
export const getMatchJobStatus = async (
  jobId: string
): Promise<{
  jobId: string;
  status: string;
  createdAt: string;
  matchId?: string;
  error?: string;
  result?: {
    homeScore: number;
    awayScore: number;
    winner: "home" | "away" | "draw";
  };
}> => {
  const response = await authFetch(`${API_BASE}/jobs/${jobId}`);
  return response;
};

/**
 * 매치 상세 조회
 */
export const getMatchById = async (matchId: string): Promise<MatchData> => {
  const response = await authFetch(`${API_BASE}/${matchId}`);
  return response;
};

/**
 * 매치 이벤트 조회
 */
export const getMatchEvents = async (
  matchId: string
): Promise<MatchEvent[]> => {
  const response = await authFetch(`${API_BASE}/${matchId}/events`);
  return response;
};

/**
 * 매치 통계 조회
 */
export const getMatchStatistics = async (
  matchId: string
): Promise<{
  home: MatchStatistics;
  away: MatchStatistics;
}> => {
  const response = await authFetch(`${API_BASE}/${matchId}/statistics`);
  return response;
};

/**
 * 매치 분석 조회
 */
export const getMatchAnalysis = async (matchId: string): Promise<string> => {
  const response = await authFetch(`${API_BASE}/${matchId}/analysis`);
  return response;
};

/**
 * 매치 로그 조회
 */
export const getMatchLogs = async (matchId: string): Promise<any[]> => {
  const response = await authFetch(`${API_BASE}/${matchId}/logs`);
  return response;
};

/**
 * 매치 상태 조회
 */
export const getMatchStatus = async (
  matchId: string
): Promise<{
  status: string;
  message: string;
}> => {
  const response = await authFetch(`${API_BASE}/${matchId}/status`);
  return response;
};
