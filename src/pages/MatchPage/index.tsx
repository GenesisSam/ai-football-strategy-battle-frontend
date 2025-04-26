import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  Suspense,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMatch } from "../../context/MatchContext";
import { useAuth } from "../../context/AuthContext";
import { MatchData, MatchStatus } from "../../types/global.d";
import { getMatchStatus } from "../../api/match";
import { useSocket } from "../../hooks/useSocket";
import { shareMatch } from "../../api/match";

import {
  LoadingIndicator,
  MatchContainer,
  ResultContainer,
  Title,
  ScoreBoard,
  TeamInfo,
  TeamName,
  Score,
  Versus,
  ResultMessage,
  StatsSection,
  StatsTitle,
  StatsList,
  StatLabel,
  HomeStat,
  AwayStat,
  AnalysisSection,
  EventsSection,
  EventsList,
  EventItem,
  EventMinute,
  EventType,
  EventDescription,
  Buttons,
  Button,
  ErrorMessage,
} from "./styled";

// 로그 헬퍼 함수
const logMatchPage = (action: string, data?: any) => {
  console.log(`[MatchPage] ${action}`, data || "");
};

// AIStyleLoader를 지연 로딩으로 변경
const AIStyleLoader = React.lazy(
  () => import("../../components/AIStyleLoader")
);

