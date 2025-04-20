import { io, Socket } from "socket.io-client";

// 웹소켓 이벤트 타입 - Match 관련 이벤트 제거
export enum SocketEvents {}
// 기본 소켓 이벤트만 남김

// 이벤트 리스너 타입
type EventListener<T = any> = (data: T) => void;

class SocketClient {
  private socket: Socket | null = null;
  private listeners: Map<SocketEvents, Set<EventListener>> = new Map();
  private token: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 2000; // 초기 재연결 간격 (ms)
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connectionInProgress: boolean = false; // 연결 시도 중인지 추적하는 플래그

  // 소켓 연결 메서드 개선
  connect(token: string): Promise<boolean> {
    // 연결 시도 중이면 대기
    if (this.connectionInProgress) {
      console.log("소켓 연결이 이미 진행 중입니다. 대기합니다.");
      return Promise.resolve(this.isConnected());
    }

    // 이미 연결되어 있고, 토큰이 변경되지 않았다면 재연결하지 않음
    if (this.socket?.connected && this.token === token) {
      console.log("이미 소켓 연결이 활성화되어 있습니다.");
      return Promise.resolve(true);
    }

    // 토큰이 변경된 경우 기존 연결 종료 후 재연결
    if (this.socket?.connected && this.token !== token) {
      this.disconnect();
    }

    this.connectionInProgress = true;

    return new Promise((resolve) => {
      // 토큰 저장
      this.token = token;
      this.reconnectAttempts = 0;

      // API URL 가져오기
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3000";

      // 소켓 연결 옵션
      const socketOptions = {
        auth: { token },
        transports: ["websocket", "polling"] as const,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectInterval,
        timeout: 10000, // 연결 타임아웃 설정
      };

      // 연결 타임아웃 설정 (15초에서 8초로 단축)
      const connectionTimeout = setTimeout(() => {
        console.error("WebSocket 연결 타임아웃");
        this.connectionInProgress = false;
        resolve(false);
        this.handleReconnect(); // 타임아웃 시에도 재연결 시도
      }, 8000);

      try {
        // 소켓 연결 (기본 네임스페이스 "/" 사용)
        this.socket = io(`${API_BASE_URL}`, socketOptions);

        // 연결 이벤트 핸들러 설정
        this.socket.once("connect", () => {
          clearTimeout(connectionTimeout); // 타임아웃 해제
          console.log("WebSocket connected");
          this.reconnectAttempts = 0; // 연결 성공 시 재연결 시도 카운터 초기화
          this.connectionInProgress = false;
          resolve(true);
        });

        this.socket.once("connect_error", (error: Error) => {
          clearTimeout(connectionTimeout); // 타임아웃 해제
          console.error("WebSocket 연결 오류:", error.message);
          this.connectionInProgress = false;
          resolve(false);
          this.handleReconnect();
        });

        // 기본 이벤트 리스너 설정
        this.setupListeners();
      } catch (err) {
        clearTimeout(connectionTimeout); // 타임아웃 해제
        console.error("WebSocket 연결 중 오류:", err);
        this.connectionInProgress = false;
        resolve(false);
        this.handleReconnect();
      }
    });
  }

  // 자동 재연결 처리 개선
  private handleReconnect(): void {
    if (
      !this.token ||
      this.reconnectAttempts >= this.maxReconnectAttempts ||
      this.socket?.connected ||
      this.connectionInProgress
    ) {
      return;
    }

    console.log(
      `WebSocket 재연결 시도 ${this.reconnectAttempts + 1}/${
        this.maxReconnectAttempts
      }`
    );

    // 지수 백오프 적용 (최대 30초)
    const delay = Math.min(
      this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts),
      30000
    );

    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.connect(this.token!).then((connected) => {
        if (!connected && this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(
            `재연결 실패, ${this.reconnectAttempts}/${this.maxReconnectAttempts} 번째 시도`
          );
        }
      });
    }, delay);
  }

  // 소켓 연결 해제
  disconnect(): void {
    if (!this.socket) {
      return;
    }

    // 진행 중인 재연결 타이머 정리
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // 리스너 제거 추가
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    this.token = null;
    this.connectionInProgress = false;
  }

  // 기본 이벤트 리스너 설정 - 매치 관련 리스너 제거
  private setupListeners(): void {
    if (!this.socket) {
      return;
    }

    // 연결 해제 이벤트
    this.socket.on("disconnect", (reason: string) => {
      console.log(`WebSocket disconnected: ${reason}`);

      // 서버 측에서 의도적으로 연결을 종료한 경우에는 재연결 시도하지 않음
      if (reason === "io server disconnect") {
        console.log(
          "서버에서 연결이 종료되었습니다. 재연결 시도하지 않습니다."
        );
        this.connectionInProgress = false;
      } else if (
        this.token &&
        !this.reconnectTimer &&
        !this.connectionInProgress
      ) {
        // 토큰이 있고, 재연결 타이머가 없고, 연결 시도 중이 아닌 경우에만 재연결 시도
        this.connectionInProgress = false;
        this.handleReconnect();
      }
    });

    // 오류 이벤트
    this.socket.on("error", (error: Error) => {
      console.error("WebSocket 오류:", error);
    });
  }

  // 타입 안전성을 갖춘 이벤트 리스너 등록
  addEventListener<E extends SocketEvents>(
    event: E,
    callback: EventListener<any>
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set<EventListener>());
    }

    this.listeners.get(event)!.add(callback as EventListener);
  }

  // 이벤트 리스너 제거
  removeEventListener<E extends SocketEvents>(
    event: E,
    callback: EventListener<any>
  ): void {
    if (!this.listeners.has(event)) {
      return;
    }

    this.listeners.get(event)!.delete(callback as EventListener);

    // 등록된 리스너가 없는 경우 맵에서 제거 (메모리 관리)
    if (this.listeners.get(event)!.size === 0) {
      this.listeners.delete(event);
    }
  }

  // 이벤트 리스너에게 알림
  private notifyListeners<E extends SocketEvents>(event: E, data: any): void {
    if (!this.listeners.has(event)) {
      return;
    }

    // 중간에 리스너가 제거되어도 영향받지 않도록 배열로 복사하여 실행
    const callbacks = Array.from(this.listeners.get(event)!);
    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  // 소켓이 연결되었는지 확인 - 안정적인 체크
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // 모든 이벤트 리스너 제거 (메모리 정리)
  clearAllEventListeners(): void {
    this.listeners.clear();
  }

  // 특정 이벤트의 모든 리스너 제거
  clearEventListeners(event: SocketEvents): void {
    if (this.listeners.has(event)) {
      this.listeners.delete(event);
    }
  }

  // 소켓 인스턴스 가져오기 (고급 사용자를 위한 안전한 접근)
  getSocket(): Socket | null {
    return this.socket;
  }
}

// 싱글톤 인스턴스 생성
export const socketClient = new SocketClient();
export default socketClient;
