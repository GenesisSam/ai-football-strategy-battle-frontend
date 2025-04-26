import { io, Socket } from "socket.io-client";
import { MatchEvent } from "../types/global";

// API 기본 URL 설정 (환경에 따라 변경될 수 있음)
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// 소켓 설정 함수
export const createSocket = (token: string): Socket => {
  const socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  // 연결 이벤트 리스너
  socket.on("connect", () => {
    console.log("소켓 연결 성공!");
  });

  // 연결 오류 이벤트 리스너
  socket.on("connect_error", (error) => {
    console.error("소켓 연결 오류:", error);
  });

  // 재연결 이벤트 리스너
  socket.on("reconnect", (attempt) => {
    console.log(`재연결 성공 (시도 ${attempt}번)`);
  });

  return socket;
};

// 매치 구독 함수
export const subscribeToMatch = (socket: Socket, matchId: string): void => {
  socket.emit("match:join", { matchId });
};

// 매치 구독 취소 함수
export const unsubscribeFromMatch = (socket: Socket, matchId: string): void => {
  socket.emit("match:leave", { matchId });
};

// 매치 작업 구독 함수
export const subscribeToMatchJob = (socket: Socket, jobId: string): void => {
  socket.emit("match:subscribeJob", { jobId });
};

// 매치 작업 구독 취소 함수
export const unsubscribeFromMatchJob = (
  socket: Socket,
  jobId: string
): void => {
  socket.emit("match:unsubscribeJob", { jobId });
};

export default {
  createSocket,
  subscribeToMatch,
  unsubscribeFromMatch,
  subscribeToMatchJob,
  unsubscribeFromMatchJob,
};
