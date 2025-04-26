import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import { createSocketConnection } from "../api/socket";

// 로그 헬퍼 함수
const logSocket = (action: string, data?: any) => {
  console.log(`[useSocket] ${action}`, data || "");
};

/**
 * 소켓 연결을 제공하는 훅
 */
export const useSocket = (): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    logSocket("소켓 초기화");
    const socketInstance = createSocketConnection();
    setSocket(socketInstance);

    return () => {
      logSocket("소켓 정리");
      if (socketInstance.connected) {
        socketInstance.disconnect();
      }
    };
  }, []);

  return socket;
};
