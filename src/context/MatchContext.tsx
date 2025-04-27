import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import * as matchApi from "../api/match";
import { MatchData } from "../types/global";
import { useSocket } from "../hooks/useSocket";
import { subscribeToMatchJob, unsubscribeFromMatchJob } from "../api/socket";

// 로그 헬퍼 함수
const logMatch = (action: string, data?: any) => {
  console.log(`[MatchContext] ${action}`, data || "");
};

// 작업 상태 인터페이스
interface JobStatus {
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  result?: any;
  error?: string;
}

// 매치 컨텍스트 인터페이스 정의
interface MatchContextType {
  isLoading: boolean;
  error: string | null;
  jobStatus: Record<string, JobStatus>;
  currentJobId: string | null;
  startQuickMatch: (squadId: string) => Promise<MatchData | null>;
  startGameMatch: (squadId: string) => Promise<string | null>;
  getMatchDetails: (matchId: string) => Promise<MatchData | null>;
  subscribeToJob: (jobId: string) => void;
  unsubscribeFromJob: (jobId?: string) => void;
  clearError: () => void;
}

// 매치 컨텍스트 생성
const MatchContext = createContext<MatchContextType | undefined>(undefined);

// 매치 컨텍스트 프로바이더 props 인터페이스
interface MatchProviderProps {
  children: ReactNode;
}

