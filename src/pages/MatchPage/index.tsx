import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import { toast } from "react-toastify";
import { useMatch } from "../../context/MatchContext";
import AIStyleLoader from "../../components/AIStyleLoader";
import { MatchStatus, MatchData, MatchEvent } from "../../types/global.d";
import {
  getMatchEvents,
  getMatchStatus,
  getMatchLogs,
  shouldStopPolling,
} from "../../api/match";

import { EVENT_TYPE_COLORS, LAYOUT } from "../../constants/ui.constants";

import { POLLING, STATUS_MESSAGES } from "../../constants/match.constants";

import {
  CONFIRM_MESSAGES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../../constants/messages.constants";

// 로깅 헬퍼 함수
const logMatchPage = (action: string, data?: any) => {
  console.log(`[MatchPage] ${action}`, data || "");
};

// 컨테이너 스타일
const MatchContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

// 매치 헤더 스타일
const MatchHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

// 매치 결과 컨테이너 스타일
const MatchResultContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.light};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// 스코어보드 스타일
const Scoreboard = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  margin-bottom: 20px;
`;

// 팀 정보 스타일
const TeamInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

// 스코어 스타일
const Score = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  font-weight: bold;
  padding: 0 20px;
`;

// 로그 컨테이너 스타일
const LogsContainer = styled.div`
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  padding: 10px;
  margin-top: 20px;
`;

// 로그 아이템 스타일
const LogItem = styled.div<{ $eventType?: string }>`
  padding: 8px;
  margin-bottom: 8px;
  border-radius: 4px;
  background-color: ${({ $eventType }) =>
    $eventType === "goal"
      ? EVENT_TYPE_COLORS.GOAL
      : $eventType === "card"
      ? EVENT_TYPE_COLORS.CARD
      : $eventType === "injury"
      ? EVENT_TYPE_COLORS.INJURY
      : "transparent"};
`;

// 매치 통계 스타일
const StatisticsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`;

// 통계 행 스타일
const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

// 통계 라벨 스타일
const StatLabel = styled.div`
  flex: 1;
  text-align: center;
`;

// 통계 값 스타일
const StatValue = styled.div`
  flex: 1;
  text-align: center;
  font-weight: bold;
`;

// 통계 바 컨테이너 스타일
const StatBarContainer = styled.div`
  flex: 2;
  height: 12px;
  background-color: #f1f1f1;
  border-radius: 6px;
  overflow: hidden;
`;

// 통계 바 스타일
const StatBar = styled.div<{ $width: string; $isHome: boolean }>`
  height: 100%;
  width: ${({ $width }) => $width};
  background-color: ${({ theme, $isHome }) =>
    $isHome ? theme.colors.primary : theme.colors.secondary};
`;

// 버튼 스타일
const Button = styled.button`
  padding: 10px 20px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.neutral};
    cursor: not-allowed;
  }
`;

// 취소 버튼 스타일
const CancelButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.danger || "#dc3545"};

  &:hover {
    background-color: ${({ theme }) => theme.colors.dangerDark || "#c82333"};
  }
`;

