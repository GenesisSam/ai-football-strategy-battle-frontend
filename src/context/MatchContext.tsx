import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";

import {
  createGameMatch,
  getMatchById,
  cancelMatchRequest,
} from "../api/match";

import { MatchData } from "../types/global.d";
import { useAuth } from "./AuthContext";

// 매치 컨텍스트 인터페이스
interface MatchContextType {
  matches: MatchData[];
  activeMatch: MatchData | null;
  isLoading: boolean;
  isPolling: boolean;
  error: string | null;
  getMatchDetails: (id: string) => Promise<MatchData | null>;
  startGameMatch: (squadId: string) => Promise<string>;
  cancelMatch: (matchId: string) => Promise<boolean>;
  stopPolling: () => void;
  getErrorMessage: (error: any) => string;
}

// 초기 컨텍스트 값
const initialMatchContext: MatchContextType = {
  matches: [],
  activeMatch: null,
  isLoading: false,
  isPolling: false,
  error: null,
  getMatchDetails: async () => null,
  startGameMatch: async () => "",
  cancelMatch: async () => false,
  stopPolling: () => {},
  getErrorMessage: () => "",
};

// 매치 컨텍스트 생성
export const MatchContext =
  createContext<MatchContextType>(initialMatchContext);

// 로깅 헬퍼 함수
const logMatchContext = (action: string, data?: any) => {
  console.log(`[MatchContext] ${action}`, data || "");
};

// 매치 컨텍스트 제공자 인터페이스
interface MatchProviderProps {
  children: ReactNode;
}

// 매치 컨텍스트 제공자 컴포넌트
export const MatchProvider: React.FC<MatchProviderProps> = ({ children }) => {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [activeMatch, setActiveMatch] = useState<MatchData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // 매치 상세 정보 조회
  const getMatchDetails = useCallback(
    async (id: string): Promise<MatchData | null> => {
      if (!id) {
        logMatchContext("매치 상세 조회 실패", "ID가 없습니다");
        return null;
      }

      setIsLoading(true);
      setError(null);
      try {
        const matchDetails = await getMatchById(id);
        logMatchContext("매치 상세 조회 성공", matchDetails);

        if (matchDetails) {
          setActiveMatch(matchDetails);
        }

        return matchDetails;
      } catch (err: any) {
        logMatchContext("매치 상세 조회 실패", err);
        setError(`매치 상세 조회 실패: ${err.message || "알 수 없는 오류"}`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 게임 대전 시작
  const startGameMatch = useCallback(
    async (squadId: string): Promise<string> => {
      setIsLoading(true);
      setError(null);
      try {
        logMatchContext("게임 대전 시작", { squadId });
        const response = await createGameMatch(squadId);

        // id가 있거나 _id가 있는 경우 모두 처리
        const matchId = response?.id || response?._id;

        if (matchId) {
          logMatchContext("게임 대전 생성 성공", { matchId });
          return matchId;
        }

        throw new Error("매치 ID를 받지 못했습니다");
      } catch (err: any) {
        logMatchContext("게임 대전 시작 실패", err);
        setError(`게임 대전 시작 실패: ${err.message || "알 수 없는 오류"}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 폴링 중지
  const stopPolling = useCallback(() => {
    setIsPolling(false);
    logMatchContext("폴링 중지");
  }, []);

  // 에러 메시지 생성 함수
  const getErrorMessage = useCallback((error: any): string => {
    if (!error) return "알 수 없는 오류가 발생했습니다.";

    if (error.status === 401) {
      return "인증이 필요합니다. 다시 로그인해주세요.";
    } else if (error.status === 403) {
      return "이 작업을 수행할 권한이 없습니다.";
    } else if (error.status === 404) {
      return "요청한 매치를 찾을 수 없습니다.";
    } else if (error.status >= 500) {
      return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    }

    return error.message || "알 수 없는 오류가 발생했습니다.";
  }, []);

  // 매치 취소 함수 추가
  const cancelMatch = useCallback(
    async (matchId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        logMatchContext("매치 취소 시도", { matchId });
        const response = await cancelMatchRequest(matchId);

        if (response && response.success) {
          logMatchContext("매치 취소 성공", { matchId });
          return true;
        }

        throw new Error("매치 취소에 실패했습니다");
      } catch (err: any) {
        logMatchContext("매치 취소 실패", err);
        setError(`매치 취소 실패: ${getErrorMessage(err)}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [getErrorMessage]
  );

  // 컨텍스트 값
  const contextValue: MatchContextType = {
    matches,
    activeMatch,
    isLoading,
    isPolling,
    error,
    getMatchDetails,
    startGameMatch,
    cancelMatch,
    stopPolling,
    getErrorMessage,
  };

  return (
    <MatchContext.Provider value={contextValue}>
      {children}
    </MatchContext.Provider>
  );
};

// 매치 컨텍스트 사용 훅
export const useMatch = () => useContext(MatchContext);

export default MatchProvider;
