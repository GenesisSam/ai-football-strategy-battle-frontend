import { useState, useEffect, useRef, useCallback } from "react";
import { Socket } from "socket.io-client";
import { createSocketConnection, subscribeToMatch } from "../api/socket";

/**
 * 매치 웹소켓 연결을 관리하는 훅
 *
 * - 자동 연결 및 재연결 처리
 * - 매치 구독 자동 처리
 * - 연결 상태 및 에러 관리
 */
export function useSocket(matchId?: string) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const reconnectIntervalRef = useRef<number | null>(null);

  // 로그 헬퍼 함수
  const log = useCallback((message: string, data?: any) => {
    console.log(`[useSocket] ${message}`, data || "");
  }, []);

  // 소켓 연결 함수
  const connect = useCallback(() => {
    try {
      // 기존 재연결 인터벌이 있다면 정리
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
      }

      log("소켓 연결 시작");
      socketRef.current = createSocketConnection();

      // 연결 이벤트 핸들러
      socketRef.current.on("connect", () => {
        log("소켓 연결됨", { id: socketRef.current?.id });
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // matchId가 있으면 자동 구독
        if (matchId && socketRef.current) {
          subscribeToMatch(socketRef.current, matchId);
        }
      });

      // 연결 끊김 이벤트 핸들러
      socketRef.current.on("disconnect", (reason) => {
        log("소켓 연결 끊김", { reason });
        setIsConnected(false);

        // 자동 재연결이 작동하지 않는 경우에만 수동 재연결 시도
        if (
          reason === "io server disconnect" ||
          reason === "io client disconnect"
        ) {
          // 서버에서 연결을 끊은 경우 수동 재연결
          startReconnecting();
        }
      });

      // 연결 오류 이벤트 핸들러
      socketRef.current.on("connect_error", (err) => {
        log("연결 오류 발생", { error: err.message });
        setIsConnected(false);
        setError(`연결 오류: ${err.message}`);

        // socket.io의 내장 재연결 매커니즘 외에 추가적인 재연결 처리
        startReconnecting();
      });

      return socketRef.current;
    } catch (err) {
      const errMessage =
        err instanceof Error ? err.message : "알 수 없는 소켓 오류";
      log("소켓 초기화 오류", { error: errMessage });
      setError(`소켓 초기화 오류: ${errMessage}`);
      setIsConnected(false);
      return null;
    }
  }, [matchId, log]);

  // 수동 재연결 시작
  const startReconnecting = useCallback(() => {
    if (reconnectIntervalRef.current) {
      clearInterval(reconnectIntervalRef.current);
    }

    reconnectIntervalRef.current = setInterval(() => {
      // 최대 시도 횟수 초과시 중단
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        if (reconnectIntervalRef.current) {
          clearInterval(reconnectIntervalRef.current);
          reconnectIntervalRef.current = null;
        }
        setError(
          "최대 재연결 시도 횟수를 초과했습니다. 페이지를 새로고침 해주세요."
        );
        log("최대 재연결 시도 횟수 초과");
        return;
      }

      if (!isConnected && socketRef.current) {
        reconnectAttemptsRef.current++;
        log(
          `재연결 시도 중... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
        );
        socketRef.current.connect();
      }
    }, 2000); // 2초마다 재연결 시도
  }, [isConnected, log]);

  // 소켓 연결 해제 함수
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      log("소켓 연결 해제");
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (reconnectIntervalRef.current) {
      clearInterval(reconnectIntervalRef.current);
      reconnectIntervalRef.current = null;
    }

    setIsConnected(false);
  }, [log]);

  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    reconnect: connect,
    disconnect,
  };
}