// 버튼 컨테이너 스타일
const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 20px;
`;

interface MatchPageProps {}

const MatchPage: React.FC<MatchPageProps> = () => {
  // 라우터 파라미터 및 네비게이션
  const { id: matchId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  // 상태 관리
  const [loading, setLoading] = useState<boolean>(true);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // refs
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingErrorCountRef = useRef<number>(0);
  const refLoading = useRef<boolean>(false);

  // Match 컨텍스트
  const {
    getMatchDetails,
    cancelMatch,
    getErrorMessage,
    stopPolling: contextStopPolling,
  } = useMatch();

  // 매치 상세 정보 로드 (컨텍스트 함수 활용)
  const loadMatchDetails = useCallback(async () => {
    if (!matchId) return;

    try {
      logMatchPage("매치 상세 정보 로드 시작", { matchId });
      const matchDetails = await getMatchDetails(matchId);

      if (matchDetails) {
        setMatchData(matchDetails);
        logMatchPage("매치 상세 정보 로드 완료", matchDetails);
      } else {
        setError("매치 정보를 찾을 수 없습니다.");
        logMatchPage("매치 상세 정보 없음", { matchId });
      }
    } catch (err: any) {
      logMatchPage("매치 상세 정보 로드 실패", err);
      setError(`매치 정보를 불러오는데 실패했습니다: ${getErrorMessage(err)}`);
      toast.error("매치 정보를 불러오는데 실패했습니다.");
    }
  }, [matchId, getMatchDetails, getErrorMessage]);

  // 매치 이벤트 및 로그 로드
  const loadMatchEventsAndLogs = useCallback(async () => {
    if (!matchId) return;

    try {
      // 이벤트 로드
      const matchEvents = await getMatchEvents(matchId);
      if (matchEvents) {
        setEvents(matchEvents);
        logMatchPage("매치 이벤트 로드 완료", { count: matchEvents.length });
      }

      // 로그 로드
      const matchLogs = await getMatchLogs(matchId);
      if (matchLogs) {
        setLogs(matchLogs);
        logMatchPage("매치 로그 로드 완료", { count: matchLogs.length });
      }
    } catch (err) {
      logMatchPage("매치 이벤트/로그 로드 실패", err);
    }
  }, [matchId]);

  // 폴링 중지 - 컨텍스트의 stopPolling 함수와 통합
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
    contextStopPolling(); // 컨텍스트의 폴링 중지 함수도 호출
    logMatchPage("폴링 중지됨");
  }, [contextStopPolling]);

  // 매치 상태 폴링 시작
  const startPolling = useCallback(() => {
    if (!matchId || pollingIntervalRef.current) return;

    logMatchPage("폴링 시작", { matchId });
    setIsPolling(true);

    // 폴링 간격 사용
    const pollMatchStatus = async () => {
      try {
        // 매치 상태 조회
        const statusResponse = await getMatchStatus(matchId);
        logMatchPage("매치 상태 응답", statusResponse);

        // 매치가 종료되면 결과 페이지로 전환
        if (shouldStopPolling(statusResponse.status)) {
          logMatchPage("매치 종료 감지", { matchId });
          await loadMatchDetails();
          stopPolling();
        }
        // 각 상태에 따라 적절히 처리
        else if (
          statusResponse.status === MatchStatus.IN_PROGRESS ||
          statusResponse.status === MatchStatus.STARTED
        ) {
          logMatchPage("매치 진행 중", {
            matchId,
            status: statusResponse.status,
          });
          setLoading(false); // 로딩 상태 해제
        }
      } catch (err) {
        logMatchPage("매치 상태 조회 실패", { matchId, error: err });

        // 오류 카운트 증가
        pollingErrorCountRef.current += 1;

        // 연속 5회 이상 오류 발생 시 메시지 표시
        if (pollingErrorCountRef.current >= POLLING.MAX_ERROR_COUNT) {
          toast.error(ERROR_MESSAGES.MATCH.CONNECTION_ERROR);
          stopPolling();
        }
      }
    };

    // 첫 번째 폴링 즉시 실행
    pollMatchStatus();

    // 폴링 인터벌 설정
    pollingIntervalRef.current = setInterval(pollMatchStatus, POLLING.INTERVAL);

    return () => {
      stopPolling();
    };
  }, [matchId, loadMatchDetails, stopPolling]);

  // 홈페이지로 이동 - 메모이제이션 추가
  const handleGoHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // 컴포넌트 마운트 시 매치 정보 로드 및 폴링 시작 - 클린업 함수 개선
  useEffect(() => {
    if (matchId && !refLoading.current) {
      refLoading.current = true;

      // 매치 정보 로드
      loadMatchDetails()
        .then(() => {
          // 매치 상태 폴링 시작
          startPolling();

          // 매치 이벤트 및 로그 로드
          loadMatchEventsAndLogs();

          setLoading(false);
          refLoading.current = false;
        })
        .catch(() => {
          refLoading.current = false;
          setLoading(false);
        });
    }

    // 컴포넌트 언마운트 시 폴링 중지 및 리소스 정리
    return () => {
      stopPolling();
      pollingErrorCountRef.current = 0;
      refLoading.current = false;
    };
  }, [
    matchId,
    loadMatchDetails,
    loadMatchEventsAndLogs,
    startPolling,
    stopPolling,
  ]);

  // 매치 통계 표시 여부 - 메모이제이션 추가
  const showStatistics = useMemo(
    () => Boolean(matchData && matchData.statistics),
    [matchData]
  );

  // 매치가 끝났는지 여부 - 메모이제이션 추가
  const isMatchFinished = useMemo(
    () => matchData?.status === MatchStatus.ENDED,
    [matchData?.status]
  );

  // 로딩 중이거나 매치 정보가 없으면 AIStyleLoader 표시
  if (loading || !matchData) {
    return <MatchContainer>... loading</MatchContainer>;
  }

  // 에러가 있으면 에러 메시지 표시
  if (error) {
    return (
      <MatchContainer>
        <h2>오류 발생</h2>
        <p>{error}</p>
        <Button onClick={handleGoHome}>홈으로 돌아가기</Button>
      </MatchContainer>
    );
  }

  // 매치 취소 핸들러
  const handleCancelMatch = async () => {
    if (!matchId) return;

    if (window.confirm(CONFIRM_MESSAGES.MATCH.CANCEL_CONFIRM)) {
      setIsCancelling(true);
      try {
        const success = await cancelMatch(matchId);
        if (success) {
          // 폴링 중지
          stopPolling();

          toast.success(SUCCESS_MESSAGES.MATCH.CANCEL_SUCCESS);
          navigate("/");
        } else {
          toast.error(ERROR_MESSAGES.MATCH.CANCEL_FAILED);
        }
      } catch (err: any) {
        toast.error(
          `매치 취소 중 오류가 발생했습니다: ${getErrorMessage(err)}`
        );
        logMatchPage("매치 취소 오류", err);
      } finally {
        setIsCancelling(false);
      }
    }
  };

  return (
    <MatchContainer>
      <MatchHeader>
        <h1>매치 {isMatchFinished ? "결과" : "진행중"}</h1>
        <Button onClick={handleGoHome}>홈으로</Button>
      </MatchHeader>

      {/* 매치가 아직 진행 중이면 AIStyleLoader와 취소 버튼 표시 */}
      {!isMatchFinished ? (
        <>
          <AIStyleLoader matchId={matchId} onMatchComplete={loadMatchDetails} />
          <ButtonContainer>
            <CancelButton onClick={handleCancelMatch} disabled={isCancelling}>
              {isCancelling ? "취소 중..." : "매치 취소하기"}
            </CancelButton>
          </ButtonContainer>
        </>
      ) : (
        <MatchResultContainer>
          {/* 스코어보드 */}
          <Scoreboard>
            <TeamInfo>
              <h3>{matchData.homeTeam?.name || "홈팀"}</h3>
              <p>{matchData.homeTeam?.formation || "-"}</p>
            </TeamInfo>
            <Score>
              {matchData.result?.homeScore || 0} -{" "}
              {matchData.result?.awayScore || 0}
            </Score>
            <TeamInfo>
              <h3>{matchData.awayTeam?.name || "어웨이팀"}</h3>
              <p>{matchData.awayTeam?.formation || "-"}</p>
            </TeamInfo>
          </Scoreboard>

          {/* 로그 표시 */}
          {logs && logs.length > 0 && (
            <>
              <h3>경기 로그</h3>
              <LogsContainer>
                {logs.map((log, index) => (
                  <LogItem key={index} $eventType={log.eventType}>
                    <strong>{log.minute}'</strong> - {log.description}
                  </LogItem>
                ))}
              </LogsContainer>
            </>
          )}

          {/* 통계 표시 */}
          {showStatistics && (
            <StatisticsContainer>
              <h3>경기 통계</h3>

              <StatRow>
                <StatValue>
                  {matchData.statistics?.home?.possession || 0}%
                </StatValue>
                <StatLabel>점유율</StatLabel>
                <StatValue>
                  {matchData.statistics?.away?.possession || 0}%
                </StatValue>
              </StatRow>
              <StatBarContainer>
                <StatBar
                  $width={`${matchData.statistics?.home?.possession || 0}%`}
                  $isHome={true}
                />
              </StatBarContainer>

              <StatRow>
                <StatValue>{matchData.statistics?.home?.shots || 0}</StatValue>
                <StatLabel>슈팅</StatLabel>
                <StatValue>{matchData.statistics?.away?.shots || 0}</StatValue>
              </StatRow>
              <StatRow>
                <StatValue>
                  {matchData.statistics?.home?.shotsOnTarget || 0}
                </StatValue>
                <StatLabel>유효 슈팅</StatLabel>
                <StatValue>
                  {matchData.statistics?.away?.shotsOnTarget || 0}
                </StatValue>
              </StatRow>
              <StatRow>
                <StatValue>{matchData.statistics?.home?.passes || 0}</StatValue>
                <StatLabel>패스</StatLabel>
                <StatValue>{matchData.statistics?.away?.passes || 0}</StatValue>
              </StatRow>
              <StatRow>
                <StatValue>
                  {matchData.statistics?.home?.passAccuracy || 0}%
                </StatValue>
                <StatLabel>패스 정확도</StatLabel>
                <StatValue>
                  {matchData.statistics?.away?.passAccuracy || 0}%
                </StatValue>
              </StatRow>
              <StatRow>
                <StatValue>{matchData.statistics?.home?.fouls || 0}</StatValue>
                <StatLabel>파울</StatLabel>
                <StatValue>{matchData.statistics?.away?.fouls || 0}</StatValue>
              </StatRow>
              <StatRow>
                <StatValue>
                  {matchData.statistics?.home?.corners || 0}
                </StatValue>
                <StatLabel>코너킥</StatLabel>
                <StatValue>
                  {matchData.statistics?.away?.corners || 0}
                </StatValue>
              </StatRow>
              <StatRow>
                <StatValue>
                  {matchData.statistics?.home?.yellowCards || 0} /{" "}
                  {matchData.statistics?.home?.redCards || 0}
                </StatValue>
                <StatLabel>경고 / 퇴장</StatLabel>
                <StatValue>
                  {matchData.statistics?.away?.yellowCards || 0} /{" "}
                  {matchData.statistics?.away?.redCards || 0}
                </StatValue>
              </StatRow>
            </StatisticsContainer>
          )}

          {/* 매치 분석 결과가 있다면 표시 */}
          {matchData.analysis && (
            <>
              <h3>매치 분석</h3>
              <div style={{ margin: "10px 0", lineHeight: "1.6" }}>
                {matchData.analysis}
              </div>
            </>
          )}
        </MatchResultContainer>
      )}
    </MatchContainer>
  );
};

export default MatchPage;
