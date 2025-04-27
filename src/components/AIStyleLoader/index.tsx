import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

import { useSocket } from "../../hooks/useSocket";
import { MatchStatus, JobDetailStatus } from "../../types/global.d";
import { getMatchStatus, getMatchById } from "../../api/match";
import {
  LoaderContainer,
  LoadingText,
  StatusMessage,
  ScoreDisplay,
  TeamName,
  Score,
  LoadingBar,
  LoadingProgress,
  LogsContainer,
  LogEntry,
  LogTime,
  LogMessage,
} from "./styled";

// 상태 메시지 맵 타입 정의
type StatusMessagesType = {
  [key in MatchStatus | JobDetailStatus]: string;
};

// 진행률 맵 타입 정의
type ProgressMapType = {
  [key in MatchStatus | JobDetailStatus]: number;
};

// 매치 상태에 따른 메시지 맵
const STATUS_MESSAGES: StatusMessagesType = {
  // 매치 상태
  [MatchStatus.CREATED]: "매치가 생성되었습니다.",
  [MatchStatus.STARTED]: "매치가 시작되었습니다!",
  [MatchStatus.IN_PROGRESS]: "매치가 진행 중입니다.",
  [MatchStatus.ENDED]: "매치가 종료되었습니다.",

  // 작업 상세 상태
  [JobDetailStatus.MATCHMAKING]: "매치메이킹 중입니다...",
  [JobDetailStatus.OPPONENT_FOUND]: "대결 상대를 찾았습니다!",
  [JobDetailStatus.PREPARING_STADIUM]: "경기장을 준비하고 있습니다...",
  [JobDetailStatus.PLAYERS_ENTERING]: "선수들이 입장하고 있습니다...",
  [JobDetailStatus.SIMULATING]: "AI가 시뮬레이션 중입니다...",
  [JobDetailStatus.SAVING_RESULT]: "결과를 저장하는 중입니다...",
  [JobDetailStatus.COMPLETED]: "경기가 완료되었습니다.",
  [JobDetailStatus.FAILED]: "오류가 발생했습니다.",
};

// 매치 상태에 따른 진행률 맵
const PROGRESS_BY_STATUS: ProgressMapType = {
  // 매치 상태
  [MatchStatus.CREATED]: 10,
  [MatchStatus.STARTED]: 25,
  [MatchStatus.IN_PROGRESS]: 70,
  [MatchStatus.ENDED]: 100,

  // 작업 상세 상태
  [JobDetailStatus.MATCHMAKING]: 10,
  [JobDetailStatus.OPPONENT_FOUND]: 25,
  [JobDetailStatus.PREPARING_STADIUM]: 40,
  [JobDetailStatus.PLAYERS_ENTERING]: 55,
  [JobDetailStatus.SIMULATING]: 70,
  [JobDetailStatus.SAVING_RESULT]: 85,
  [JobDetailStatus.COMPLETED]: 100,
  [JobDetailStatus.FAILED]: 100,
};

// 소켓 이벤트 타입 정의
const SOCKET_EVENTS = {
  CONNECT: "connect",
  RECONNECT: "reconnect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",
  ERROR: "error",
  AUTHENTICATED: "authenticated",
  JOB_STATUS: "match:jobStatus",
  JOB_COMPLETED: "match:jobCompleted",
  STATUS_UPDATE: "match:statusUpdate",
  LOG: "match:log",
  ALL_LOGS: "match:allLogs",
  SCORE_UPDATE: "match:scoreUpdate",
  MATCH_END: "match:end",
  JOIN_RESPONSE: "match:joinResponse", // 매치 참가 응답
  RECENT_STATUS_UPDATES: "match:recentStatusUpdates", // 최근 상태 업데이트 응답
  RECENT_LOGS: "match:recentLogs", // 최근 로그 응답
};

// 소켓 액션 타입 정의
const SOCKET_ACTIONS = {
  SUBSCRIBE_JOB: "match:subscribeJob",
  UNSUBSCRIBE_JOB: "match:unsubscribeJob",
  JOIN_MATCH: "match:join",
  LEAVE_MATCH: "match:leave",
  REQUEST_STATUS: "match:requestStatus",
};

