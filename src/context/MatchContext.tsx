import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import * as matchApi from "../api/match";
import { MatchData } from "../types/global";

// 로그 헬퍼 함수
const logMatch = (action: string, data?: any) => {
  console.log(`[MatchContext] ${action}`, data || "");
};

// 매치 컨텍스트 인터페이스 정의
interface MatchContextType {
  isLoading: boolean;
  error: string | null;
  startQuickMatch: (squadId: string) => Promise<MatchData | null>;
  startGameMatch: (squadId: string) => Promise<string | null>;
  getMatchDetails: (matchId: string) => Promise<MatchData | null>;
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

  // 에러 초기화 함수
  const clearError = useCallback(() => {
    logMatch("에러 초기화");
    setError(null);
  }, []);

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

  // 게임 대전 시작 (비동기)
  const startGameMatch = useCallback(
    async (squadId: string): Promise<string | null> => {
      logMatch("게임 매치 시작", { squadId });
      try {
        setIsLoading(true);
        setError(null);

        const { jobId } = await matchApi.createGameMatch(squadId);
        logMatch("게임 매치 작업 생성 완료", { jobId });
        return jobId;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "게임 매치를 시작하는 중 오류가 발생했습니다.";
        logMatch("게임 매치 시작 오류", { error: errorMessage });
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
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

  // 컨텍스트 값 메모이제이션
  const value = useMemo(
    () => ({
      isLoading,
      error,
      startQuickMatch,
      startGameMatch,
      getMatchDetails,
      clearError,
    }),
    [
      isLoading,
      error,
      startQuickMatch,
      startGameMatch,
      getMatchDetails,
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
