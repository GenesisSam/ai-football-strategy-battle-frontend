import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
  ReactNode,
} from "react";
import {
  Match,
  MatchEvent,
  MatchStatistics,
  MatchAnalysis,
  MatchJob,
  createQuickMatch,
  createGameMatch,
  checkMatchJobStatus,
  getMatchById,
  getUserMatches,
  getMatchEvents,
  getMatchStatistics,
  getMatchAnalysis,
} from "../api/match";
import { useAuth } from "./AuthContext";
import { useSquad } from "./SquadContext";
import socketClient, {
  SocketEvents,
  MatchEventMessage,
  MatchStatusChange,
  MatchmakingStatus,
  MatchJobStatus,
  MatchJobCompleted,
} from "../api/socket";

// 매치 컨텍스트 인터페이스
interface MatchContextType {
  matches: Match[];
  currentMatch: Match | null;
  matchEvents: MatchEvent[];
  matchStatistics: MatchStatistics | null;
  matchAnalysis: MatchAnalysis | null;
  isLoading: boolean;
  error: string | null;
  matchmakingStatus: MatchmakingStatus | null;
  matchJobStatus: MatchJobStatus | null;
  // 매치 관련 액션
  fetchUserMatches: () => Promise<void>;
  fetchMatchById: (id: string) => Promise<Match | null>;
  startQuickMatch: (squadId?: string) => Promise<string | null>;
  startGameMatch: (squadId?: string) => Promise<string | null>;
  fetchMatchEvents: (matchId: string) => Promise<MatchEvent[]>;
  fetchMatchStatistics: (matchId: string) => Promise<MatchStatistics | null>;
  fetchMatchAnalysis: (matchId: string) => Promise<MatchAnalysis | null>;
  // 매치메이킹 관련
  cancelMatchmaking: () => void;
  // 매치 작업 관련
  subscribeToMatchJob: (jobId: string) => Promise<boolean>;
  unsubscribeFromMatchJob: (jobId: string) => void;
  checkMatchJobStatus: (jobId: string) => Promise<MatchJob | null>;
  startPollingMatchJob: (
    jobId: string,
    interval?: number,
    maxAttempts?: number
  ) => void;
  stopPollingMatchJob: () => void;
}

// 초기 컨텍스트 값
const initialMatchContext: MatchContextType = {
  matches: [],
  currentMatch: null,
  matchEvents: [],
  matchStatistics: null,
  matchAnalysis: null,
  isLoading: false,
  error: null,
  matchmakingStatus: null,
  matchJobStatus: null,
  // 매치 관련 액션
  fetchUserMatches: async () => {},
  fetchMatchById: async () => null,
  startQuickMatch: async () => null,
  startGameMatch: async () => null,
  fetchMatchEvents: async () => [],
  fetchMatchStatistics: async () => null,
  fetchMatchAnalysis: async () => null,
  // 매치메이킹 관련
  cancelMatchmaking: () => {},
  // 매치 작업 관련
  subscribeToMatchJob: async () => false,
  unsubscribeFromMatchJob: () => {},
  checkMatchJobStatus: async () => null,
  startPollingMatchJob: () => {},
  stopPollingMatchJob: () => {},
};

// 매치 컨텍스트 생성
export const MatchContext =
  createContext<MatchContextType>(initialMatchContext);

// 매치 컨텍스트 프로바이더 인터페이스
interface MatchProviderProps {
  children: ReactNode;
}

// 이벤트 핸들러 타입
type MatchEventHandler = (message: MatchEventMessage) => void;
type MatchStatusChangeHandler = (change: MatchStatusChange) => void;
type MatchmakingStatusHandler = (status: MatchmakingStatus) => void;
type MatchJobStatusHandler = (status: MatchJobStatus) => void;
type MatchJobCompletedHandler = (data: MatchJobCompleted) => void;

