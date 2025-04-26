import React, { createContext, useContext, useState, ReactNode } from "react";
import * as matchApi from "../api/match";
import { MatchData, MatchStatus } from "../types/global";

interface MatchContextType {
  currentMatch: MatchData | null;
  isLoading: boolean;
  error: string | null;
  startQuickMatch: (squadId: string) => Promise<string | null>;
  startGameMatch: (squadId: string) => Promise<string | null>;
  getMatchDetails: (matchId: string) => Promise<MatchData | null>;
  resetMatchState: () => void;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentMatch, setCurrentMatch] = useState<MatchData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resetMatchState = () => {
    setCurrentMatch(null);
    setError(null);
  };

  // 빠른 대전 시작
  const startQuickMatch = async (squadId: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const match = await matchApi.createQuickMatch(squadId);
      setCurrentMatch(match);

      return match.id;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "빠른 매치를 시작하는 중 오류가 발생했습니다.";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 게임 대전 시작 (비동기)
  const startGameMatch = async (squadId: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const { jobId } = await matchApi.createGameMatch(squadId);
      return jobId;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "게임 매치를 시작하는 중 오류가 발생했습니다.";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 매치 상세 정보 조회
  const getMatchDetails = async (
    matchId: string
  ): Promise<MatchData | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const match = await matchApi.getMatchById(matchId);
      setCurrentMatch(match);

      return match;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "매치 정보를 불러오는 중 오류가 발생했습니다.";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentMatch,
    isLoading,
    error,
    startQuickMatch,
    startGameMatch,
    getMatchDetails,
    resetMatchState,
  };

  return (
    <MatchContext.Provider value={value}>{children}</MatchContext.Provider>
  );
};

export const useMatch = (): MatchContextType => {
  const context = useContext(MatchContext);
  if (context === undefined) {
    throw new Error("useMatch must be used within a MatchProvider");
  }
  return context;
};
