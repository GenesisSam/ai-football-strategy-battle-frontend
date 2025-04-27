/**
 * UI 관련 상수
 */

/**
 * 애니메이션 설정 타입
 */
export interface AnimationConfig {
  /** 스플래시 화면 지속 시간 (ms) */
  SPLASH_DURATION: number;
  /** 페이드 효과 지속 시간 (ms) */
  FADE_DURATION: number;
  /** 로딩 애니메이션 지속 시간 (초) */
  LOADING_ANIMATION_DURATION: number;
  /** 트랜지션 지속 시간 (ms) */
  TRANSITION_DURATION: number;
}

/**
 * 색상 설정 타입
 */
export interface ColorConfig {
  /** 주 색상 */
  PRIMARY: string;
  /** 어두운 주 색상 */
  PRIMARY_DARK: string;
  /** 보조 색상 */
  SECONDARY: string;
  /** 어두운 보조 색상 */
  SECONDARY_DARK: string;
  /** 성공 색상 */
  SUCCESS: string;
  /** 어두운 성공 색상 */
  SUCCESS_DARK: string;
  /** 위험 색상 */
  DANGER: string;
  /** 어두운 위험 색상 */
  DANGER_DARK: string;
  /** 경고 색상 */
  WARNING: string;
  /** 어두운 경고 색상 */
  WARNING_DARK: string;
  /** 정보 색상 */
  INFO: string;
  /** 어두운 정보 색상 */
  INFO_DARK: string;
  /** 밝은 색상 */
  LIGHT: string;
  /** 어두운 색상 */
  DARK: string;
  /** 중립 색상 */
  NEUTRAL: string;
  /** 배경 색상 */
  BACKGROUND: string;
}

/**
 * 테두리 반경 설정 타입
 */
export interface BorderRadiusConfig {
  /** 작은 테두리 반경 */
  SMALL: string;
  /** 중간 테두리 반경 */
  MEDIUM: string;
  /** 큰 테두리 반경 */
  LARGE: string;
}

/**
 * Z-인덱스 설정 타입
 */
export interface ZIndexConfig {
  /** 드롭다운 z-인덱스 */
  DROPDOWN: number;
  /** 모달 z-인덱스 */
  MODAL: number;
  /** 토스트 z-인덱스 */
  TOAST: number;
  /** 로딩 오버레이 z-인덱스 */
  LOADING_OVERLAY: number;
}

/**
 * 레이아웃 설정 타입
 */
export interface LayoutConfig {
  /** 최대 너비 */
  MAX_WIDTH: string;
  /** 컨테이너 여백 */
  CONTAINER_PADDING: string;
  /** 테두리 반경 설정 */
  BORDER_RADIUS: BorderRadiusConfig;
  /** 기본 박스 그림자 */
  BOX_SHADOW: string;
  /** 호버 시 박스 그림자 */
  BOX_SHADOW_HOVER: string;
  /** Z-인덱스 설정 */
  Z_INDEX: ZIndexConfig;
}

/**
 * 반응형 디자인 브레이크포인트 타입
 */
export interface BreakpointsConfig {
  /** 초소형 화면 */
  XS: string;
  /** 소형 화면 */
  SM: string;
  /** 중형 화면 */
  MD: string;
  /** 대형 화면 */
  LG: string;
  /** 초대형 화면 */
  XL: string;
}

/**
 * 이벤트 타입별 색상 설정 타입
 */
export interface EventTypeColorsConfig {
  /** 골 이벤트 배경 색상 */
  GOAL: string;
  /** 카드 이벤트 배경 색상 */
  CARD: string;
  /** 부상 이벤트 배경 색상 */
  INJURY: string;
}

// 애니메이션 시간
export const ANIMATION: AnimationConfig = {
  SPLASH_DURATION: 1500, // 1.5초
  FADE_DURATION: 300, // 0.3초
  LOADING_ANIMATION_DURATION: 1.5, // 1.5초
  TRANSITION_DURATION: 300, // 0.3초
};

// 색상 (테마 오버라이드를 위한 참조용)
export const COLORS: ColorConfig = {
  PRIMARY: "#1a73e8",
  PRIMARY_DARK: "#0d47a1",
  SECONDARY: "#ff5722",
  SECONDARY_DARK: "#e64a19",
  SUCCESS: "#4caf50",
  SUCCESS_DARK: "#2e7d32",
  DANGER: "#dc3545",
  DANGER_DARK: "#c82333",
  WARNING: "#ffc107",
  WARNING_DARK: "#ff8f00",
  INFO: "#17a2b8",
  INFO_DARK: "#0097a7",
  LIGHT: "#f8f9fa",
  DARK: "#343a40",
  NEUTRAL: "#6c757d",
  BACKGROUND: "#ffffff",
};

// 레이아웃 관련 상수
export const LAYOUT: LayoutConfig = {
  MAX_WIDTH: "1200px",
  CONTAINER_PADDING: "20px",
  BORDER_RADIUS: {
    SMALL: "4px",
    MEDIUM: "8px",
    LARGE: "12px",
  },
  BOX_SHADOW: "0 2px 8px rgba(0, 0, 0, 0.1)",
  BOX_SHADOW_HOVER: "0 4px 12px rgba(0, 0, 0, 0.15)",
  Z_INDEX: {
    DROPDOWN: 100,
    MODAL: 200,
    TOAST: 300,
    LOADING_OVERLAY: 1000,
  },
};

// 반응형 디자인 브레이크포인트
export const BREAKPOINTS: BreakpointsConfig = {
  XS: "320px",
  SM: "576px",
  MD: "768px",
  LG: "992px",
  XL: "1200px",
};

// 이벤트 타입별 배경색
export const EVENT_TYPE_COLORS: EventTypeColorsConfig = {
  GOAL: "rgba(46, 204, 113, 0.2)",
  CARD: "rgba(231, 76, 60, 0.2)",
  INJURY: "rgba(241, 196, 15, 0.2)",
};
