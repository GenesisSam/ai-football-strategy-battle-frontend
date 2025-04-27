import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

import { MatchStatus, JobDetailStatus } from "../../types/global.d";
import {
  getMatchStatus,
  getMatchById,
  getMatchLogs,
  shouldStopPolling,
} from "../../api/match";
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

import {
  STATUS_MESSAGES,
  PROGRESS_BY_STATUS,
  POLLING,
} from "../../constants/match.constants";

interface AIStyleLoaderProps {
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

const AIStyleLoader: React.FC<AIStyleLoaderProps> = ({
  matchId: initialMatchId,
  statusText,
  onMatchComplete,
}) => {
  // 상태 관리
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<MatchStatus>(MatchStatus.CREATED);
  const [message, setMessage] = useState<string>(
    statusText ||
      STATUS_MESSAGES[JobDetailStatus.MATCHMAKING] ||
      "매치메이킹 중입니다..."
  );
  const [matchId, setMatchId] = useState<string | undefined>(initialMatchId);
  const [logs, setLogs] = useState<MatchLog[]>([]);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);

  // 폴링 관련 상태
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingErrorCountRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const lastPolledTimeRef = useRef<number>(0);

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
    return 0;
  }, [initialMatchId]);

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

  // 폴링 중지 함수
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
    log("폴링 중지됨");
  }, [log]);

  // 매치 상태 폴링 함수
  const startPolling = useCallback(() => {
    if (!matchId || pollingIntervalRef.current) return;

    log("폴링 시작", { matchId });
    setIsPolling(true);

    const pollMatchStatus = async () => {
      if (!isMountedRef.current) return;

      try {
        // 폴링 시간 기록
        lastPolledTimeRef.current = Date.now();

        // 매치 상태 조회
        const statusResponse = await getMatchStatus(matchId);
        log("매치 상태 폴링 응답", statusResponse);

        // 매치 상태 업데이트
        if (statusResponse.status) {
          setStatus(statusResponse.status);
          setMessage(
            statusResponse.message || STATUS_MESSAGES[statusResponse.status]
          );
          updateProgressByStatus(statusResponse.status);

          // 추가 정보 처리
          if (statusResponse.additionalInfo) {
            const { homeScore: newHomeScore, awayScore: newAwayScore } =
              statusResponse.additionalInfo;
            if (newHomeScore !== undefined) setHomeScore(newHomeScore);
            if (newAwayScore !== undefined) setAwayScore(newAwayScore);
          }

          // 매치 상세 정보 조회 (매치가 시작되었거나 진행 중이거나 종료된 경우)
          if (
            [
              MatchStatus.STARTED,
              MatchStatus.IN_PROGRESS,
              MatchStatus.ENDED,
            ].includes(statusResponse.status)
          ) {
            try {
              // 매치 상세 정보 조회
              const matchDetails = await getMatchById(matchId);
              if (matchDetails?.result) {
                setHomeScore(matchDetails.result.homeScore);
                setAwayScore(matchDetails.result.awayScore);
              }

              // 매치 로그 조회
              const matchLogs = await getMatchLogs(matchId);
              if (Array.isArray(matchLogs) && matchLogs.length > 0) {
                setLogs(matchLogs.sort((a, b) => a.minute - b.minute));
              }
            } catch (error) {
              log("매치 상세 정보 조회 실패", error);
            }
          }

          // 매치가 종료된 경우 폴링 중지
          if (shouldStopPolling(statusResponse.status)) {
            log("매치 종료, 폴링 중지", { status: statusResponse.status });
            stopPolling();

            // 매치 완료 콜백 호출
            if (statusResponse.status === MatchStatus.ENDED) {
              handleMatchComplete();
            }
          }
        }

        // 오류 카운트 초기화
        pollingErrorCountRef.current = 0;
      } catch (error) {
        log("매치 상태 폴링 오류", error);
        pollingErrorCountRef.current += 1;

        // 연속 오류 발생 시 폴링 중지
        if (pollingErrorCountRef.current >= POLLING.MAX_ERROR_COUNT) {
          log("연속 오류 한도 초과, 폴링 중지");
          stopPolling();
          setMessage("서버 연결 오류가 발생했습니다.");
        }
      }
    };

    // 첫 번째 폴링 즉시 실행
    void pollMatchStatus();

    // 폴링 인터벌 설정
    pollingIntervalRef.current = setInterval(() => {
      void pollMatchStatus();
    }, POLLING.INTERVAL);

    // 더 이상 Promise를 반환하지 않는 함수를 반환
  }, [matchId, log, stopPolling, updateProgressByStatus, handleMatchComplete]);

  // 컴포넌트 언마운트 시 폴링 중지
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // 초기 진행률 설정 및 폴링 시작
  useEffect(() => {
    setProgress(initialProgress);

    // matchId가 있으면 폴링 시작
    if (matchId && !isPolling) {
      startPolling();
    }
  }, [matchId, initialProgress, isPolling, startPolling]);

  // initialMatchId 변경 감지하여 내부 상태 업데이트 - 의존성 배열 최적화
  useEffect(() => {
    if (initialMatchId && initialMatchId !== matchId) {
      log("초기 매치 ID 변경 감지", { newId: initialMatchId, prevId: matchId });
      setMatchId(initialMatchId);
      setProgress(PROGRESS_BY_STATUS[JobDetailStatus.PREPARING_STADIUM]);

      // 기존 폴링 중지
      stopPolling();

      // 약간의 지연 후 새 매치 ID로 폴링 시작
      const timerId = setTimeout(() => {
        if (isMountedRef.current) {
          startPolling();
        }
      }, 500);

      return () => clearTimeout(timerId);
    }
  }, [initialMatchId, matchId, log, stopPolling, startPolling]);

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

export default React.memo(AIStyleLoader);