const MatchPage: React.FC = () => {
  const { jobId, matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getMatchDetails, error } = useMatch();

  const [loading, setLoading] = useState<boolean>(true);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [sharingStatus, setSharingStatus] = useState<{
    loading: boolean;
    url?: string;
    error?: string;
  }>({ loading: false });

  // useSocket 훅을 사용하여 웹소켓 연결 관리
  const { socket, isConnected, error: socketError } = useSocket(matchId);

  // interval을 useRef로 관리하여 불필요한 리렌더링 방지
  const pollingIntervalRef = useRef<number | null>(null);

  logMatchPage("컴포넌트 초기화", {
    jobId,
    matchId,
    socketConnected: isConnected,
  });

  // 매치 세부 정보 로딩 함수를 useCallback으로 메모이제이션
  const loadMatchDetails = useCallback(async () => {
    if (!matchId) return;

    try {
      logMatchPage("매치 상세 정보 로딩 시작", { matchId });
      setLoading(true);
      const matchData = await getMatchDetails(matchId);
      if (matchData) {
        logMatchPage("매치 상세 정보 로드 성공", {
          matchId,
          status: matchData.status,
          homeScore: matchData.result?.homeScore,
          awayScore: matchData.result?.awayScore,
        });
        setMatch(matchData);
        setShowResults(true);
      } else {
        logMatchPage("매치 상세 정보 없음", { matchId });
      }
    } catch (err) {
      logMatchPage("매치 상세 정보 로드 실패", { matchId, error: err });
    } finally {
      setLoading(false);
    }
  }, [matchId, getMatchDetails]);

  // 폴링 중지 함수를 별도로 분리하여 코드 재사용성 향상
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      logMatchPage("폴링 중지");
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // 웹소켓 이벤트 처리
  useEffect(() => {
    if (!socket || !matchId) return;

    // 매치 상태 변경 이벤트 핸들러
    const handleStatusChange = (data: any) => {
      if (data.matchId === matchId) {
        logMatchPage("웹소켓으로 매치 상태 업데이트 수신", data);

        // 매치가 종료되면 완료 처리
        if (data.status === MatchStatus.MATCH_ENDED) {
          logMatchPage("웹소켓으로 매치 종료 감지", { matchId });
          loadMatchDetails();
          stopPolling();
        }
      }
    };

    // 매치 이벤트 수신 핸들러
    const handleMatchEvent = (data: any) => {
      if (data.matchId === matchId) {
        logMatchPage("웹소켓으로 매치 이벤트 수신", data);
        // 필요시 이벤트를 상태에 반영하는 로직 추가
      }
    };

    // 이벤트 리스너 등록
    socket.on("match_status_change", handleStatusChange);
    socket.on("match_event", handleMatchEvent);

    // 정리 함수
    return () => {
      socket.off("match_status_change", handleStatusChange);
      socket.off("match_event", handleMatchEvent);
    };
  }, [socket, matchId, loadMatchDetails, stopPolling]);

  // 매치 진행 상태 폴링 함수 개선 - 웹소켓이 연결되지 않은 경우에만 폴링
  useEffect(() => {
    // 웹소켓이 연결되어 있거나, 작업 ID가 있거나, 이미 결과 표시 중이면 폴링 불필요
    if (isConnected || jobId || showResults) {
      stopPolling();
      return;
    }

    // matchId가 있고 폴링이 필요한 경우
    if (matchId && !isConnected) {
      logMatchPage("웹소켓 연결 없음, 매치 상태 폴링 시작", { matchId });

      const pollMatchStatus = async () => {
        try {
          const statusResponse = await getMatchStatus(matchId);
          logMatchPage("매치 상태 폴링 응답", {
            matchId,
            status: statusResponse.status,
            message: statusResponse.message,
          });

          // 매치가 종료되면 결과 페이지로 전환
          if (statusResponse.status === MatchStatus.MATCH_ENDED) {
            logMatchPage("매치 종료 감지", { matchId });
            loadMatchDetails();
            stopPolling();
          }
          // 각 상태에 따라 적절히 처리
          else if (
            statusResponse.status === MatchStatus.SIMULATION_ACTIVE ||
            statusResponse.status === MatchStatus.MATCH_STARTED
          ) {
            logMatchPage("매치 진행 중", {
              matchId,
              status: statusResponse.status,
            });
            setLoading(false); // 로딩 상태 해제
          }
        } catch (err) {
          logMatchPage("매치 상태 조회 실패", { matchId, error: err });
        }
      };

      // 초기 상태 확인
      pollMatchStatus();

      // 5초마다 상태 확인 (poll)
      if (!pollingIntervalRef.current) {
        logMatchPage("매치 상태 폴링 간격 설정", { interval: 5000 });
        pollingIntervalRef.current = setInterval(
          pollMatchStatus,
          5000
        ) as unknown as number;
      }

      return stopPolling;
    }

    return undefined;
  }, [matchId, jobId, showResults, loadMatchDetails, stopPolling, isConnected]);

  // 매치 공유 기능
  const handleShareMatch = useCallback(async () => {
    if (!match) return;

    try {
      setSharingStatus({ loading: true });
      logMatchPage("매치 결과 공유 요청", { matchId: match.id });

      const response = await shareMatch(match.id);
      logMatchPage("매치 결과 공유 성공", { imageUrl: response.imageUrl });

      // 공유 URL 상태 저장
      setSharingStatus({ loading: false, url: response.imageUrl });

      // 클립보드에 URL 복사
      await navigator.clipboard.writeText(response.imageUrl);

      // 간단한 알림 메시지
      alert("매치 결과 이미지 URL이 클립보드에 복사되었습니다.");
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "매치 공유 중 오류가 발생했습니다.";
      logMatchPage("매치 공유 실패", { error: errorMsg });
      setSharingStatus({ loading: false, error: errorMsg });
      alert(`매치 공유 실패: ${errorMsg}`);
    }
  }, [match]);

  // 기존 매치 ID가 있을 때 결과 로딩
  useEffect(() => {
    if (matchId && !jobId) {
      // 매치 ID가 있으면 바로 결과 가져오기
      logMatchPage("초기 매치 정보 로딩", { matchId });
      loadMatchDetails();
    }
  }, [matchId, jobId, loadMatchDetails]);

  // 폴링 중지 처리
  useEffect(() => {
    if (showResults) {
      logMatchPage("결과 표시 모드로 전환", { matchId });
      stopPolling();
    }
  }, [showResults, stopPolling]);

  // 컴포넌트 언마운트 시 폴링 정리
  useEffect(() => {
    return () => {
      logMatchPage("컴포넌트 언마운트");
      stopPolling();
    };
  }, [stopPolling]);

  const handleMatchComplete = useCallback(
    (completedMatchId: string) => {
      // 매치 완료 후 결과 페이지로 이동하기만 하고 loadMatchDetails는 useEffect에서 처리
      logMatchPage("매치 완료 처리", { completedMatchId });
      navigate(`/match/${completedMatchId}`, { replace: true });
      // loadMatchDetails는 useEffect에서 URL 변경 이후에 자동으로 호출됨
    },
    [navigate]
  );

  const handleReturnHome = useCallback(() => {
    logMatchPage("메인으로 돌아가기");
    navigate("/");
  }, [navigate]);

  const handleReplay = useCallback(() => {
    if (match) {
      // 단순히 showResults를 false로 설정하는 대신 현재 페이지로 새로 이동
      logMatchPage("매치 다시보기", { matchId: match.id });
      navigate(`/match/${match.id}`, { replace: true });
      // 페이지를 다시 로드하여 모든 상태를 초기화
      window.location.reload();
    }
  }, [match, navigate]);

  // 렌더링 조건을 useMemo로 최적화하여 불필요한 계산 방지
  const renderContent = useMemo(() => {
    logMatchPage("화면 렌더링 계산", {
      jobId,
      matchId,
      loading,
      showResults,
      hasMatch: !!match,
      hasError: !!error,
    });

    // jobId가 있으면 AIStyleLoader 통해 매치 진행 표시
    if (jobId) {
      return (
        <Suspense fallback={<LoadingIndicator>로딩 중...</LoadingIndicator>}>
          <AIStyleLoader jobId={jobId} onMatchComplete={handleMatchComplete} />
        </Suspense>
      );
    }

    // 에러 발생 시
    if (error) {
      return (
        <MatchContainer>
          <ErrorMessage>{error}</ErrorMessage>
          <Buttons>
            <Button onClick={handleReturnHome}>메인으로 돌아가기</Button>
          </Buttons>
        </MatchContainer>
      );
    }

    // 매치 ID가 있고, 로딩 중이면 로딩 인디케이터 표시
    if (matchId && loading) {
      return <LoadingIndicator>로딩 중...</LoadingIndicator>;
    }

    // 매치를 찾을 수 없는 경우
    if (!match && !loading) {
      return (
        <MatchContainer>
          <ErrorMessage>매치 정보를 찾을 수 없습니다.</ErrorMessage>
          <Buttons>
            <Button onClick={handleReturnHome}>메인으로 돌아가기</Button>
          </Buttons>
        </MatchContainer>
      );
    }

    if (match) {
      const isUserHomeTeam = user?.id === match.homeTeam.userId;
      const userWon =
        (isUserHomeTeam && match.result.winner === "home") ||
        (!isUserHomeTeam && match.result.winner === "away");
      const isDraw = match.result.winner === "draw";

      let resultMessage = "";
      if (isDraw) {
        resultMessage = "무승부입니다!";
      } else if (userWon) {
        resultMessage = "축하합니다! 승리했습니다!";
      } else {
        resultMessage = "아쉽게도 패배했습니다.";
      }

      return (
        <MatchContainer>
          <Title>
            {match.matchType === "quick" ? "빠른 대전" : "게임 대전"} 결과
          </Title>

          <ResultContainer>
            {/* 기존 결과 표시 UI 유지 */}
            <ScoreBoard>
              <TeamInfo>
                <TeamName>{isUserHomeTeam ? "나의 팀" : "상대 팀"}</TeamName>
              </TeamInfo>
              <Score>{match.result.homeScore}</Score>
              <Versus>vs</Versus>
              <Score>{match.result.awayScore}</Score>
              <TeamInfo>
                <TeamName>{isUserHomeTeam ? "상대 팀" : "나의 팀"}</TeamName>
              </TeamInfo>
            </ScoreBoard>

            <ResultMessage>{resultMessage}</ResultMessage>

            {/* 통계 및 분석 결과 렌더링 */}
            {match.statistics && (
              <StatsSection>
                <StatsTitle>경기 통계</StatsTitle>
                <StatsList>
                  <HomeStat>{match.statistics.home.possession}%</HomeStat>
                  <StatLabel>점유율</StatLabel>
                  <AwayStat>{match.statistics.away.possession}%</AwayStat>

                  <HomeStat>{match.statistics.home.shots}</HomeStat>
                  <StatLabel>슈팅</StatLabel>
                  <AwayStat>{match.statistics.away.shots}</AwayStat>

                  <HomeStat>{match.statistics.home.shotsOnTarget}</HomeStat>
                  <StatLabel>유효 슈팅</StatLabel>
                  <AwayStat>{match.statistics.away.shotsOnTarget}</AwayStat>

                  <HomeStat>{match.statistics.home.passes}</HomeStat>
                  <StatLabel>패스</StatLabel>
                  <AwayStat>{match.statistics.away.passes}</AwayStat>

                  <HomeStat>{match.statistics.home.passAccuracy}%</HomeStat>
                  <StatLabel>패스 정확도</StatLabel>
                  <AwayStat>{match.statistics.away.passAccuracy}%</AwayStat>

                  <HomeStat>{match.statistics.home.corners}</HomeStat>
                  <StatLabel>코너킥</StatLabel>
                  <AwayStat>{match.statistics.away.corners}</AwayStat>

                  <HomeStat>{match.statistics.home.fouls}</HomeStat>
                  <StatLabel>파울</StatLabel>
                  <AwayStat>{match.statistics.away.fouls}</AwayStat>
                </StatsList>
              </StatsSection>
            )}

            {match.aiAnalysis && (
              <AnalysisSection>
                <StatsTitle>AI 분석</StatsTitle>
                <div>
                  {match.aiAnalysis.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </AnalysisSection>
            )}

            {match.events && match.events.length > 0 && (
              <EventsSection>
                <StatsTitle>주요 장면</StatsTitle>
                <EventsList>
                  {match.events
                    .filter((event) => event.type === "goal")
                    .map((event, index) => (
                      <EventItem key={index} team={event.team}>
                        <EventMinute>{event.minute}'</EventMinute>
                        <EventType>
                          {event.type === "goal" ? "⚽ 골!" : event.type}
                        </EventType>
                        <EventDescription>{event.description}</EventDescription>
                      </EventItem>
                    ))}
                </EventsList>
              </EventsSection>
            )}

            <Buttons>
              <Button onClick={handleReturnHome}>메인으로 돌아가기</Button>
              <Button onClick={handleReplay}>다시 보기</Button>
              <Button
                onClick={handleShareMatch}
                disabled={sharingStatus.loading}
              >
                {sharingStatus.loading ? "공유 중..." : "결과 공유하기"}
              </Button>
            </Buttons>

            {socketError && (
              <ErrorMessage>
                웹소켓 연결 오류: {socketError}. 실시간 업데이트가 제한될 수
                있습니다.
              </ErrorMessage>
            )}
          </ResultContainer>
        </MatchContainer>
      );
    }

    return null;
  }, [
    jobId,
    matchId,
    loading,
    showResults,
    match,
    error,
    socketError,
    user,
    sharingStatus.loading,
    handleMatchComplete,
    handleReturnHome,
    handleReplay,
    handleShareMatch,
  ]);

  return renderContent;
};

export default MatchPage;
