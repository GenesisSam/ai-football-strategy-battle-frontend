/**
 * 메시지 관련 상수
 */

/**
 * 인증 관련 에러 메시지 타입
 */
export interface AuthErrorMessagesType {
  /** 로그인 실패 메시지 */
  LOGIN_FAILED: string;
  /** 인증 필요 메시지 */
  UNAUTHORIZED: string;
  /** 권한 없음 메시지 */
  FORBIDDEN: string;
  /** 세션 만료 메시지 */
  SESSION_EXPIRED: string;
}

/**
 * 매치 관련 에러 메시지 타입
 */
export interface MatchErrorMessagesType {
  /** 매치 찾을 수 없음 메시지 */
  NOT_FOUND: string;
  /** 매치 생성 실패 메시지 */
  CREATION_FAILED: string;
  /** 매치 취소 실패 메시지 */
  CANCEL_FAILED: string;
  /** 서버 오류 메시지 */
  SERVER_ERROR: string;
  /** 매치 정보 로딩 실패 메시지 */
  LOADING_FAILED: string;
  /** 서버 연결 오류 메시지 */
  CONNECTION_ERROR: string;
}

/**
 * 스쿼드 관련 에러 메시지 타입
 */
export interface SquadErrorMessagesType {
  /** 스쿼드 찾을 수 없음 메시지 */
  NOT_FOUND: string;
  /** 스쿼드 생성 실패 메시지 */
  CREATION_FAILED: string;
  /** 스쿼드 업데이트 실패 메시지 */
  UPDATE_FAILED: string;
  /** 스쿼드 활성화 실패 메시지 */
  ACTIVATION_FAILED: string;
}

/**
 * 일반 에러 메시지 타입
 */
export interface GeneralErrorMessagesType {
  /** 네트워크 오류 메시지 */
  NETWORK_ERROR: string;
  /** 알 수 없는 오류 메시지 */
  UNKNOWN_ERROR: string;
  /** 타임아웃 메시지 */
  TIMEOUT: string;
  /** 잘못된 입력 메시지 */
  INVALID_INPUT: string;
}

/**
 * 에러 메시지 전체 타입
 */
export interface ErrorMessagesType {
  /** 인증 관련 에러 메시지 */
  AUTH: AuthErrorMessagesType;
  /** 매치 관련 에러 메시지 */
  MATCH: MatchErrorMessagesType;
  /** 스쿼드 관련 에러 메시지 */
  SQUAD: SquadErrorMessagesType;
  /** 일반 에러 메시지 */
  GENERAL: GeneralErrorMessagesType;
}

/**
 * 인증 관련 성공 메시지 타입
 */
export interface AuthSuccessMessagesType {
  /** 로그인 성공 메시지 */
  LOGIN_SUCCESS: string;
  /** 회원가입 성공 메시지 */
  REGISTER_SUCCESS: string;
  /** 로그아웃 성공 메시지 */
  LOGOUT_SUCCESS: string;
}

/**
 * 매치 관련 성공 메시지 타입
 */
export interface MatchSuccessMessagesType {
  /** 매치 생성 성공 메시지 */
  CREATION_SUCCESS: string;
  /** 매치 취소 성공 메시지 */
  CANCEL_SUCCESS: string;
}

/**
 * 스쿼드 관련 성공 메시지 타입
 */
export interface SquadSuccessMessagesType {
  /** 스쿼드 생성 성공 메시지 */
  CREATION_SUCCESS: string;
  /** 스쿼드 업데이트 성공 메시지 */
  UPDATE_SUCCESS: string;
  /** 스쿼드 활성화 성공 메시지 */
  ACTIVATION_SUCCESS: string;
}

/**
 * 성공 메시지 전체 타입
 */
export interface SuccessMessagesType {
  /** 인증 관련 성공 메시지 */
  AUTH: AuthSuccessMessagesType;
  /** 매치 관련 성공 메시지 */
  MATCH: MatchSuccessMessagesType;
  /** 스쿼드 관련 성공 메시지 */
  SQUAD: SquadSuccessMessagesType;
}

