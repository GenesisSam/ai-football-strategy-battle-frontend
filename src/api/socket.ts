import { io, Socket } from "socket.io-client";
import { MatchEvent } from "./match";

// 웹소켓 이벤트 타입
export enum SocketEvents {
  SUBSCRIBE_MATCH = "subscribe_match",
  MATCH_EVENT = "match_event",
  MATCH_STATUS_CHANGE = "match_status_change",
  MATCHMAKING_STATUS = "matchmaking_status",
}

// 매치메이킹 상태 인터페이스
export interface MatchmakingStatus {
  status: "searching" | "matched";
  queuePosition?: number;
  estimatedWaitTime?: string;
  matchId?: string;
  opponent?: {
    username: string;
    squadName: string;
  };
}

// 매치 상태 변경 인터페이스
export interface MatchStatusChange {
  matchId: string;
  status: "scheduled" | "in_progress" | "completed";
  timestamp: string;
}

// 매치 이벤트 메시지 인터페이스
export interface MatchEventMessage {
  matchId: string;
  event: MatchEvent;
}

class SocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  // 소켓 연결
  connect(token: string): void {
    if (this.socket) {
      return;
    }

    const API_BASE_URL =
      import.meta.env.VITE_API_URL || "http://localhost:3000";
    this.socket = io(`${API_BASE_URL}/socket`, {
      query: { token },
      transports: ["websocket"],
    });

    // 기본 이벤트 리스너 설정
    this.setupListeners();
  }

  // 소켓 연결 해제
  disconnect(): void {
    if (!this.socket) {
      return;
    }

    this.socket.disconnect();
    this.socket = null;
  }

  // 기본 이벤트 리스너 설정
  private setupListeners(): void {
    if (!this.socket) {
      return;
    }

    this.socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    this.socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    // 매치 이벤트 리스너
    this.socket.on(SocketEvents.MATCH_EVENT, (message: MatchEventMessage) => {
      this.notifyListeners(SocketEvents.MATCH_EVENT, message);
    });

    // 매치 상태 변경 리스너
    this.socket.on(
      SocketEvents.MATCH_STATUS_CHANGE,
      (change: MatchStatusChange) => {
        this.notifyListeners(SocketEvents.MATCH_STATUS_CHANGE, change);
      }
    );

    // 매치메이킹 상태 리스너
    this.socket.on(
      SocketEvents.MATCHMAKING_STATUS,
      (status: MatchmakingStatus) => {
        this.notifyListeners(SocketEvents.MATCHMAKING_STATUS, status);
      }
    );
  }

  // 특정 매치 이벤트 구독
  subscribeToMatch(matchId: string): void {
    if (!this.socket) {
      throw new Error("WebSocket is not connected");
    }

    this.socket.emit(SocketEvents.SUBSCRIBE_MATCH, { matchId });
  }

  // 이벤트 리스너 등록
  addEventListener(event: SocketEvents, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)?.add(callback);
  }

  // 이벤트 리스너 제거
  removeEventListener(event: SocketEvents, callback: Function): void {
    if (!this.listeners.has(event)) {
      return;
    }

    this.listeners.get(event)?.delete(callback);
  }

  // 이벤트 리스너에게 알림
  private notifyListeners(event: SocketEvents, data: any): void {
    if (!this.listeners.has(event)) {
      return;
    }

    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  // 소켓이 연결되었는지 확인
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// 싱글톤 인스턴스 생성
export const socketClient = new SocketClient();
export default socketClient;
