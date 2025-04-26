/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // 환경 변수를 더 추가할 수 있습니다
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Window 객체에 __INIT_STATE__ 속성 타입 정의
interface Window {
  __INIT_STATE__?: {
    currentUser?: Record<string, any>;
    authToken?: string;
    refreshToken?: string;
  };
  __INSTANCE_ID__?: string;
}
