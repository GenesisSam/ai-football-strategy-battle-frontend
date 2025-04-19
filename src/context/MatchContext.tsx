import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import {
  Match,
  MatchEvent,
  MatchStatistics,
  MatchAnalysis,
  createQuickMatch,
  createGameMatch,
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
  // 매치 관련 액션
  fetchUserMatches: () => Promise<void>;
  fetchMatchById: (id: string) => Promise<Match | null>;
  startQuickMatch: (squadId?: string) => Promise<string | null>;
  startGameMatch: (squadId?: string) => Promise<boolean>;
  fetchMatchEvents: (matchId: string) => Promise<MatchEvent[]>;
  fetchMatchStatistics: (matchId: string) => Promise<MatchStatistics | null>;
  fetchMatchAnalysis: (matchId: string) => Promise<MatchAnalysis | null>;
  // 매치메이킹 관련
  cancelMatchmaking: () => void;
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
  // 매치 관련 액션
  fetchUserMatches: async () => {},
  fetchMatchById: async () => null,
  startQuickMatch: async () => null,
  startGameMatch: async () => false,
  fetchMatchEvents: async () => [],
  fetchMatchStatistics: async () => null,
  fetchMatchAnalysis: async () => null,
  // 매치메이킹 관련
  cancelMatchmaking: () => {},
};

// 매치 컨텍스트 생성
export const MatchContext =
  createContext<MatchContextType>(initialMatchContext);

// 매치 컨텍스트 프로바이더 인터페이스
interface MatchProviderProps {
  children: ReactNode;
}

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

  const { isAuthenticated, user } = useAuth();
  const { activeSquad } = useSquad();

  // 인증 상태 변경 시 매치 목록 조회 및 웹소켓 연결
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserMatches();

      // 웹소켓 연결
      const token = localStorage.getItem("token");
      if (token) {
        socketClient.connect(token);

        // 매치메이킹 상태 리스너 등록
        socketClient.addEventListener(
          SocketEvents.MATCHMAKING_STATUS,
          handleMatchmakingStatus
        );

        return () => {
          socketClient.removeEventListener(
            SocketEvents.MATCHMAKING_STATUS,
            handleMatchmakingStatus
          );
          socketClient.disconnect();
        };
      }
    } else {
      setMatches([]);
      setCurrentMatch(null);
      setMatchEvents([]);
      setMatchStatistics(null);
      setMatchAnalysis(null);
      setMatchmakingStatus(null);
    }
  }, [isAuthenticated, user]);

  // 현재 매치가 변경될 때 이벤트 리스너 등록
  useEffect(() => {
    if (currentMatch) {
      // 매치 이벤트 리스너 등록
      socketClient.addEventListener(SocketEvents.MATCH_EVENT, handleMatchEvent);
      socketClient.addEventListener(
        SocketEvents.MATCH_STATUS_CHANGE,
        handleMatchStatusChange
      );

      // 매치 이벤트 구독
      socketClient.subscribeToMatch(currentMatch.id);

      // 매치 이벤트 및 초기 데이터 로드
      fetchMatchEvents(currentMatch.id);

      // 매치가 완료된 상태면 통계 및 분석 로드
      if (currentMatch.status === "completed") {
        fetchMatchStatistics(currentMatch.id);
        fetchMatchAnalysis(currentMatch.id);
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
    }
  }, [currentMatch]);

  // 매치메이킹 상태 처리
  const handleMatchmakingStatus = (status: MatchmakingStatus) => {
    setMatchmakingStatus(status);

    // 매치가 성공적으로 매칭된 경우
    if (status.status === "matched" && status.matchId) {
      fetchMatchById(status.matchId);
    }
  };

  // 매치 이벤트 처리
  const handleMatchEvent = (message: MatchEventMessage) => {
    if (currentMatch && message.matchId === currentMatch.id) {
      setMatchEvents((prevEvents) => [...prevEvents, message.event]);

      // 스코어가 포함된 이벤트인 경우 현재 매치 정보에 스코어 업데이트
      if (message.event.currentScore) {
        setCurrentMatch((prev) =>
          prev ? { ...prev, score: message.event.currentScore } : null
        );
      }
    }
  };

  // 매치 상태 변경 처리
  const handleMatchStatusChange = (change: MatchStatusChange) => {
    if (currentMatch && change.matchId === currentMatch.id) {
      setCurrentMatch((prev) =>
        prev ? { ...prev, status: change.status } : null
      );

      // 매치가 완료된 경우 통계 및 분석 데이터 조회
      if (change.status === "completed") {
        fetchMatchStatistics(change.matchId);
        fetchMatchAnalysis(change.matchId);
      }
    }
  };

  // 사용자 매치 목록 조회
  const fetchUserMatches = async () => {
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
  };

  // 매치 상세 정보 조회
  const fetchMatchById = async (id: string): Promise<Match | null> => {
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
  };

  // AI 상대와의 빠른 매치 시작
  const startQuickMatch = async (squadId?: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // 스쿼드 ID가 제공되지 않은 경우 활성 스쿼드 사용
      const targetSquadId = squadId || activeSquad?.id;

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
  };

  // 다른 사용자와의 매치 시작 (매치메이킹)
  const startGameMatch = async (squadId?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      setMatchmakingStatus({ status: "searching" });

      // 스쿼드 ID가 제공되지 않은 경우 활성 스쿼드 사용
      const targetSquadId = squadId || activeSquad?.id;

      if (!targetSquadId) {
        setError(
          "활성화된 스쿼드가 없습니다. 먼저 스쿼드를 생성하고 활성화해주세요."
        );
        setMatchmakingStatus(null);
        return false;
      }

      await createGameMatch(targetSquadId);
      return true;
    } catch (err) {
      console.error("Error starting game match:", err);
      setError("매치메이킹을 시작하는 중 오류가 발생했습니다.");
      setMatchmakingStatus(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 매치메이킹 취소
  const cancelMatchmaking = () => {
    // 실제로는 서버에 매치메이킹 취소 요청을 보내야 함
    // 여기서는 상태만 초기화
    setMatchmakingStatus(null);
  };

  // 매치 이벤트 조회
  const fetchMatchEvents = async (matchId: string): Promise<MatchEvent[]> => {
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
  };

  // 매치 통계 조회
  const fetchMatchStatistics = async (
    matchId: string
  ): Promise<MatchStatistics | null> => {
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
  };

  // 매치 분석 조회
  const fetchMatchAnalysis = async (
    matchId: string
  ): Promise<MatchAnalysis | null> => {
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
  };

  const contextValue = {
    matches,
    currentMatch,
    matchEvents,
    matchStatistics,
    matchAnalysis,
    isLoading,
    error,
    matchmakingStatus,
    fetchUserMatches,
    fetchMatchById,
    startQuickMatch,
    startGameMatch,
    fetchMatchEvents,
    fetchMatchStatistics,
    fetchMatchAnalysis,
    cancelMatchmaking,
  };

  return (
    <MatchContext.Provider value={contextValue}>
      {children}
    </MatchContext.Provider>
  );
};

// 매치 컨텍스트 훅
export const useMatch = () => useContext(MatchContext);

export default MatchProvider;