// 매치 컨텍스트 프로바이더 컴포넌트
export const MatchProvider: React.FC<MatchProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<Record<string, JobStatus>>({});
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const { socket, isConnected, connect } = useSocket();

  // 소켓 연결 설정 및 이벤트 리스너 등록
  useEffect(() => {
    if (!isConnected && !socket) {
      connect();
    }

    if (socket) {
      // 작업 상태 업데이트 이벤트 리스너 (백지화됨)
      socket.on("match:jobUpdate", (data: { jobId: string } & JobStatus) => {
        const { jobId, ...status } = data;
        logMatch("작업 상태 업데이트 (백지화된 기능)", { jobId, status });

        // 기본적인 상태 업데이트만 제공
        setJobStatus((prevState) => ({
          ...prevState,
          [jobId]: {
            status: "processing",
            progress: 0.5, // 항상 50%로 고정
          },
        }));
      });

      // 작업 에러 이벤트 리스너 (백지화됨)
      socket.on("match:jobError", (data: { jobId: string; error: string }) => {
        logMatch("작업 에러 (백지화된 기능)", data);
        setJobStatus((prevState) => ({
          ...prevState,
          [data.jobId]: {
            ...prevState[data.jobId],
            status: "failed",
            error:
              "작업 처리 중 오류가 발생했습니다. 현재 작업 추적 기능은 완전히 구현되지 않았습니다.",
          },
        }));
      });

      return () => {
        socket.off("match:jobUpdate");
        socket.off("match:jobError");
      };
    }
  }, [socket, isConnected, connect]);

  // 에러 초기화 함수
  const clearError = useCallback(() => {
    logMatch("에러 초기화");
    setError(null);
  }, []);

  // 특정 작업 구독 (백지화됨)
  const subscribeToJob = useCallback(
    (jobId: string) => {
      logMatch("작업 구독 (백지화된 기능)", { jobId });

      if (socket && isConnected) {
        setCurrentJobId(jobId);
        // 서버에 구독 요청은 유지하되, 백엔드에서는 제대로 처리되지 않음
        subscribeToMatchJob(socket, jobId);

        // 백지화된 기능이므로 임의의 처리 중 상태로 설정
        setJobStatus((prevState) => ({
          ...prevState,
          [jobId]: {
            status: "processing",
            progress: 0.5, // 항상 50%로 고정
          },
        }));
      } else {
        logMatch("작업 구독 실패 - 소켓 연결 없음", { jobId });
      }
    },
    [socket, isConnected]
  );

  // 작업 구독 취소 (백지화됨)
  const unsubscribeFromJob = useCallback(
    (jobId?: string) => {
      const idToUnsubscribe = jobId || currentJobId;

      if (!idToUnsubscribe) return;

      logMatch("작업 구독 취소 (백지화된 기능)", { jobId: idToUnsubscribe });

      if (socket && isConnected) {
        unsubscribeFromMatchJob(socket, idToUnsubscribe);

        if (currentJobId === idToUnsubscribe) {
          setCurrentJobId(null);
        }
      }
    },
    [socket, isConnected, currentJobId]
  );

  // 빠른 매치 시작 함수
  const startQuickMatch = useCallback(
    async (squadId: string): Promise<MatchData | null> => {
      logMatch("빠른 매치 시작", { squadId });
      try {
        setIsLoading(true);
        setError(null);

        const match = await matchApi.createQuickMatch(squadId);
        logMatch("빠른 매치 생성 완료", { matchId: match.id });
        return match;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "빠른 매치를 시작하는 중 오류가 발생했습니다.";
        logMatch("빠른 매치 시작 오류", { error: errorMessage });
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 게임 대전 시작 (백지화됨)
  const startGameMatch = useCallback(
    async (squadId: string): Promise<string | null> => {
      logMatch("게임 매치 시작 (백지화된 기능)", { squadId });
      try {
        setIsLoading(true);
        setError(null);

        // API 호출은 유지하되, 결과는 백엔드에서 제대로 처리되지 않음
        const { jobId } = await matchApi.createGameMatch(squadId);
        logMatch("게임 매치 작업 생성 완료 (백지화된 기능)", { jobId });

        if (jobId) {
          // 임의의 작업 상태 설정
          setJobStatus({
            [jobId]: {
              status: "processing",
              progress: 0.5, // 항상 50%로 고정
            },
          });

          setCurrentJobId(jobId);

          // 작업 생성 후 자동으로 구독 (실제로는 제대로 동작하지 않음)
          if (socket && isConnected) {
            subscribeToJob(jobId);
          }
        }

        return jobId;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "게임 매치를 시작하는 중 오류가 발생했습니다. (현재 이 기능은 완전히 구현되지 않았습니다)";
        logMatch("게임 매치 시작 오류 (백지화된 기능)", {
          error: errorMessage,
        });
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [socket, isConnected, subscribeToJob]
  );

  // 매치 상세 정보 조회
  const getMatchDetails = useCallback(
    async (matchId: string): Promise<MatchData | null> => {
      logMatch("매치 상세 정보 조회", { matchId });
      try {
        setIsLoading(true);
        setError(null);

        const match = await matchApi.getMatchById(matchId);
        logMatch("매치 상세 정보 조회 성공", {
          matchId,
          status: match.status,
          homeScore: match.result?.homeScore,
          awayScore: match.result?.awayScore,
        });
        return match;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "매치 정보를 불러오는 중 오류가 발생했습니다.";
        logMatch("매치 상세 정보 조회 오류", { matchId, error: errorMessage });
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 컴포넌트 언마운트시 구독 취소
  useEffect(() => {
    return () => {
      if (currentJobId && socket) {
        unsubscribeFromJob(currentJobId);
      }
    };
  }, [currentJobId, socket, unsubscribeFromJob]);

  // 컨텍스트 값 메모이제이션
  const value = useMemo(
    () => ({
      isLoading,
      error,
      jobStatus,
      currentJobId,
      startQuickMatch,
      startGameMatch,
      getMatchDetails,
      subscribeToJob,
      unsubscribeFromJob,
      clearError,
    }),
    [
      isLoading,
      error,
      jobStatus,
      currentJobId,
      startQuickMatch,
      startGameMatch,
      getMatchDetails,
      subscribeToJob,
      unsubscribeFromJob,
      clearError,
    ]
  );

  return (
    <MatchContext.Provider value={value}>{children}</MatchContext.Provider>
  );
};

// 매치 컨텍스트 훅
export const useMatch = (): MatchContextType => {
  const context = useContext(MatchContext);
  if (context === undefined) {
    throw new Error("useMatch must be used within a MatchProvider");
  }
  return context;
};
