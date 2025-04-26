import React, { useState, useEffect, useCallback, useMemo } from "react";

import { useSocket } from "../../hooks/useSocket";
import { MatchStatus } from "../../types/global.d";
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

// 로그 헬퍼 함수
const logLoader = (action: string, data?: any) => {
  console.log(`[AIStyleLoader] ${action}`, data || "");
};

// 각 매치 상태에 따른 메시지 매핑
const STATUS_MESSAGES = {
  [MatchStatus.MATCHMAKING]: "매치메이킹 중입니다...",
  [MatchStatus.OPPONENT_FOUND]: "대결 상대를 찾았습니다!",
  [MatchStatus.PREPARING_STADIUM]: "경기장을 준비하고 있습니다...",
  [MatchStatus.PLAYERS_ENTERING]: "선수들이 입장하고 있습니다...",
  [MatchStatus.MATCH_STARTED]: "경기가 시작되었습니다!",
  [MatchStatus.SIMULATION_ACTIVE]: "AI가 시뮬레이션 중입니다...",
  [MatchStatus.MATCH_ENDED]: "경기가 종료되었습니다.",
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

const AIStyleLoader: React.FC<AIStyleLoaderProps> = ({
  jobId,
  matchId: initialMatchId,
  onMatchComplete,
}) => {
  const socket = useSocket();

  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<MatchStatus>(MatchStatus.MATCHMAKING);
  const [message, setMessage] = useState<string>(
    STATUS_MESSAGES[MatchStatus.MATCHMAKING]
  );
  const [matchId, setMatchId] = useState<string | undefined>(initialMatchId);
  const [logs, setLogs] = useState<MatchLog[]>([]);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [socketFallback, setSocketFallback] = useState<boolean>(false);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);

  logLoader("컴포넌트 초기화", { jobId, matchId: initialMatchId });

  // 메모이제이션된 상수 값을 사용
  const initialProgress = useMemo(() => {
    // 매치 상태에 따른 초기 진행률 계산
    if (initialMatchId) return 40; // 이미 매치가 생성된 경우
    if (jobId) return 10; // 작업 ID만 있는 경우
    return 0;
  }, [initialMatchId, jobId]);

  // 컴포넌트 마운트 시 초기 진행률 설정
  useEffect(() => {
    logLoader("초기 진행률 설정", { progress: initialProgress });
    setProgress(initialProgress);
  }, [initialProgress]);

  // 매치 상태에 따른 진행률 계산을 useCallback으로 최적화
  const updateProgressByStatus = useCallback(
    (newStatus: MatchStatus) => {
      let newProgress = 0;
      switch (newStatus) {
        case MatchStatus.MATCHMAKING:
          newProgress = 10;
          break;
        case MatchStatus.OPPONENT_FOUND:
          newProgress = 25;
          break;
        case MatchStatus.PREPARING_STADIUM:
          newProgress = 40;
          break;
        case MatchStatus.PLAYERS_ENTERING:
          newProgress = 55;
          break;
        case MatchStatus.MATCH_STARTED:
          newProgress = 70;
          break;
        case MatchStatus.SIMULATION_ACTIVE:
          newProgress = 85;
          break;
        case MatchStatus.MATCH_ENDED:
          newProgress = 100;
          setIsComplete(true);
          break;
        default:
          newProgress = progress || 0;
      }

      logLoader("진행률 업데이트", {
        status: newStatus,
        oldProgress: progress,
        newProgress,
      });
      setProgress(newProgress);
    },
    [progress]
  );

  // 상태 업데이트 함수를 메모이제이션하여 불필요한 재생성 방지
  const handleStatusUpdate = useCallback(
    (data: { matchId: string } & MatchStatusUpdate) => {
      logLoader("상태 업데이트 수신", data);

      if (data.matchId === matchId) {
        logLoader("매치 ID 일치, 상태 업데이트 적용", {
          matchId: data.matchId,
          status: data.status,
          message: data.message || STATUS_MESSAGES[data.status],
        });

        setStatus(data.status);
        setMessage(data.message || STATUS_MESSAGES[data.status]);
        updateProgressByStatus(data.status);

        // 추가 정보가 있으면 스코어 업데이트
        if (data.additionalInfo) {
          const { homeScore: newHomeScore, awayScore: newAwayScore } =
            data.additionalInfo;

          logLoader("스코어 업데이트", {
            homeScore: newHomeScore,
            awayScore: newAwayScore,
          });

          if (newHomeScore !== undefined) setHomeScore(newHomeScore);
          if (newAwayScore !== undefined) setAwayScore(newAwayScore);
        }

        // 매치가 종료되면 완료 콜백 호출
        if (
          data.status === MatchStatus.MATCH_ENDED &&
          onMatchComplete &&
          matchId
        ) {
          logLoader("매치 종료 이벤트 발생", { matchId });
          onMatchComplete(matchId);
        }
      } else {
        logLoader("매치 ID 불일치, 업데이트 무시", {
          received: data.matchId,
          current: matchId,
        });
      }
    },
    [matchId, onMatchComplete, updateProgressByStatus]
  );

  // 로그 업데이트 함수를 메모이제이션
  const handleLogUpdate = useCallback(
    (data: { matchId: string; log: MatchLog }) => {
      logLoader("로그 업데이트 수신", { matchId: data.matchId, log: data.log });
      if (data.matchId === matchId) {
        setLogs((prevLogs) => {
          // 이미 같은 로그가 있는지 확인해서 중복 방지
          const existingLogIndex = prevLogs.findIndex(
            (log) =>
              log.minute === data.log.minute &&
              log.description === data.log.description
          );

          if (existingLogIndex >= 0) {
            logLoader("중복 로그 발견, 무시", { logIndex: existingLogIndex });
            return prevLogs;
          }

          const newLogs = [...prevLogs, data.log].sort(
            (a, b) => a.minute - b.minute
          );
          logLoader("로그 업데이트 적용", { totalLogs: newLogs.length });
          return newLogs;
        });
      }
    },
    [matchId]
  );

  // 모든 로그 한번에 받는 핸들러
  const handleAllLogs = useCallback((data: { logs: MatchLog[] }) => {
    if (data.logs && Array.isArray(data.logs)) {
      logLoader("전체 로그 수신", { count: data.logs.length });
      setLogs(data.logs.sort((a, b) => a.minute - b.minute));
    } else {
      logLoader("잘못된 로그 데이터 수신", data);
    }
  }, []);

  // 스코어 업데이트 핸들러
  const handleScoreUpdate = useCallback(
    (data: { matchId: string; homeScore: number; awayScore: number }) => {
      logLoader("스코어 업데이트 이벤트", data);
      if (data.matchId === matchId) {
        logLoader("스코어 업데이트 적용", {
          homeScore: data.homeScore,
          awayScore: data.awayScore,
        });
        setHomeScore(data.homeScore);
        setAwayScore(data.awayScore);
      }
    },
    [matchId]
  );

  // 매치 종료 핸들러
  const handleMatchEnd = useCallback(
    (data: { matchId: string }) => {
      logLoader("매치 종료 이벤트", { matchId: data.matchId });
      if (data.matchId === matchId) {
        logLoader("매치 종료 처리", { matchId });
        setStatus(MatchStatus.MATCH_ENDED);
        setMessage(STATUS_MESSAGES[MatchStatus.MATCH_ENDED]);
        setProgress(100);
        setIsComplete(true);

        if (onMatchComplete && matchId) {
          logLoader("매치 완료 콜백 호출", { matchId });
          onMatchComplete(matchId);
        }
      }
    },
    [matchId, onMatchComplete]
  );

  // 작업 상태 업데이트 핸들러
  const handleJobStatus = useCallback(
    (data: any) => {
      logLoader("작업 상태 업데이트", data);
      if (data.jobId === jobId) {
        if (data.status === "completed" && data.matchId) {
          logLoader("작업 완료, 매치 ID 설정", {
            jobId,
            matchId: data.matchId,
          });
          setMatchId(data.matchId);
        } else if (data.status === "failed" && data.error) {
          logLoader("작업 실패", { jobId, error: data.error });
          setMessage(`오류 발생: ${data.error}`);
        }
      }
    },
    [jobId]
  );

  // 초기 매치 상태 로드 함수
  const loadInitialMatchStatus = useCallback(async () => {
    if (!matchId) return;

    try {
      logLoader("초기 매치 상태 로드 시작", { matchId });
      const statusResponse = await getMatchStatus(matchId);

      // 응답이 유효한지 확인
      if (statusResponse && statusResponse.status) {
        logLoader("초기 매치 상태 로드 성공", statusResponse);
        setStatus(statusResponse.status);
        setMessage(
          statusResponse.message || STATUS_MESSAGES[statusResponse.status]
        );
        updateProgressByStatus(statusResponse.status);

        // 매치 상태가 이미 진행 중이거나 완료된 경우 추가 정보 로드
        if (
          statusResponse.status === MatchStatus.MATCH_STARTED ||
          statusResponse.status === MatchStatus.SIMULATION_ACTIVE ||
          statusResponse.status === MatchStatus.MATCH_ENDED
        ) {
          try {
            logLoader("매치 세부 정보 로드 시작", { matchId });
            const matchDetails = await getMatchById(matchId);
            if (matchDetails && matchDetails.result) {
              logLoader("매치 세부 정보 로드 성공", {
                homeScore: matchDetails.result.homeScore,
                awayScore: matchDetails.result.awayScore,
                winner: matchDetails.result.winner,
              });
              setHomeScore(matchDetails.result.homeScore);
              setAwayScore(matchDetails.result.awayScore);

              if (statusResponse.status === MatchStatus.MATCH_ENDED) {
                logLoader("매치 종료 상태 처리", { matchId });
                setIsComplete(true);
                if (onMatchComplete) {
                  logLoader("매치 완료 콜백 호출", { matchId });
                  onMatchComplete(matchId);
                }
              }
            }
          } catch (error) {
            logLoader("매치 세부 정보 로드 실패", { matchId, error });
          }
        }
      }
    } catch (error) {
      logLoader("초기 매치 상태 로드 실패", { matchId, error });
    }
  }, [matchId, updateProgressByStatus, onMatchComplete]);

  // 소켓 연결 실패 시 폴링으로 대체하는 기능
  const startPollingFallback = useCallback(() => {
    if (pollingInterval || !matchId) return;

    logLoader("폴링 모드 시작", { matchId });
    setSocketFallback(true);

    const interval = window.setInterval(async () => {
      try {
        logLoader("폴링으로 매치 상태 조회", { matchId });
        const statusResponse = await getMatchStatus(matchId);
        logLoader("폴링 응답", {
          matchId,
          status: statusResponse.status,
          message: statusResponse.message,
        });

        if (statusResponse && statusResponse.status) {
          setStatus(statusResponse.status);
          setMessage(
            statusResponse.message || STATUS_MESSAGES[statusResponse.status]
          );
          updateProgressByStatus(statusResponse.status);

          if (
            statusResponse.status === MatchStatus.MATCH_ENDED &&
            onMatchComplete
          ) {
            logLoader("폴링으로 매치 종료 감지", { matchId });
            clearInterval(interval);
            setPollingInterval(null);
            onMatchComplete(matchId);
          }
        }
      } catch (error) {
        logLoader("폴링 오류", { matchId, error });
      }
    }, 3000); // 3초마다 폴링

    setPollingInterval(interval as unknown as number);

    return () => {
      logLoader("폴링 정리", { matchId });
      clearInterval(interval);
      setPollingInterval(null);
    };
  }, [matchId, pollingInterval, updateProgressByStatus, onMatchComplete]);

  // 소켓 연결 상태 검사 및 재연결
  useEffect(() => {
    // 타이머 관리를 위한 변수
    let connectionTimeout: ReturnType<typeof setTimeout> | null = null;
    const sock = socket.socket;
    if (!sock) {
      logLoader("소켓 연결 없음", { matchId });
      // 소켓이 없으면 폴링 모드로 전환
      if (matchId) {
        startPollingFallback();
      }
      return () => {
        // 폴링 모드에서 필요한 정리 작업은 startPollingFallback 함수 내에서 처리됨
      };
    }

    // 소켓 상태 확인
    logLoader("소켓 연결 상태", { connected: socket.isConnected, matchId });

    // 소켓 연결/재연결 이벤트 리스너
    const handleConnect = () => {
      logLoader("소켓 연결됨");

      // 타임아웃이 설정되어 있으면 정리
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }

      // 연결 후 필요한 구독 갱신
      if (matchId) {
        logLoader("매치 구독", { matchId });
        sock.emit("match:join", { matchId });
      }

      if (jobId) {
        logLoader("작업 구독", { jobId });
        sock.emit("match:subscribeJob", { jobId });
      }
    };

    // 이벤트 리스너 등록
    sock.on("connect", handleConnect);
    sock.on("reconnect", handleConnect);

    // 연결이 끊어졌을 때 처리
    if (!socket.isConnected) {
      logLoader("소켓 연결 시도", { matchId });
      socket.reconnect(); // 소켓 연결 시도

      // 연결 시도 후 5초 내에 연결이 안되면 폴링으로 전환
      connectionTimeout = setTimeout(() => {
        logLoader("소켓 연결 시간 초과", { matchId });
        if (matchId && !socket.isConnected) {
          startPollingFallback();
        }
      }, 5000);
    }

    // 컴포넌트 언마운트 또는 의존성 변경 시 모든 정리 작업 수행
    return () => {
      logLoader("소켓 이벤트 리스너 및 타이머 정리");
      sock.off("connect", handleConnect);
      sock.off("reconnect", handleConnect);

      // 타이머가 설정되어 있으면 정리
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
    };
  }, [socket, matchId, jobId, startPollingFallback]);

  // 소켓 이벤트 구독 설정
  useEffect(() => {
    const sock = socket.socket;
    if (!sock) return;

    console.log("소켓 이벤트 리스너 등록");

    // 이벤트 등록 전 이전 이벤트 구독 해제
    const cleanupEvents = () => {
      console.log("소켓 이벤트 리스너 정리");
      sock.off("match:jobStatus");
      sock.off("match:jobCompleted");
      sock.off("match:statusUpdate");
      sock.off("match:log");
      sock.off("match:allLogs");
      sock.off("match:scoreUpdate");
      sock.off("match:end");

      // 구독 해제
      if (jobId) {
        sock.emit("match:unsubscribeJob", { jobId });
      }
      if (matchId) {
        sock.emit("match:leave", { matchId });
      }
    };

    // 작업 ID가 있으면 작업 업데이트 구독
    if (jobId) {
      // 작업 구독
      console.log(`작업 구독: ${jobId}`);
      sock.emit("match:subscribeJob", { jobId });
      sock.on("match:jobStatus", handleJobStatus);
      sock.on("match:jobCompleted", handleJobStatus);
    }

    // 매치 ID가 있으면 매치 업데이트 구독
    if (matchId) {
      // 매치 구독
      console.log(`매치 구독: ${matchId}`);
      sock.emit("match:join", { matchId });

      // 상태 업데이트 이벤트 리스너
      sock.on("match:statusUpdate", (data) => {
        console.log("match:statusUpdate 이벤트 수신:", data);
        handleStatusUpdate(data);
      });

      sock.on("match:log", (data) => {
        console.log("match:log 이벤트 수신:", data);
        handleLogUpdate(data);
      });

      sock.on("match:allLogs", (data) => {
        console.log("match:allLogs 이벤트 수신:", data);
        handleAllLogs(data);
      });

      sock.on("match:scoreUpdate", (data) => {
        console.log("match:scoreUpdate 이벤트 수신:", data);
        handleScoreUpdate(data);
      });

      sock.on("match:end", (data) => {
        console.log("match:end 이벤트 수신:", data);
        handleMatchEnd(data);
      });

      // 서버에 현재 상태 요청
      sock.emit("match:requestStatus", { matchId });
    }

    // 컴포넌트 언마운트 시 이벤트 정리
    return cleanupEvents;
  }, [
    socket,
    jobId,
    matchId,
    handleJobStatus,
    handleStatusUpdate,
    handleLogUpdate,
    handleAllLogs,
    handleScoreUpdate,
    handleMatchEnd,
  ]);

  // 초기 매치 상태 로드
  useEffect(() => {
    if (matchId) {
      loadInitialMatchStatus();
    }
  }, [matchId, loadInitialMatchStatus]);

  // 컴포넌트 unmount 시 폴링 정리
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // 점수 표시 여부를 useMemo로 최적화
  const showScoreDisplay = useMemo(() => {
    return (
      status === MatchStatus.MATCH_STARTED ||
      status === MatchStatus.SIMULATION_ACTIVE ||
      status === MatchStatus.MATCH_ENDED
    );
  }, [status]);

  // initialMatchId 변경을 감지하여 내부 상태 업데이트
  useEffect(() => {
    // initialMatchId가 변경되고 현재 matchId와 다르면 업데이트
    if (initialMatchId && initialMatchId !== matchId) {
      console.log(
        `초기 매치 ID 변경 감지: ${initialMatchId} (이전: ${matchId})`
      );
      setMatchId(initialMatchId);

      // 폴링 중인 경우 재시작
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }

      // 상태 초기화
      setIsComplete(false);
      setProgress(40); // 매치 ID가 있는 경우의 초기 진행률
    }
  }, [initialMatchId, matchId, pollingInterval]);

  return (
    <LoaderContainer>
      <LoadingText>AI 축구 시뮬레이션</LoadingText>
      <StatusMessage>{message}</StatusMessage>

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

// React.memo를 사용하여 불필요한 리렌더링 방지
export default React.memo(AIStyleLoader);
