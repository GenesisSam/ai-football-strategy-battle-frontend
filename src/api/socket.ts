import { io, Socket } from "socket.io-client";

// 로그 헬퍼 함수
const logSocket = (action: string, data?: any) => {
  console.log(`[Socket] ${action}`, data || "");
};

// 소켓 연결 생성 함수
export const createSocketConnection = (): Socket => {
  const socketURL = "localhost:3000/";
  const token = localStorage.getItem("token");

  logSocket("연결 시도", { url: socketURL });

  const socket = io(socketURL, {
    transports: ["websocket", "polling"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    auth: { token }, // JWT 토큰을 auth 객체에 포함
  });

  // 소켓 연결 이벤트 리스너
  socket.on("connect", () => {
    logSocket("연결 성공", { id: socket.id });
  });

  // 소켓 연결 오류 이벤트 리스너
  socket.on("connect_error", (error) => {
    logSocket("연결 오류", { error: error.message });
  });

  // 소켓 연결 종료 이벤트 리스너
  socket.on("disconnect", (reason) => {
    logSocket("연결 종료", { reason });
  });

  // 재연결 이벤트 리스너
  socket.on("reconnect", (attempt) => {
    logSocket("재연결 성공", { attempt });
  });

  // 재연결 시도 이벤트 리스너
  socket.on("reconnect_attempt", (attempt) => {
    logSocket("재연결 시도", { attempt });
  });

  // 재연결 오류 이벤트 리스너
  socket.on("reconnect_error", (error) => {
    logSocket("재연결 오류", { error: error.message });
  });

  // 재연결 실패 이벤트 리스너
  socket.on("reconnect_failed", () => {
    logSocket("재연결 실패");
  });

  return socket;
};

// 매치 구독 함수
export const subscribeToMatch = (socket: Socket, matchId: string): void => {
  logSocket("매치 구독", { matchId });
  socket.emit("match:join", { matchId });
};

// 매치 구독 취소 함수
export const unsubscribeFromMatch = (socket: Socket, matchId: string): void => {
  logSocket("매치 구독 취소", { matchId });
  socket.emit("match:leave", { matchId });
};

// 매치 작업 구독 함수
export const subscribeToMatchJob = (socket: Socket, jobId: string): void => {
  logSocket("매치 작업 구독", { jobId });
  socket.emit("match:subscribeJob", { jobId });
};

// 매치 작업 구독 취소 함수
export const unsubscribeFromMatchJob = (
  socket: Socket,
  jobId: string
): void => {
  logSocket("매치 작업 구독 취소", { jobId });
  socket.emit("match:unsubscribeJob", { jobId });
};

// 매치 상태 요청 함수
export const requestMatchStatus = (socket: Socket, matchId: string): void => {
  logSocket("매치 상태 요청", { matchId });
  socket.emit("match:requestStatus", { matchId });
};
