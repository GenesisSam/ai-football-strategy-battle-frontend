import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSocket } from "../../hooks/useSocket";
import { MatchStatus } from "../../types/global";

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 100;
`;

const LoadingText = styled.h2`
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2rem;
  text-align: center;
`;

const StatusMessage = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 1rem;
  max-width: 600px;
  text-align: center;
`;

const ScoreDisplay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0;
  font-size: 2.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const TeamName = styled.span`
  padding: 0 1.5rem;
`;

const Score = styled.span`
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: white;
  margin: 0 1rem;
`;

const LoadingBar = styled.div`
  width: 300px;
  height: 10px;
  background-color: ${({ theme }) => theme.colors.light};
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const LoadingProgress = styled.div<{ width: number }>`
  height: 100%;
  width: ${({ width }) => width}%;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 5px;
  transition: width 0.3s ease-in-out;
`;

const LogsContainer = styled.div`
  width: 80%;
  max-width: 800px;
  max-height: 300px;
  overflow-y: auto;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  margin-top: 2rem;
`;

const LogEntry = styled.div`
  padding: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.light};
  display: flex;
  align-items: flex-start;

  &:last-child {
    border-bottom: none;
  }
`;

const LogTime = styled.span`
  color: ${({ theme }) => theme.colors.secondary};
  margin-right: 1rem;
  font-weight: bold;
  min-width: 50px;
`;

const LogMessage = styled.span`
  color: ${({ theme }) => theme.colors.text};
`;

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

  // 매치 상태에 따른 진행률 계산
  useEffect(() => {
    switch (status) {
      case MatchStatus.MATCHMAKING:
        setProgress(10);
        break;
      case MatchStatus.OPPONENT_FOUND:
        setProgress(25);
        break;
      case MatchStatus.PREPARING_STADIUM:
        setProgress(40);
        break;
      case MatchStatus.PLAYERS_ENTERING:
        setProgress(55);
        break;
      case MatchStatus.MATCH_STARTED:
        setProgress(70);
        break;
      case MatchStatus.SIMULATION_ACTIVE:
        setProgress(85);
        break;
      case MatchStatus.MATCH_ENDED:
        setProgress(100);
        setIsComplete(true);
        break;
      default:
        setProgress(0);
    }
  }, [status]);

  // 소켓 이벤트 구독
  useEffect(() => {
    if (!socket) return;

    // 작업 ID가 있으면 작업 업데이트 구독
    if (jobId) {
      // 작업 구독
      socket.emit("match:subscribeJob", { jobId });

      // 작업 상태 업데이트 수신
      socket.on("match:jobStatus", (data) => {
        if (data.jobId === jobId) {
          if (data.status === "completed" && data.matchId) {
            setMatchId(data.matchId);
          } else if (data.status === "failed" && data.error) {
            setMessage(`오류 발생: ${data.error}`);
          }
        }
      });

      // 작업 완료 이벤트 수신
      socket.on("match:jobCompleted", (data) => {
        if (data.jobId === jobId && data.matchId) {
          setMatchId(data.matchId);
        }
      });
    }

    // 소켓 정리 함수
    return () => {
      socket.off("match:jobStatus");
      socket.off("match:jobCompleted");
      socket.off("match:statusUpdate");
      socket.off("match:log");
      socket.off("match:scoreUpdate");
      socket.off("match:end");

      // 작업 구독 해제
      if (jobId) {
        socket.emit("match:unsubscribeJob", { jobId });
      }

      // 매치 구독 해제
      if (matchId) {
        socket.emit("match:leave", { matchId });
      }
    };
  }, [socket, jobId]);

  // 매치 ID가 있으면 매치 업데이트 구독
  useEffect(() => {
    if (!socket || !matchId) return;

    // 이전 매치 구독 해제
    socket.emit("match:leave", { matchId });

    // 새 매치 구독
    socket.emit("match:join", { matchId });

    // 매치 상태 업데이트 수신
    socket.on(
      "match:statusUpdate",
      (data: { matchId: string } & MatchStatusUpdate) => {
        if (data.matchId === matchId) {
          setStatus(data.status);
          setMessage(data.message || STATUS_MESSAGES[data.status]);

          // 추가 정보가 있으면 스코어 업데이트
          if (data.additionalInfo) {
            const { homeScore, awayScore } = data.additionalInfo;
            if (homeScore !== undefined) setHomeScore(homeScore);
            if (awayScore !== undefined) setAwayScore(awayScore);
          }

          // 매치가 종료되면 완료 콜백 호출
          if (data.status === MatchStatus.MATCH_ENDED && onMatchComplete) {
            onMatchComplete(matchId);
          }
        }
      }
    );

    // 매치 로그 수신
    socket.on("match:log", (data: { matchId: string; log: MatchLog }) => {
      if (data.matchId === matchId) {
        setLogs((prevLogs) =>
          [...prevLogs, data.log].sort((a, b) => a.minute - b.minute)
        );
      }
    });

    // 모든 로그 한번에 수신
    socket.on("match:allLogs", (data: { logs: MatchLog[] }) => {
      setLogs(data.logs.sort((a, b) => a.minute - b.minute));
    });

    // 스코어 업데이트 수신
    socket.on(
      "match:scoreUpdate",
      (data: { matchId: string; homeScore: number; awayScore: number }) => {
        if (data.matchId === matchId) {
          setHomeScore(data.homeScore);
          setAwayScore(data.awayScore);
        }
      }
    );

    // 매치 종료 수신
    socket.on("match:end", (data: { matchId: string }) => {
      if (data.matchId === matchId) {
        setStatus(MatchStatus.MATCH_ENDED);
        setMessage(STATUS_MESSAGES[MatchStatus.MATCH_ENDED]);
        setIsComplete(true);

        if (onMatchComplete) {
          onMatchComplete(matchId);
        }
      }
    });
  }, [socket, matchId]);

  return (
    <LoaderContainer>
      <LoadingText>AI 축구 시뮬레이션</LoadingText>
      <StatusMessage>{message}</StatusMessage>

      <LoadingBar>
        <LoadingProgress width={progress} />
      </LoadingBar>

      {(status === MatchStatus.MATCH_STARTED ||
        status === MatchStatus.SIMULATION_ACTIVE ||
        status === MatchStatus.MATCH_ENDED) && (
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

export default AIStyleLoader;