// 매치 컨텍스트 프로바이더 컴포넌트
export const MatchProvider: React.FC<MatchProviderProps> = ({ children }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);
  const [matchStatistics, setMatchStatistics] =
    useState<MatchStatistics | null>(null);
  const [matchAnalysis, setMatchAnalysis] = useState<MatchAnalysis | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [matchmakingStatus, setMatchmakingStatus] =
    useState<MatchmakingStatus | null>(null);
  const [matchJobStatus, setMatchJobStatus] = useState<MatchJobStatus | null>(
    null
  );
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  const { isAuthenticated, user } = useAuth();
  const { activeSquad } = useSquad();

  // 폴링 중단 함수를 최상단에 선언
  const stopPollingMatchJob = useCallback((): void => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  // 사용자 매치 목록 조회 함수를 상단에 선언
  const fetchUserMatches = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const matchList = await getUserMatches();
      setMatches(matchList);
    } catch (err) {
      console.error("Error fetching user matches:", err);
      setError("매치 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // 매치 상세 정보 조회 - useCallback 최적화
  const fetchMatchById = useCallback(
    async (id: string): Promise<Match | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const match = await getMatchById(id);
        setCurrentMatch(match);
        return match;
      } catch (err) {
        console.error(`Error fetching match ${id}:`, err);
        setError("매치 정보를 불러오는 중 오류가 발생했습니다.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 매치메이킹 상태 처리 - useCallback 최적화
  const handleMatchmakingStatus = useCallback(
    (status: MatchmakingStatus) => {
      setMatchmakingStatus(status);

      // 매치가 성공적으로 매칭된 경우
      if (status.status === "matched" && status.matchId) {
        fetchMatchById(status.matchId).catch((err) => {
          console.error("매치 데이터 로드 중 오류:", err);
        });
      }
    },
    [fetchMatchById]
  );

  // 매치 작업 상태 처리 - useCallback 최적화
  const handleMatchJobStatus = useCallback(
    (status: MatchJobStatus) => {
      setMatchJobStatus((prev) => {
        // 이미 동일한 상태인 경우 불필요한 리렌더링 방지
        if (
          prev &&
          prev.jobId === status.jobId &&
          prev.status === status.status
        ) {
          return prev;
        }
        return status;
      });

      console.log("매치 작업 상태 업데이트:", status);

      // 작업이 완료되고 매치 ID가 있는 경우 매치 데이터 로드
      if (status.status === "completed" && status.matchId) {
        fetchMatchById(status.matchId).catch((err) => {
          console.error("매치 데이터 로드 중 오류:", err);
        });
      }
    },
    [fetchMatchById]
  );

  // 매치 작업 완료 처리 - useCallback 최적화
  const handleMatchJobCompleted = useCallback(
    (data: MatchJobCompleted) => {
      console.log("매치 작업 완료:", data);

      // 매치 작업 상태 업데이트
      setMatchJobStatus({
        jobId: data.jobId,
        status: "completed",
        matchId: data.matchId,
      });

      // 매치 데이터 로드
      fetchMatchById(data.matchId).catch((err) => {
        console.error("매치 데이터 로드 중 오류:", err);
      });
    },
    [fetchMatchById]
  );

  // 매치 이벤트 처리 - useCallback 최적화
  const handleMatchEvent = useCallback(
    (message: MatchEventMessage) => {
      if (currentMatch && message.matchId === currentMatch.id) {
        setMatchEvents((prevEvents) => [...prevEvents, message.event]);

        // 스코어가 포함된 이벤트인 경우 현재 매치 정보에 스코어 업데이트
        if (message.event.currentScore) {
          setCurrentMatch((prev) =>
            prev ? { ...prev, score: message.event.currentScore } : null
          );
        }
      }
    },
    [currentMatch]
  );

  // 매치 상태 변경 처리 - useCallback 최적화
  const handleMatchStatusChange = useCallback(
    (change: MatchStatusChange) => {
      if (currentMatch && change.matchId === currentMatch.id) {
        setCurrentMatch((prev) =>
          prev ? { ...prev, status: change.status } : null
        );

        // 매치가 완료된 경우 통계 및 분석 데이터 조회
        if (change.status === "completed") {
          fetchMatchStatistics(change.matchId).catch((err) => {
            console.error("매치 통계 로드 중 오류:", err);
          });

          fetchMatchAnalysis(change.matchId).catch((err) => {
            console.error("매치 분석 로드 중 오류:", err);
          });
        }
      }
    },
    [currentMatch]
  );

  // 매치 이벤트 조회 - useCallback 최적화
  const fetchMatchEvents = useCallback(
    async (matchId: string): Promise<MatchEvent[]> => {
      try {
        setIsLoading(true);
        setError(null);
        const events = await getMatchEvents(matchId);
        setMatchEvents(events);
        return events;
      } catch (err) {
        console.error(`Error fetching match events for ${matchId}:`, err);
        setError("매치 이벤트를 불러오는 중 오류가 발생했습니다.");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 매치 통계 조회 - useCallback 최적화
  const fetchMatchStatistics = useCallback(
    async (matchId: string): Promise<MatchStatistics | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const statistics = await getMatchStatistics(matchId);
        setMatchStatistics(statistics);
        return statistics;
      } catch (err) {
        console.error(`Error fetching match statistics for ${matchId}:`, err);
        setError("매치 통계를 불러오는 중 오류가 발생했습니다.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 매치 분석 조회 - useCallback 최적화
  const fetchMatchAnalysis = useCallback(
    async (matchId: string): Promise<MatchAnalysis | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const analysis = await getMatchAnalysis(matchId);
        setMatchAnalysis(analysis);
        return analysis;
      } catch (err) {
        console.error(`Error fetching match analysis for ${matchId}:`, err);
        setError("매치 분석을 불러오는 중 오류가 발생했습니다.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 매치 작업 상태 확인 - useCallback 최적화
  const checkMatchJobStatusFn = useCallback(
    async (jobId: string): Promise<MatchJob | null> => {
      try {
        setIsLoading(true);
        const status = await checkMatchJobStatus(jobId);

        // 작업 상태 업데이트
        setMatchJobStatus({
          jobId: status.jobId,
          status: status.status,
          matchId: status.matchId,
          error: status.error,
        });

        return status;
      } catch (err) {
        console.error(`Error checking match job status (${jobId}):`, err);
        setError("매치 작업 상태 확인 중 오류가 발생했습니다.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // WebSocket이 실패할 경우를 대비한 폴링 시작 - useCallback 최적화
  const startPollingMatchJob = useCallback(
    (
      jobId: string,
      interval: number = 3000,
      maxAttempts: number = 60
    ): void => {
      // 이전 폴링 중단
      stopPollingMatchJob();

      let attempts = 0;

      const poll = async () => {
        if (attempts >= maxAttempts) {
          setError("매치 작업 폴링 시간이 초과되었습니다.");
          stopPollingMatchJob();
          return;
        }

        try {
          const status = await checkMatchJobStatusFn(jobId);

          if (status?.status === "completed" && status.matchId) {
            // 매치 데이터 로드
            await fetchMatchById(status.matchId);
            stopPollingMatchJob();
            return;
          } else if (status?.status === "failed") {
            setError(`매치 작업 실패: ${status.error || "알 수 없는 오류"}`);
            stopPollingMatchJob();
            return;
          }

          attempts++;
        } catch (err) {
          console.error("폴링 중 오류:", err);
          attempts++;
        }
      };

      const intervalId = setInterval(poll, interval);
      setPollingInterval(intervalId);
    },
    [checkMatchJobStatusFn, fetchMatchById, stopPollingMatchJob]
  );

  // 매치 작업 상태 구독 - useCallback 최적화
  const subscribeToMatchJob = useCallback(
    async (jobId: string): Promise<boolean> => {
      try {
        // 연결 상태 확인 후 필요시에만 연결
        if (!socketClient.isConnected()) {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("인증 토큰을 찾을 수 없습니다.");
          }
          // 변경된 비동기 연결 메서드 사용
          const connected = await socketClient.connect(token);
          if (!connected) {
            console.error("소켓 연결 실패");
            return false;
          }
        }

        // 작업 구독
        const success = await socketClient.subscribeToJobStatus(jobId);
        if (!success) {
          setError("매치 작업 구독에 실패했습니다.");
          return false;
        }
        return true;
      } catch (err) {
        console.error("Error subscribing to match job:", err);
        setError("매치 작업 구독 중 오류가 발생했습니다.");
        return false;
      }
    },
    []
  );

  // 매치 작업 구독 취소 - useCallback 최적화
  const unsubscribeFromMatchJob = useCallback((jobId: string): void => {
    try {
      socketClient.unsubscribeFromJobStatus(jobId);
    } catch (err) {
      console.error("Error unsubscribing from match job:", err);
    }
  }, []);

  // AI 상대와의 빠른 매치 시작 - useCallback 최적화
  const startQuickMatch = useCallback(
    async (squadId?: string): Promise<string | null> => {
      try {
        setIsLoading(true);
        setError(null);

        // 스쿼드 ID가 제공되지 않은 경우 활성 스쿼드 사용
        const targetSquadId = squadId || activeSquad?._id;

        if (!targetSquadId) {
          setError(
            "활성화된 스쿼드가 없습니다. 먼저 스쿼드를 생성하고 활성화해주세요."
          );
          return null;
        }

        const match = await createQuickMatch(targetSquadId);
        setCurrentMatch(match);

        // 매치 목록 갱신
        await fetchUserMatches();

        return match.id;
      } catch (err) {
        console.error("Error starting quick match:", err);
        setError("빠른 매치를 시작하는 중 오류가 발생했습니다.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [activeSquad, fetchUserMatches]
  );

  // 다른 사용자와의 매치 시작 (매치메이킹) - useCallback 최적화
  const startGameMatch = useCallback(
    async (squadId?: string): Promise<string | null> => {
      try {
        setIsLoading(true);
        setError(null);
        setMatchmakingStatus({ status: "searching" });

        // 스쿼드 ID가 제공되지 않은 경우 활성 스쿼드 사용
        const targetSquadId = squadId || activeSquad?._id;

        if (!targetSquadId) {
          setError(
            "활성화된 스쿼드가 없습니다. 먼저 스쿼드를 생성하고 활성화해주세요."
          );
          setMatchmakingStatus(null);
          return null;
        }

        // 비동기 매치 생성 요청
        const response = await createGameMatch(targetSquadId);
        const { jobId } = response;

        // 작업 구독
        await subscribeToMatchJob(jobId);

        return jobId;
      } catch (err) {
        console.error("Error starting game match:", err);
        setError("매치메이킹을 시작하는 중 오류가 발생했습니다.");
        setMatchmakingStatus(null);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [activeSquad, subscribeToMatchJob]
  );

  // 매치메이킹 취소 - useCallback 최적화
  const cancelMatchmaking = useCallback(() => {
    // 실제로는 서버에 매치메이킹 취소 요청을 보내야 함
    // 여기서는 상태만 초기화
    setMatchmakingStatus(null);
  }, []);

  // 인증 상태 변경 시 매치 목록 조회 및 웹소켓 연결
  useEffect(() => {
    let shouldCleanup = true;

    const setupSocketConnection = async () => {
      if (isAuthenticated && user) {
        try {
          await fetchUserMatches();

          // 웹소켓 연결
          const token = localStorage.getItem("token");
          if (token) {
            // 변경된 비동기 연결 메서드 사용
            await socketClient.connect(token);

            if (shouldCleanup) {
              // 매치메이킹 상태 리스너 등록
              socketClient.addEventListener(
                SocketEvents.MATCHMAKING_STATUS,
                handleMatchmakingStatus
              );

              // 매치 작업 상태 리스너 등록
              socketClient.addEventListener(
                SocketEvents.JOB_STATUS,
                handleMatchJobStatus
              );

              socketClient.addEventListener(
                SocketEvents.JOB_COMPLETED,
                handleMatchJobCompleted
              );
            }
          }
        } catch (err) {
          console.error("소켓 연결 또는 매치 데이터 로딩 중 오류:", err);
        }
      } else {
        // 인증 상태가 아닌 경우 상태 초기화
        setMatches([]);
        setCurrentMatch(null);
        setMatchEvents([]);
        setMatchStatistics(null);
        setMatchAnalysis(null);
        setMatchmakingStatus(null);
        setMatchJobStatus(null);
        stopPollingMatchJob();
      }
    };

    setupSocketConnection();

    // 클린업 함수
    return () => {
      shouldCleanup = false;

      if (isAuthenticated) {
        // 리스너 제거
        socketClient.removeEventListener(
          SocketEvents.MATCHMAKING_STATUS,
          handleMatchmakingStatus
        );
        socketClient.removeEventListener(
          SocketEvents.JOB_STATUS,
          handleMatchJobStatus
        );
        socketClient.removeEventListener(
          SocketEvents.JOB_COMPLETED,
          handleMatchJobCompleted
        );

        // 클린업 시 폴링도 중지
        stopPollingMatchJob();
      }
    };
  }, [
    isAuthenticated,
    user,
    handleMatchmakingStatus,
    handleMatchJobStatus,
    handleMatchJobCompleted,
    fetchUserMatches,
    stopPollingMatchJob,
  ]);

  // 현재 매치가 변경될 때 이벤트 리스너 등록
  useEffect(() => {
    if (!currentMatch) return;

    // 매치 이벤트 리스너 등록
    socketClient.addEventListener(SocketEvents.MATCH_EVENT, handleMatchEvent);
    socketClient.addEventListener(
      SocketEvents.MATCH_STATUS_CHANGE,
      handleMatchStatusChange
    );

    // 매치 이벤트 구독
    socketClient.subscribeToMatch(currentMatch.id);

    // 매치 이벤트 및 초기 데이터 로드
    fetchMatchEvents(currentMatch.id).catch((err) => {
      console.error(`매치 이벤트 조회 중 오류 (${currentMatch.id}):`, err);
    });

    // 매치가 완료된 상태면 통계 및 분석 로드
    if (currentMatch.status === "completed") {
      const loadData = async () => {
        try {
          await Promise.all([
            fetchMatchStatistics(currentMatch.id),
            fetchMatchAnalysis(currentMatch.id),
          ]);
        } catch (err) {
          console.error(
            `매치 통계/분석 조회 중 오류 (${currentMatch.id}):`,
            err
          );
        }
      };

      loadData();
    }

    return () => {
      socketClient.removeEventListener(
        SocketEvents.MATCH_EVENT,
        handleMatchEvent
      );
      socketClient.removeEventListener(
        SocketEvents.MATCH_STATUS_CHANGE,
        handleMatchStatusChange
      );
    };
  }, [currentMatch, handleMatchEvent, handleMatchStatusChange]);

  // contextValue 메모이제이션
  const contextValue = useMemo(
    () => ({
      matches,
      currentMatch,
      matchEvents,
      matchStatistics,
      matchAnalysis,
      isLoading,
      error,
      matchmakingStatus,
      matchJobStatus,
      fetchUserMatches,
      fetchMatchById,
      startQuickMatch,
      startGameMatch,
      fetchMatchEvents,
      fetchMatchStatistics,
      fetchMatchAnalysis,
      cancelMatchmaking,
      subscribeToMatchJob,
      unsubscribeFromMatchJob,
      checkMatchJobStatus: checkMatchJobStatusFn,
      startPollingMatchJob,
      stopPollingMatchJob,
    }),
    [
      matches,
      currentMatch,
      matchEvents,
      matchStatistics,
      matchAnalysis,
      isLoading,
      error,
      matchmakingStatus,
      matchJobStatus,
      fetchUserMatches,
      fetchMatchById,
      startQuickMatch,
      startGameMatch,
      fetchMatchEvents,
      fetchMatchStatistics,
      fetchMatchAnalysis,
      cancelMatchmaking,
      subscribeToMatchJob,
      unsubscribeFromMatchJob,
      checkMatchJobStatusFn,
      startPollingMatchJob,
      stopPollingMatchJob,
    ]
  );

  return (
    <MatchContext.Provider value={contextValue}>
      {children}
    </MatchContext.Provider>
  );
};

// 매치 컨텍스트 훅
export const useMatch = () => useContext(MatchContext);

export default MatchProvider;
