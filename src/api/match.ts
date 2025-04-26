import { authFetch } from "./client";
import {
  MatchData,
  MatchEvent,
  MatchStatistics,
  MatchStatus,
} from "../types/global.d";

const API_BASE = "/matches";

// 로그 헬퍼 함수
const logAPI = (action: string, data?: any) => {
  console.log(`[Match API] ${action}`, data || "");
};

/**
 * 빠른 대전 매치 생성
 */
export const createQuickMatch = async (squadId: string): Promise<MatchData> => {
  logAPI("빠른 대전 매치 생성 요청", { squadId });
  try {
    const response = await authFetch(`${API_BASE}/quick`, {
      method: "POST",
      body: JSON.stringify({ squadId }),
    });
    logAPI("빠른 대전 매치 생성 성공", response);
    return response;
  } catch (error) {
    logAPI("빠른 대전 매치 생성 실패", error);
    throw error;
  }
};

/**
 * 게임 대전 매치 생성 (비동기)
 */
export const createGameMatch = async (
  squadId: string
): Promise<{ jobId: string; message: string }> => {
  logAPI("게임 대전 매치 생성 요청", { squadId });
  try {
    const response = await authFetch(`${API_BASE}/game`, {
      method: "POST",
      body: JSON.stringify({ squadId }),
    });
    logAPI("게임 대전 매치 생성 성공", response);
    return response;
  } catch (error) {
    logAPI("게임 대전 매치 생성 실패", error);
    throw error;
  }
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
  logAPI("매치 작업 상태 조회", { jobId });
  try {
    const response = await authFetch(`${API_BASE}/jobs/${jobId}`);
    logAPI("매치 작업 상태 조회 성공", response);
    return response;
  } catch (error) {
    logAPI("매치 작업 상태 조회 실패", error);
    throw error;
  }
};

/**
 * 매치 상세 조회
 */
export const getMatchById = async (matchId: string): Promise<MatchData> => {
  logAPI("매치 상세 조회", { matchId });
  try {
    const response = await authFetch(`${API_BASE}/${matchId}`);
    logAPI("매치 상세 조회 성공", response);
    return response;
  } catch (error) {
    logAPI("매치 상세 조회 실패", error);
    throw error;
  }
};

/**
 * 매치 이벤트 조회
 */
export const getMatchEvents = async (
  matchId: string
): Promise<MatchEvent[]> => {
  logAPI("매치 이벤트 조회", { matchId });
  try {
    const response = await authFetch(`${API_BASE}/${matchId}/events`);
    logAPI("매치 이벤트 조회 성공", { matchId, count: response?.length });
    return response;
  } catch (error) {
    logAPI("매치 이벤트 조회 실패", error);
    throw error;
  }
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
  logAPI("매치 통계 조회", { matchId });
  try {
    const response = await authFetch(`${API_BASE}/${matchId}/statistics`);
    logAPI("매치 통계 조회 성공", response);
    return response;
  } catch (error) {
    logAPI("매치 통계 조회 실패", error);
    throw error;
  }
};

/**
 * 매치 분석 조회
 */
export const getMatchAnalysis = async (matchId: string): Promise<string> => {
  logAPI("매치 분석 조회", { matchId });
  try {
    const response = await authFetch(`${API_BASE}/${matchId}/analysis`);
    logAPI("매치 분석 조회 성공", {
      matchId,
      analysisLength: response?.length,
    });
    return response;
  } catch (error) {
    logAPI("매치 분석 조회 실패", error);
    throw error;
  }
};

/**
 * 매치 로그 조회
 */
export const getMatchLogs = async (matchId: string): Promise<any[]> => {
  logAPI("매치 로그 조회", { matchId });
  try {
    const response = await authFetch(`${API_BASE}/${matchId}/logs`);
    logAPI("매치 로그 조회 성공", { matchId, count: response?.length });
    return response;
  } catch (error) {
    logAPI("매치 로그 조회 실패", error);
    throw error;
  }
};

/**
 * 매치 상태 조회
 */
export const getMatchStatus = async (
  matchId: string
): Promise<{
  status: MatchStatus;
  message: string;
}> => {
  logAPI("매치 상태 조회", { matchId });
  try {
    const response = await authFetch(`${API_BASE}/${matchId}/status`);
    logAPI("매치 상태 조회 성공", response);

    // 유효성 검사 - status가 MatchStatus enum에 있는지 확인
    if (!Object.values(MatchStatus).includes(response.status)) {
      console.warn(`[Match API] 알 수 없는 매치 상태: ${response.status}`);
    }

    return {
      status: response.status as MatchStatus,
      message: response.message || "매치 상태 조회 성공",
    };
  } catch (error) {
    logAPI("매치 상태 조회 실패", { matchId, error });
    throw error;
  }
};

/**
 * 매치 결과 이미지 생성 및 공유
 */
export const shareMatch = async (
  matchId: string
): Promise<{ imageUrl: string }> => {
  logAPI("매치 결과 공유 요청", { matchId });
  try {
    const response = await authFetch(`${API_BASE}/${matchId}/share`, {
      method: "POST",
    });
    logAPI("매치 결과 공유 성공", { matchId, imageUrl: response.imageUrl });
    return response;
  } catch (error) {
    logAPI("매치 결과 공유 실패", error);
    throw error;
  }
};
