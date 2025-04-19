declare global {
  interface Window {
    __COMPONENT_ID__: string;
    hammer: any; // hammer.js instance

    __INIT_STATE__: {
      groupId: string;
      channelId: string;
      threadId: string;
      replyId?: string;
      embedObject?: Record<string, any>;
      inApp: boolean;
      isEP?: boolean;
      isAndroid?: boolean;
      isIOS?: boolean;

      sharedObject?: Record<string, any>;

      // NOTE: 11+에서만 제공하는 정보
      currentUser?: Record<string, any>;
      authToken?: string;
      refreshToken?: string;
    };
  }
}

// 빈 export를 추가하여 이 파일이 모듈로 인식되도록 합니다
export {};