interface AIStyleLoaderProps {
  jobId?: string; // 비동기 매치 작업 ID
  matchId?: string; // 직접 매치 ID
  statusText?: string; // 상태 메시지
  onMatchComplete?: (matchId: string) => void;
}

interface MatchLog {
  minute: number;
  description: string;
  eventType: string;
  timestamp: Date;
}

interface MatchStatusUpdate {
  status: MatchStatus;
  message: string;
  timestamp: Date;
  additionalInfo?: {
    homeScore?: number;
    awayScore?: number;
    winner?: "home" | "away" | "draw";
  };
}

interface JobStatusData {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  detailStatus?: JobDetailStatus; // 상세 상태 추가
  progressMessage?: string; // 진행 상태 메시지 추가
  matchId?: string;
  error?: string;
}

const AIStyleLoader: React.FC<AIStyleLoaderProps> = ({
  jobId,
  matchId: initialMatchId,
  onMatchComplete,
}) => {
  const socket = useSocket();

  // 상태 관리
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<MatchStatus>(MatchStatus.CREATED);
  const [message, setMessage] = useState<string>(
    STATUS_MESSAGES[JobDetailStatus.MATCHMAKING] || "매치메이킹 중입니다..."
  );
  const [matchId, setMatchId] = useState<string | undefined>(initialMatchId);
  const [logs, setLogs] = useState<MatchLog[]>([]);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);

  // 소켓 연결 상태 추적 (useRef로 변경하여 렌더링 없이도 최신 상태 유지)
  const socketState = useRef({
    isConnected: socket.isConnected, // 초기 연결 상태 설정
    isAuthenticated: false, // 인증 여부
    isSubscribed: false, // 구독 여부
    subscriptionAttempts: 0, // 구독 시도 횟수
    connectionError: null as Error | null,
    subscriptionIds: new Set<string>(), // 구독 ID 목록
    joinRequestTime: 0, // 조인 요청 시간
    lastEventReceived: 0, // 마지막 이벤트 수신 시간
  });

  // 디버그 로그 관리
  const log = useCallback((action: string, data?: unknown) => {
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now
      .getMilliseconds()
      .toString()
      .padStart(3, "0")}`;
    console.log(`[AIStyleLoader ${timestamp}] ${action}`, data || "");
  }, []);

  // 매치 상태에 따른 진행률 업데이트
  const updateProgressByStatus = useCallback(
    (newStatus: MatchStatus) => {
      const newProgress = PROGRESS_BY_STATUS[newStatus] || progress;
      if (newProgress !== progress) {
        setProgress(newProgress);
      }
    },
    [progress]
  );

  // 초기 진행률 설정
  const initialProgress = useMemo(() => {
    if (initialMatchId)
      return PROGRESS_BY_STATUS[JobDetailStatus.PREPARING_STADIUM];
    if (jobId) return PROGRESS_BY_STATUS[JobDetailStatus.MATCHMAKING];
    return 0;
  }, [initialMatchId, jobId]);

  // 점수 표시 여부 결정
  const showScoreDisplay = useMemo(() => {
    return [
      MatchStatus.STARTED,
      MatchStatus.IN_PROGRESS,
      MatchStatus.ENDED,
    ].includes(status);
  }, [status]);

  // 매치 완료 처리
  const handleMatchComplete = useCallback(() => {
    if (onMatchComplete && matchId) {
      log("매치 완료 콜백", { matchId });
      onMatchComplete(matchId);
    }
  }, [log, matchId, onMatchComplete]);

  // 소켓 연결 확인 함수
  const isSocketConnected = useCallback(() => {
    const sock = socket.socket;
    return sock && sock.connected === true && socket.isConnected === true;
  }, [socket]);

  // 소켓 이벤트 구독 함수
  const subscribeToEvents = useCallback(() => {
    if (socketState.current.subscriptionAttempts > 10) {
      log("최대 구독 시도 횟수 초과, 구독 중단", {
        attempts: socketState.current.subscriptionAttempts,
      });
      return false;
    }

    socketState.current.subscriptionAttempts++;
    log("구독 시도", { attempt: socketState.current.subscriptionAttempts });

    const sock = socket.socket;
    if (!sock || !sock.connected || !socket.isConnected) {
      log("소켓이 연결되지 않음, 구독 실패");
      return false;
    }

    // 이미 구독된 ID 해제
    if (socketState.current.subscriptionIds.size > 0) {
      log("기존 구독 ID 해제", {
        subscriptions: Array.from(socketState.current.subscriptionIds),
      });

      socketState.current.subscriptionIds.forEach((id) => {
        if (id.startsWith("job:")) {
          const jobId = id.replace("job:", "");
          sock.emit(SOCKET_ACTIONS.UNSUBSCRIBE_JOB, { jobId });
        } else if (id.startsWith("match:")) {
          const matchId = id.replace("match:", "");
          sock.emit(SOCKET_ACTIONS.LEAVE_MATCH, { matchId });
        }
      });
    }

    socketState.current.subscriptionIds.clear();
    socketState.current.isSubscribed = false;

    // 작업 구독
    if (jobId) {
      log("작업 구독", { jobId });
      sock.emit(SOCKET_ACTIONS.SUBSCRIBE_JOB, { jobId });
      socketState.current.subscriptionIds.add(`job:${jobId}`);
    }

    // 매치 구독
    if (matchId) {
      const roomName = `match:${matchId}`;
      log("매치 구독", { matchId, roomName });
      socketState.current.joinRequestTime = Date.now();

      sock.emit(SOCKET_ACTIONS.JOIN_MATCH, { matchId, roomName });
      socketState.current.subscriptionIds.add(roomName);

      // 5초 후 구독 성공 여부 확인
      setTimeout(() => {
        if (
          socketState.current.lastEventReceived <
          socketState.current.joinRequestTime
        ) {
          log("매치 구독 후 이벤트 수신이 없음", {
            joinRequestTime: socketState.current.joinRequestTime,
            lastEventReceived: socketState.current.lastEventReceived,
            elapsed: Date.now() - socketState.current.joinRequestTime,
          });

          // 다시 구독 시도
          if (sock.connected && socket.isConnected) {
            log("매치 재구독 시도", { matchId });
            sock.emit(SOCKET_ACTIONS.JOIN_MATCH, { matchId });

            // 상태 요청
            setTimeout(() => {
              if (sock.connected && socket.isConnected) {
                log("매치 상태 재요청", { matchId });
                sock.emit(SOCKET_ACTIONS.REQUEST_STATUS, { matchId });
              }
            }, 500);
          }
        }
      }, 5000);
    }

    socketState.current.isSubscribed = true;
    log("구독 완료", {
      subscriptions: Array.from(socketState.current.subscriptionIds),
    });

    return true;
  }, [socket, jobId, matchId, log]);

  // 소켓 이벤트 핸들러들

  // 상태 업데이트 핸들러
  const handleStatusUpdate = useCallback(
    (data: { matchId: string } & MatchStatusUpdate) => {
      if (data.matchId !== matchId) return;

      socketState.current.lastEventReceived = Date.now();
      log("상태 업데이트", { status: data.status, message: data.message });
      setStatus(data.status);
      setMessage(data.message || STATUS_MESSAGES[data.status]);
      updateProgressByStatus(data.status);

      // 추가 정보 처리
      if (data.additionalInfo) {
        const { homeScore: newHomeScore, awayScore: newAwayScore } =
          data.additionalInfo;
        if (newHomeScore !== undefined) setHomeScore(newHomeScore);
        if (newAwayScore !== undefined) setAwayScore(newAwayScore);
      }

      // 매치 종료 처리
      if (data.status === MatchStatus.ENDED) {
        handleMatchComplete();
      }
    },
    [matchId, log, updateProgressByStatus, handleMatchComplete]
  );

  // 로그 업데이트 핸들러
  const handleLogUpdate = useCallback(
    (data: { matchId: string; log: MatchLog }) => {
      if (data.matchId !== matchId) return;

      socketState.current.lastEventReceived = Date.now();
      log("로그 수신", { minute: data.log.minute, desc: data.log.description });

      setLogs((prevLogs) => {
        // 중복 로그 체크
        const isExisting = prevLogs.some(
          (log) =>
            log.minute === data.log.minute &&
            log.description === data.log.description
        );

        if (isExisting) return prevLogs;

        // 새 로그 추가 및 정렬
        return [...prevLogs, data.log].sort((a, b) => a.minute - b.minute);
      });
    },
    [matchId, log]
  );

  // 모든 로그 한번에 받는 핸들러
  const handleAllLogs = useCallback(
    (data: { logs: MatchLog[] }) => {
      if (!Array.isArray(data.logs)) return;

      socketState.current.lastEventReceived = Date.now();
      log("전체 로그 수신", { count: data.logs.length });
      setLogs(data.logs.sort((a, b) => a.minute - b.minute));
    },
    [log]
  );

  // 최근 로그 처리 핸들러
  const handleRecentLogs = useCallback(
    (data: { matchId: string; logs: MatchLog[] }) => {
      if (data.matchId !== matchId || !Array.isArray(data.logs)) return;

      socketState.current.lastEventReceived = Date.now();
      log("최근 로그 수신", { count: data.logs.length });

      setLogs((prevLogs) => {
        // 기존 로그와 새 로그 병합하고 중복 제거
        const existingLogMap = new Map(
          prevLogs.map((log) => [`${log.minute}-${log.description}`, log])
        );

        data.logs.forEach((log) => {
          const key = `${log.minute}-${log.description}`;
          if (!existingLogMap.has(key)) {
            existingLogMap.set(key, log);
          }
        });

        // 병합된 로그 배열 생성 및 정렬
        return Array.from(existingLogMap.values()).sort(
          (a, b) => a.minute - b.minute
        );
      });
    },
    [matchId, log]
  );

  // 최근 상태 업데이트 처리 핸들러
  const handleRecentStatusUpdates = useCallback(
    (data: { matchId: string; updates: MatchStatusUpdate[] }) => {
      if (
        data.matchId !== matchId ||
        !Array.isArray(data.updates) ||
        data.updates.length === 0
      )
        return;

      socketState.current.lastEventReceived = Date.now();
      log("최근 상태 업데이트 수신", { count: data.updates.length });

      // 가장 최근 상태 업데이트 적용
      const latestUpdate = data.updates[data.updates.length - 1];
      setStatus(latestUpdate.status);
      setMessage(latestUpdate.message || STATUS_MESSAGES[latestUpdate.status]);
      updateProgressByStatus(latestUpdate.status);

      // 최신 추가 정보가 있으면 적용
      if (latestUpdate.additionalInfo) {
        const { homeScore: newHomeScore, awayScore: newAwayScore } =
          latestUpdate.additionalInfo;
        if (newHomeScore !== undefined) setHomeScore(newHomeScore);
        if (newAwayScore !== undefined) setAwayScore(newAwayScore);
      }
    },
    [matchId, log, updateProgressByStatus]
  );

  // 스코어 업데이트 핸들러
  const handleScoreUpdate = useCallback(
    (data: { matchId: string; homeScore: number; awayScore: number }) => {
      if (data.matchId !== matchId) return;

      socketState.current.lastEventReceived = Date.now();
      log("스코어 업데이트", { home: data.homeScore, away: data.awayScore });
      setHomeScore(data.homeScore);
      setAwayScore(data.awayScore);
    },
    [matchId, log]
  );

  // 매치 종료 핸들러
  const handleMatchEnd = useCallback(
    (data: { matchId: string }) => {
      if (data.matchId !== matchId) return;

      socketState.current.lastEventReceived = Date.now();
      log("매치 종료", { matchId });
      setStatus(MatchStatus.ENDED);
      setMessage(STATUS_MESSAGES[MatchStatus.ENDED]);
      updateProgressByStatus(MatchStatus.ENDED);
      handleMatchComplete();
    },
    [matchId, log, updateProgressByStatus, handleMatchComplete]
  );

  // 구독 응답 핸들러
  const handleJoinResponse = useCallback(
    (data: { status: string; message?: string; matchId?: string }) => {
      if (data.matchId !== matchId) return;

      socketState.current.lastEventReceived = Date.now();

      if (data.status === "success") {
        log("매치 구독 성공", { matchId });
        socketState.current.isSubscribed = true;

        // 구독 성공 후 상태 요청
        const sock = socket.socket;
        if (sock && matchId) {
          log("매치 상태 요청", { matchId });
          sock.emit(SOCKET_ACTIONS.REQUEST_STATUS, { matchId });
        }
      } else {
        log("매치 구독 실패", { matchId, message: data.message });
        socketState.current.isSubscribed = false;
      }
    },
    [matchId, socket, log]
  );

  // 작업 상태 업데이트 핸들러 수정
  const handleJobStatus = useCallback(
    (data: JobStatusData) => {
      if (data.jobId !== jobId) return;

      socketState.current.lastEventReceived = Date.now();

      if (data.status === "completed" && data.matchId) {
        log("작업 완료", { matchId: data.matchId });
        setMatchId(data.matchId);
      } else if (data.status === "failed" && data.error) {
        log("작업 실패", { error: data.error });
        setMessage(`오류 발생: ${data.error}`);
      } else if (data.detailStatus) {
        // 상세 상태가 있으면 해당 상태에 맞게 메시지와 진행률 업데이트
        log("작업 상세 상태 업데이트", {
          status: data.status,
          detailStatus: data.detailStatus,
          message: data.progressMessage,
        });

        // 메시지 업데이트
        if (data.progressMessage) {
          setMessage(data.progressMessage);
        } else {
          setMessage(STATUS_MESSAGES[data.detailStatus] || "처리 중...");
        }

        // 진행률 업데이트
        const newProgress = PROGRESS_BY_STATUS[data.detailStatus];
        if (newProgress && newProgress !== progress) {
          setProgress(newProgress);
        }
      }
    },
    [jobId, progress, log]
  );

  // 인증 성공 핸들러
  const handleAuthenticated = useCallback(
    (data: { userId: string }) => {
      log("인증 성공", { userId: data.userId });
      socketState.current.isAuthenticated = true;

      // 인증 후 자동 구독
      if ((matchId || jobId) && !socketState.current.isSubscribed) {
        subscribeToEvents();
      }
    },
    [jobId, matchId, subscribeToEvents, log]
  );

  // 인증 에러 핸들러
  const handleAuthError = useCallback(
    (error: { message: string }) => {
      log("인증 오류", { message: error.message });
      socketState.current.isAuthenticated = false;
      socketState.current.isSubscribed = false;
      setMessage(`연결 오류: ${error.message}`);
    },
    [log]
  );

  // 초기 매치 상태 로드 (API 호출)
  const loadMatchStatus = useCallback(async () => {
    if (!matchId) return;

    try {
      log("초기 매치 상태 로드 (API)", { matchId });
      const statusResponse = await getMatchStatus(matchId);
      if (!statusResponse?.status) return;

      // 상태 설정
      log("API에서 매치 상태 수신", { status: statusResponse.status });
      setStatus(statusResponse.status);
      setMessage(
        statusResponse.message || STATUS_MESSAGES[statusResponse.status]
      );
      updateProgressByStatus(statusResponse.status);

      // 매치가 이미 진행 중이거나 완료된 경우 세부 정보 로드
      if (
        [
          MatchStatus.STARTED,
          MatchStatus.IN_PROGRESS,
          MatchStatus.ENDED,
        ].includes(statusResponse.status)
      ) {
        try {
          const matchDetails = await getMatchById(matchId);
          if (matchDetails?.result) {
            log("매치 세부 정보 로드", {
              homeScore: matchDetails.result.homeScore,
              awayScore: matchDetails.result.awayScore,
            });
            setHomeScore(matchDetails.result.homeScore);
            setAwayScore(matchDetails.result.awayScore);

            if (statusResponse.status === MatchStatus.ENDED) {
              handleMatchComplete();
            }
          }
        } catch (error) {
          log("매치 세부 정보 로드 실패", { error });
        }
      }
    } catch (error) {
      log("매치 상태 로드 실패", { error });
    }
  }, [matchId, updateProgressByStatus, handleMatchComplete, log]);

  // 소켓 연결 관리 - 컴포넌트 마운트 시 초기 설정
  useEffect(() => {
    if (matchId && !jobId) return;

    // 소켓 객체가 없으면 연결 시도
    if (!socket.socket || !socket.isConnected) {
      log("소켓 연결 시도");
      socket.connect();
      return;
    }

    // 초기 진행률 설정
    setProgress(initialProgress);

    // 이벤트 핸들러 등록
    const sock = socket.socket;

    // 연결/인증 관련 핸들러
    sock.on(SOCKET_EVENTS.CONNECT, () => {
      log("소켓 연결됨");
      socketState.current.isConnected = true;
    });

    sock.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      log("소켓 연결 끊김", { reason });
      socketState.current.isConnected = false;
      socketState.current.isAuthenticated = false;
      socketState.current.isSubscribed = false;
    });

    sock.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
      log("소켓 연결 에러", { message: error.message });
      socketState.current.isConnected = false;
      socketState.current.connectionError = error;
    });

    sock.on(SOCKET_EVENTS.ERROR, handleAuthError);
    sock.on(SOCKET_EVENTS.AUTHENTICATED, handleAuthenticated);

    // 매치/작업 관련 이벤트 핸들러
    sock.on(SOCKET_EVENTS.JOIN_RESPONSE, handleJoinResponse);
    sock.on(SOCKET_EVENTS.RECENT_STATUS_UPDATES, handleRecentStatusUpdates);
    sock.on(SOCKET_EVENTS.RECENT_LOGS, handleRecentLogs);
    sock.on(SOCKET_EVENTS.JOB_STATUS, handleJobStatus);
    sock.on(SOCKET_EVENTS.JOB_COMPLETED, handleJobStatus);
    sock.on(SOCKET_EVENTS.STATUS_UPDATE, handleStatusUpdate);
    sock.on(SOCKET_EVENTS.LOG, handleLogUpdate);
    sock.on(SOCKET_EVENTS.ALL_LOGS, handleAllLogs);
    sock.on(SOCKET_EVENTS.SCORE_UPDATE, handleScoreUpdate);
    sock.on(SOCKET_EVENTS.MATCH_END, handleMatchEnd);

    // 컴포넌트 언마운트 시 정리
    return () => {
      log("이벤트 리스너 정리");

      sock.off(SOCKET_EVENTS.AUTHENTICATED, handleAuthenticated);
      sock.off(SOCKET_EVENTS.ERROR, handleAuthError);
      sock.off(SOCKET_EVENTS.JOIN_RESPONSE, handleJoinResponse);
      sock.off(SOCKET_EVENTS.RECENT_STATUS_UPDATES, handleRecentStatusUpdates);
      sock.off(SOCKET_EVENTS.RECENT_LOGS, handleRecentLogs);
      sock.off(SOCKET_EVENTS.JOB_STATUS, handleJobStatus);
      sock.off(SOCKET_EVENTS.JOB_COMPLETED, handleJobStatus);
      sock.off(SOCKET_EVENTS.STATUS_UPDATE, handleStatusUpdate);
      sock.off(SOCKET_EVENTS.LOG, handleLogUpdate);
      sock.off(SOCKET_EVENTS.ALL_LOGS, handleAllLogs);
      sock.off(SOCKET_EVENTS.SCORE_UPDATE, handleScoreUpdate);
      sock.off(SOCKET_EVENTS.MATCH_END, handleMatchEnd);

      // 구독 해제
      if (socketState.current.isSubscribed) {
        if (jobId) sock.emit(SOCKET_ACTIONS.UNSUBSCRIBE_JOB, { jobId });
        if (matchId) sock.emit(SOCKET_ACTIONS.LEAVE_MATCH, { matchId });
      }
    };
  }, [matchId, jobId, socket.isConnected]);

  // 소켓 연결 상태 정기 체크
  useEffect(() => {
    // 첫 마운트 시 API 호출
    if (matchId) {
      loadMatchStatus();
    }

    // 소켓이 연결되었고 인증되었지만 아직 구독되지 않았을 때 구독
    if (
      socket.isConnected &&
      socketState.current.isAuthenticated &&
      (matchId || jobId) &&
      !socketState.current.isSubscribed
    ) {
      log("소켓 연결됨, 구독 시작");
      subscribeToEvents();
    }

    // 소켓 연결 및 구독 상태 정기 체크
    const checkInterval = setInterval(() => {
      const isConnected = isSocketConnected();

      // 연결 상태가 변경된 경우
      if (isConnected !== socketState.current.isConnected) {
        log("소켓 연결 상태 변화", {
          before: socketState.current.isConnected,
          after: isConnected,
        });

        socketState.current.isConnected = Boolean(isConnected);

        // 연결 끊김 → 연결됨으로 변경된 경우 재구독
        if (
          isConnected &&
          !socketState.current.isSubscribed &&
          (matchId || jobId)
        ) {
          log("소켓 재연결 감지, 구독 시도");
          subscribeToEvents();
        }
      }

      // 연결되었으나 아직 구독되지 않은 경우 정기 구독 시도
      if (
        isConnected &&
        !socketState.current.isSubscribed &&
        (matchId || jobId) &&
        socketState.current.isAuthenticated
      ) {
        log("연결됨 & 미구독 상태 감지, 구독 재시도");
        subscribeToEvents();
      }

      // 구독된 상태이지만 오랫동안 이벤트 수신이 없는 경우 상태 요청
      if (isConnected && socketState.current.isSubscribed && matchId) {
        const now = Date.now();
        const noEventTime = now - socketState.current.lastEventReceived;

        // 10초 이상 이벤트가 없으면 상태 재요청
        if (noEventTime > 10000) {
          log("장시간 이벤트 수신 없음, 상태 재요청", {
            elapsed: noEventTime,
            lastEvent: new Date(
              socketState.current.lastEventReceived
            ).toISOString(),
          });

          const sock = socket.socket;
          if (sock) {
            sock.emit(SOCKET_ACTIONS.REQUEST_STATUS, { matchId });
            socketState.current.lastEventReceived = now; // 요청 시간 갱신
          }
        }
      }
    }, 3000); // 3초마다 체크

    return () => clearInterval(checkInterval);
  }, [
    socket,
    matchId,
    jobId,
    isSocketConnected,
    subscribeToEvents,
    loadMatchStatus,
    log,
  ]);

  // initialMatchId 변경 감지하여 내부 상태 업데이트
  useEffect(() => {
    if (initialMatchId && initialMatchId !== matchId) {
      log("초기 매치 ID 변경 감지", { newId: initialMatchId, prevId: matchId });
      setMatchId(initialMatchId);
      setProgress(PROGRESS_BY_STATUS[JobDetailStatus.PREPARING_STADIUM]);

      // 새 매치 ID로 재구독 필요
      socketState.current.isSubscribed = false;

      // 소켓 구독 업데이트
      if (socket.isConnected && socketState.current.isAuthenticated) {
        // 약간의 지연 후 구독 시도 (이전 구독 해제 시간 확보)
        setTimeout(() => {
          subscribeToEvents();
        }, 500);
      }
    }
  }, [initialMatchId, matchId, socket.isConnected, subscribeToEvents, log]);

  // 연결 상태에 따른 현재 상태 메시지
  const connectionStateMessage = useMemo(() => {
    if (!socket.isConnected || !socketState.current.isConnected) {
      return "서버에 연결 중...";
    }

    if (!socketState.current.isAuthenticated) {
      return "사용자 인증 중...";
    }

    if (!socketState.current.isSubscribed && (matchId || jobId)) {
      return "매치 데이터 구독 중...";
    }

    return message;
  }, [message, socket.isConnected, jobId, matchId]);

  return (
    <LoaderContainer>
      <LoadingText>AI 축구 시뮬레이션</LoadingText>
      <StatusMessage>{connectionStateMessage}</StatusMessage>

      <LoadingBar>
        <LoadingProgress width={progress} />
      </LoadingBar>

      {showScoreDisplay && (
        <ScoreDisplay>
          <TeamName>홈팀</TeamName>
          <Score>{homeScore}</Score>
          <Score>{awayScore}</Score>
          <TeamName>원정팀</TeamName>
        </ScoreDisplay>
      )}

      {logs.length > 0 && (
        <LogsContainer>
          {logs.map((log, index) => (
            <LogEntry key={index}>
              <LogTime>{log.minute}'</LogTime>
              <LogMessage>{log.description}</LogMessage>
            </LogEntry>
          ))}
        </LogsContainer>
      )}
    </LoaderContainer>
  );
};

export default React.memo(AIStyleLoader);
