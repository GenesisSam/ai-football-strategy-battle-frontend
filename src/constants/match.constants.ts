/**
 * 매치 관련 상수
 */
import { MatchStatus, JobDetailStatus } from "../types/global.d";

/**
 * 폴링 관련 설정 타입
 */
export interface PollingConfig {
  /** 폴링 간격 (밀리초) */
  INTERVAL: number;
  /** 최대 오류 허용 횟수 */
  MAX_ERROR_COUNT: number;
  /** 긴 폴링 간격 (밀리초) */
  LONG_INTERVAL: number;
}

/**
 * 매치 타입 상수 타입
 */
export interface MatchTypesConfig {
  /** 빠른 대전 타입 */
  QUICK: string;
  /** 게임 대전 타입 */
  GAME: string;
}

/**
 * 매치 결과 승자 타입 상수
 */
export interface MatchResultWinnerConfig {
  /** 홈팀 승리 */
  HOME: string;
  /** 원정팀 승리 */
  AWAY: string;
  /** 무승부 */
  DRAW: string;
}

// 폴링 관련 설정
export const POLLING: PollingConfig = {
  INTERVAL: 1000, // 1초
  MAX_ERROR_COUNT: 5,
  LONG_INTERVAL: 5000, // 5초
};

// 매치 상태에 따른 메시지 맵
export const STATUS_MESSAGES: Record<MatchStatus | JobDetailStatus, string> = {
  // 매치 상태
  [MatchStatus.CREATED]: "매치가 생성되었습니다.",
  [MatchStatus.STARTED]: "매치가 시작되었습니다!",
  [MatchStatus.IN_PROGRESS]: "매치가 진행 중입니다.",
  [MatchStatus.ENDED]: "매치가 종료되었습니다.",

  // 작업 상세 상태
  [JobDetailStatus.MATCHMAKING]: "매치메이킹 중입니다...",
  [JobDetailStatus.OPPONENT_FOUND]: "대결 상대를 찾았습니다!",
  [JobDetailStatus.PREPARING_STADIUM]: "경기장을 준비하고 있습니다...",
  [JobDetailStatus.PLAYERS_ENTERING]: "선수들이 입장하고 있습니다...",
  [JobDetailStatus.SIMULATING]: "AI가 시뮬레이션 중입니다...",
  [JobDetailStatus.SAVING_RESULT]: "결과를 저장하는 중입니다...",
  [JobDetailStatus.COMPLETED]: "경기가 완료되었습니다.",
  [JobDetailStatus.FAILED]: "오류가 발생했습니다.",
};

// 매치 상태에 따른 진행률 맵
export const PROGRESS_BY_STATUS: Record<MatchStatus | JobDetailStatus, number> =
  {
    // 매치 상태
    [MatchStatus.CREATED]: 10,
    [MatchStatus.STARTED]: 25,
    [MatchStatus.IN_PROGRESS]: 70,
    [MatchStatus.ENDED]: 100,

    // 작업 상세 상태
    [JobDetailStatus.MATCHMAKING]: 10,
    [JobDetailStatus.OPPONENT_FOUND]: 25,
    [JobDetailStatus.PREPARING_STADIUM]: 40,
    [JobDetailStatus.PLAYERS_ENTERING]: 55,
    [JobDetailStatus.SIMULATING]: 70,
    [JobDetailStatus.SAVING_RESULT]: 85,
    [JobDetailStatus.COMPLETED]: 100,
    [JobDetailStatus.FAILED]: 100,
  };

// 매치 타입
export const MATCH_TYPES: MatchTypesConfig = {
  QUICK: "quick",
  GAME: "game",
};

// 매치 결과 승자 타입
export const MATCH_RESULT_WINNER: MatchResultWinnerConfig = {
  HOME: "home",
  AWAY: "away",
  DRAW: "draw",
};
