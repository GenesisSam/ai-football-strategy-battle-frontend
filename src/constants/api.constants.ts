/**
 * API 관련 상수
 */

/**
 * 매치 관련 API 엔드포인트 타입
 */
export interface MatchEndpointsType {
  /** 기본 매치 엔드포인트 */
  BASE: string;
  /** 빠른 매치 생성 엔드포인트 */
  QUICK: string;
  /** 게임 매치 생성 엔드포인트 */
  GAME: string;
  /** 매치 작업 엔드포인트 */
  JOBS: string;
  /** 매치 상태 조회 엔드포인트 */
  STATUS: (matchId: string) => string;
  /** 매치 상태 업데이트 조회 엔드포인트 */
  STATUS_UPDATES: (matchId: string) => string;
  /** 매치 이벤트 조회 엔드포인트 */
  EVENTS: (matchId: string) => string;
  /** 매치 통계 조회 엔드포인트 */
  STATISTICS: (matchId: string) => string;
  /** 매치 분석 조회 엔드포인트 */
  ANALYSIS: (matchId: string) => string;
  /** 매치 로그 조회 엔드포인트 */
  LOGS: (matchId: string) => string;
  /** 매치 취소 엔드포인트 */
  CANCEL: (matchId: string) => string;
}

/**
 * 인증 관련 API 엔드포인트 타입
 */
export interface AuthEndpointsType {
  /** 로그인 엔드포인트 */
  LOGIN: string;
  /** 회원가입 엔드포인트 */
  REGISTER: string;
  /** 프로필 조회 엔드포인트 */
  PROFILE: string;
}

/**
 * 스쿼드 관련 API 엔드포인트 타입
 */
export interface SquadEndpointsType {
  /** 기본 스쿼드 엔드포인트 */
  BASE: string;
  /** 스쿼드 활성화 엔드포인트 */
  ACTIVATE: (squadId: string) => string;
}

/**
 * API 엔드포인트 통합 타입
 */
export interface ApiEndpointsType {
  /** 매치 관련 엔드포인트 */
  MATCHES: MatchEndpointsType;
  /** 인증 관련 엔드포인트 */
  AUTH: AuthEndpointsType;
  /** 스쿼드 관련 엔드포인트 */
  SQUADS: SquadEndpointsType;
}

/**
 * 요청 설정 타입
 */
export interface RequestConfigType {
  /** 요청 타임아웃 (밀리초) */
  TIMEOUT: number;
  /** 재시도 지연 시간 (밀리초) */
  RETRY_DELAY: number;
}

/**
 * 인증 스토리지 키 타입
 */
export interface AuthStorageKeysType {
  /** 토큰 저장 키 */
  TOKEN: string;
  /** 사용자 정보 저장 키 */
  USER: string;
}

/**
 * HTTP 상태 코드 타입
 */
export interface HttpStatusType {
  /** OK - 200 */
  OK: number;
  /** Created - 201 */
  CREATED: number;
  /** Bad Request - 400 */
  BAD_REQUEST: number;
  /** Unauthorized - 401 */
  UNAUTHORIZED: number;
  /** Forbidden - 403 */
  FORBIDDEN: number;
  /** Not Found - 404 */
  NOT_FOUND: number;
  /** Internal Server Error - 500 */
  INTERNAL_SERVER_ERROR: number;
}

// API 기본 URL
export const API_BASE_URL = "http://localhost:3000/api";

// API 엔드포인트
export const API_ENDPOINTS: ApiEndpointsType = {
  // 매치 관련 엔드포인트
  MATCHES: {
    BASE: "/matches",
    QUICK: "/matches/quick",
    GAME: "/matches/game",
    JOBS: "/matches/jobs",
    STATUS: (matchId: string) => `/matches/${matchId}/status`,
    STATUS_UPDATES: (matchId: string) => `/matches/${matchId}/status-updates`,
    EVENTS: (matchId: string) => `/matches/${matchId}/events`,
    STATISTICS: (matchId: string) => `/matches/${matchId}/statistics`,
    ANALYSIS: (matchId: string) => `/matches/${matchId}/analysis`,
    LOGS: (matchId: string) => `/matches/${matchId}/logs`,
    CANCEL: (matchId: string) => `/matches/${matchId}/cancel`,
  },
  // 인증 관련 엔드포인트
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
  },
  // 스쿼드 관련 엔드포인트
  SQUADS: {
    BASE: "/squads",
    ACTIVATE: (squadId: string) => `/squads/${squadId}/activate`,
  },
};

// 요청 설정
export const REQUEST_CONFIG: RequestConfigType = {
  TIMEOUT: 30000, // 30초
  RETRY_DELAY: 1500, // 1.5초
};

// 인증 관련
export const AUTH_STORAGE_KEYS: AuthStorageKeysType = {
  TOKEN: "token",
  USER: "user",
};

// HTTP 상태 코드
export const HTTP_STATUS: HttpStatusType = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
