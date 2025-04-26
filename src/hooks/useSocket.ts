import { useEffect, useState, useRef } from "react";
import { Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { createSocket } from "../api/socket";

export const useSocket = (): Socket | null => {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 토큰이 없으면 소켓 연결을 시도하지 않음
    if (!token) {
      return;
    }

    // 이미 연결된 소켓이 있으면 재사용
    if (socketRef.current?.connected) {
      setSocket(socketRef.current);
      return;
    }

    // 소켓이 있지만 연결이 끊어진 경우 재연결
    if (socketRef.current) {
      socketRef.current.connect();
      setSocket(socketRef.current);
      return;
    }

    // socket.ts의 createSocket 함수 사용
    const newSocket = createSocket(token);

    // 소켓 설정
    socketRef.current = newSocket;
    setSocket(newSocket);

    // 컴포넌트 언마운트 시 소켓 연결 해제
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  return socket;
};
