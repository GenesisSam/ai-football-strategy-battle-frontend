import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import { getToken } from "../utils/authUtils"; // 수정된 경로: utils/auth -> utils/authUtils

const API_URL = "http://localhost:3000";

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  error?: string;
}

export const useSocket = (): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const connectAttempts = useRef<number>(0);
  const reconnectPromise = useRef<Promise<void> | null>(null);

  // 소켓 연결 함수
  const connect = useCallback(() => {
    // 이미 연결이 시도 중이면 중복 연결 방지
    if (socketRef.current) {
      console.log("[Socket] Connection already exists, skipping connect");
      return;
    }

    try {
      // 토큰 가져오기
      const token = getToken();
      if (!token) {
        console.error("[Socket] No auth token available");
        return;
      }

      console.log("[Socket] Creating new connection");

      // 새 소켓 연결 생성
      socketRef.current = io(API_URL, {
        transports: ["websocket", "polling"], // 서버와 동일하게 설정
        reconnection: true, // 자동 재연결 활성화
        reconnectionAttempts: 5, // 최대 5번 재시도
        reconnectionDelay: 1000, // 1초 대기 후 재시도
        timeout: 10000, // 10초 타임아웃
        auth: { token }, // 인증 토큰 포함
      });

      // 연결 이벤트 리스너
      socketRef.current.on("connect", () => {
        console.log("[Socket] Connected");
        setIsConnected(true);
        connectAttempts.current = 0; // 연결 시도 횟수 리셋
      });

      // 연결 끊김 이벤트 리스너
      socketRef.current.on("disconnect", (reason) => {
        console.log(`[Socket] Disconnected: ${reason}`);
        setIsConnected(false);
      });

      // 재연결 이벤트 리스너
      socketRef.current.on("reconnect", (attemptNumber) => {
        console.log(`[Socket] Reconnected after ${attemptNumber} attempts`);
        setIsConnected(true);
      });

      // 재연결 시도 이벤트 리스너
      socketRef.current.on("reconnect_attempt", (attemptNumber) => {
        console.log(`[Socket] Reconnection attempt ${attemptNumber}`);
      });

      // 재연결 실패 이벤트 리스너
      socketRef.current.on("reconnect_failed", () => {
        console.error("[Socket] Reconnection failed");
      });

      // 연결 에러 이벤트 리스너
      socketRef.current.on("connect_error", (error) => {
        console.error(`[Socket] Connection error: ${error.message}`, error);
        setIsConnected(false);
      });

      // 에러 이벤트 리스너
      socketRef.current.on("error", (error) => {
        console.error(`[Socket] Error: ${error.message}`, error);
      });

      // 인증 이벤트 리스너
      socketRef.current.on("authenticated", (data) => {
        console.log("[Socket] Authentication successful", data);
      });
    } catch (error) {
      console.error("[Socket] Failed to connect:", error);
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // 소켓 연결 끊기 함수
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log("[Socket] Disconnecting");
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // 소켓 재연결 함수
  const reconnect = useCallback(() => {
    // 이미 연결되어 있으면 건너뛰기
    if (isConnected && socketRef.current?.connected) {
      console.log("[Socket] Already connected, skipping reconnect");
      return Promise.resolve();
    }

    // 이미 재연결 시도 중이면 중복 재연결 방지
    if (reconnectPromise.current) {
      console.log("[Socket] Reconnection already in progress");
      return reconnectPromise.current;
    }

    // 연결 시도 횟수 증가
    connectAttempts.current += 1;
    console.log(`[Socket] Reconnect attempt ${connectAttempts.current}`);

    // 연결 끊기
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // 새 연결 시도
    const promise = new Promise<void>((resolve) => {
      // 연결 시도
      connect();

      // 연결 대기
      if (socketRef.current) {
        // 이미 연결됐거나 연결 성공 시
        if (socketRef.current.connected) {
          console.log("[Socket] Successfully reconnected (already connected)");
          resolve();
        } else {
          // 연결 대기
          socketRef.current.once("connect", () => {
            console.log("[Socket] Successfully reconnected");
            resolve();
          });

          // 타임아웃 설정
          setTimeout(() => {
            if (!socketRef.current?.connected) {
              console.log("[Socket] Reconnect timed out");
              resolve();
            }
          }, 5000); // 5초 타임아웃
        }
      } else {
        resolve();
      }
    }).finally(() => {
      reconnectPromise.current = null; // 프로미스 초기화
    });

    reconnectPromise.current = promise;
    return promise;
  }, [connect, isConnected]);

  // 컴포넌트 언마운트 시 연결 정리
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        console.log("[Socket] Cleaning up socket connection");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // 소켓 객체와 상태 메모이제이션
  const socket = useMemo(() => socketRef.current, [isConnected]);

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    reconnect,
  };
};
