import { authFetch } from "./client";
import {
  MatchData,
  MatchEvent,
  MatchJobStatusResponse,
  MatchStatistics,
  MatchStatus,
} from "../types/global.d";
import { API_ENDPOINTS } from "../constants/api.constants";

// 로그 헬퍼 함수
const logAPI = (action: string, data?: any) => {
  console.log(`[Match API] ${action}`, data || "");
};

/**
 * 게임 대전 매치 생성
 */
export const createGameMatch = async (squadId: string): Promise<MatchData> => {
  logAPI("게임 대전 매치 생성 요청", { squadId });
  try {
    const response = await authFetch(`${API_ENDPOINTS.MATCHES.GAME}`, {
      method: "POST",
      body: JSON.stringify({ squadId }),
    });
    logAPI("게임 대전 매치 생성 성공", response);

    // 응답에 id가 없지만 _id가 있는 경우 id 속성 추가
    if (!response.id && response._id) {
      response.id = response._id;
      logAPI("매치 ID 자동 변환", { _id: response._id, id: response.id });
    }

    return response;
  } catch (error) {
    logAPI("게임 대전 매치 생성 실패", error);
    throw error;
  }
};

/**
 * 매치 작업 상태 조회
 * 현재 서버측에서 이 기능은 백지화되어 있습니다
 */
export const getMatchJobStatus = async (
  jobId: string
): Promise<MatchJobStatusResponse> => {
  logAPI("매치 작업 상태 조회", { jobId });
  try {
    const response = await authFetch(`${API_ENDPOINTS.MATCHES.JOBS}/${jobId}`);
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
    const response = await authFetch(
      `${API_ENDPOINTS.MATCHES.BASE}/${matchId}`
    );
    logAPI("매치 상세 조회 성공", response);
    return response;
  } catch (error) {
    logAPI("매치 상세 조회 실패", error);
    throw error;
  }
};

/**
 * 매치 상태 조회 (폴링용)
 */
export const getMatchStatus = async (
  matchId: string
): Promise<{
  status: MatchStatus;
  message: string;
  additionalInfo?: any;
}> => {
  logAPI("매치 상태 조회", { matchId });
  try {
    const response = await authFetch(API_ENDPOINTS.MATCHES.STATUS(matchId));
    logAPI("매치 상태 조회 성공", response);

    // 유효성 검사 - status가 MatchStatus enum에 있는지 확인
    if (!Object.values(MatchStatus).includes(response.status)) {
      console.warn(`[Match API] 알 수 없는 매치 상태: ${response.status}`);
    }

    return {
      status: response.status as MatchStatus,
      message: response.message || "매치 상태 조회 성공",
      additionalInfo: response.additionalInfo,
    };
  } catch (error) {
    logAPI("매치 상태 조회 실패", { matchId, error });
    throw error;
  }
};

/**
 * 매치 상태 업데이트 기록 조회
 */
export const getMatchStatusUpdates = async (
  matchId: string
): Promise<any[]> => {
  logAPI("매치 상태 업데이트 기록 조회", { matchId });
  try {
    const response = await authFetch(
      API_ENDPOINTS.MATCHES.STATUS_UPDATES(matchId)
    );
    logAPI("매치 상태 업데이트 기록 조회 성공", response);
    return response;
  } catch (error) {
    logAPI("매치 상태 업데이트 기록 조회 실패", error);
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
    const response = await authFetch(API_ENDPOINTS.MATCHES.EVENTS(matchId));
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
    const response = await authFetch(API_ENDPOINTS.MATCHES.STATISTICS(matchId));
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
    const response = await authFetch(API_ENDPOINTS.MATCHES.ANALYSIS(matchId));
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
    const response = await authFetch(API_ENDPOINTS.MATCHES.LOGS(matchId));
    logAPI("매치 로그 조회 성공", { matchId, count: response?.length });
    return response;
  } catch (error) {
    logAPI("매치 로그 조회 실패", error);
    throw error;
  }
};

/**
 * 매치 취소 요청
 */
export const cancelMatchRequest = async (
  matchId: string
): Promise<{ success: boolean }> => {
  logAPI("매치 취소 요청", { matchId });
  try {
    const response = await authFetch(API_ENDPOINTS.MATCHES.CANCEL(matchId), {
      method: "POST",
    });
    logAPI("매치 취소 성공", response);
    return { success: true };
  } catch (error) {
    logAPI("매치 취소 실패", error);
    throw error;
  }
};

/**
 * 매치 폴링 중지 여부 확인
 * 매치가 종료되었거나 실패했을 때 true를 반환하여 폴링을 중지합니다.
 */
export const shouldStopPolling = (status: MatchStatus | string): boolean => {
  return status === MatchStatus.ENDED;
};