/**
 * 매치 관련 확인 메시지 타입
 */
export interface MatchConfirmMessagesType {
  /** 매치 취소 확인 메시지 */
  CANCEL_CONFIRM: string;
}

/**
 * 스쿼드 관련 확인 메시지 타입
 */
export interface SquadConfirmMessagesType {
  /** 스쿼드 삭제 확인 메시지 */
  DELETE_CONFIRM: string;
}

/**
 * 일반 확인 메시지 타입
 */
export interface GeneralConfirmMessagesType {
  /** 변경사항 폐기 확인 메시지 */
  DISCARD_CHANGES: string;
}

/**
 * 확인 메시지 전체 타입
 */
export interface ConfirmMessagesType {
  /** 매치 관련 확인 메시지 */
  MATCH: MatchConfirmMessagesType;
  /** 스쿼드 관련 확인 메시지 */
  SQUAD: SquadConfirmMessagesType;
  /** 일반 확인 메시지 */
  GENERAL: GeneralConfirmMessagesType;
}

// 에러 메시지
export const ERROR_MESSAGES: ErrorMessagesType = {
  // 인증 관련 에러
  AUTH: {
    LOGIN_FAILED: "로그인에 실패했습니다.",
    UNAUTHORIZED: "인증이 필요합니다. 다시 로그인해주세요.",
    FORBIDDEN: "이 작업을 수행할 권한이 없습니다.",
    SESSION_EXPIRED: "세션이 만료되었습니다. 다시 로그인해주세요.",
  },
  // 매치 관련 에러
  MATCH: {
    NOT_FOUND: "요청한 매치를 찾을 수 없습니다.",
    CREATION_FAILED: "매치 생성에 실패했습니다.",
    CANCEL_FAILED: "매치 취소에 실패했습니다.",
    SERVER_ERROR: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    LOADING_FAILED: "매치 정보를 불러오는데 실패했습니다.",
    CONNECTION_ERROR: "서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.",
  },
  // 스쿼드 관련 에러
  SQUAD: {
    NOT_FOUND: "요청한 스쿼드를 찾을 수 없습니다.",
    CREATION_FAILED: "스쿼드 생성에 실패했습니다.",
    UPDATE_FAILED: "스쿼드 업데이트에 실패했습니다.",
    ACTIVATION_FAILED: "스쿼드 활성화에 실패했습니다.",
  },
  // 일반 에러
  GENERAL: {
    NETWORK_ERROR: "네트워크 오류가 발생했습니다.",
    UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다.",
    TIMEOUT: "요청 시간이 초과되었습니다.",
    INVALID_INPUT: "잘못된 입력입니다.",
  },
};

// 성공 메시지
export const SUCCESS_MESSAGES: SuccessMessagesType = {
  // 인증 관련 성공
  AUTH: {
    LOGIN_SUCCESS: "로그인에 성공했습니다.",
    REGISTER_SUCCESS: "회원가입에 성공했습니다.",
    LOGOUT_SUCCESS: "로그아웃되었습니다.",
  },
  // 매치 관련 성공
  MATCH: {
    CREATION_SUCCESS: "매치가 성공적으로 생성되었습니다.",
    CANCEL_SUCCESS: "매치가 취소되었습니다.",
  },
  // 스쿼드 관련 성공
  SQUAD: {
    CREATION_SUCCESS: "스쿼드가 성공적으로 생성되었습니다.",
    UPDATE_SUCCESS: "스쿼드가 업데이트되었습니다.",
    ACTIVATION_SUCCESS: "스쿼드가 활성화되었습니다.",
  },
};

// 확인 메시지
export const CONFIRM_MESSAGES: ConfirmMessagesType = {
  MATCH: {
    CANCEL_CONFIRM: "정말로 매치를 취소하시겠습니까?",
  },
  SQUAD: {
    DELETE_CONFIRM: "정말로 이 스쿼드를 삭제하시겠습니까?",
  },
  GENERAL: {
    DISCARD_CHANGES: "변경 사항이 저장되지 않습니다. 계속하시겠습니까?",
  },
};
