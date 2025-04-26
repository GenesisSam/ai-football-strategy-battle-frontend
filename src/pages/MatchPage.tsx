import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  Suspense,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useMatch } from "../context/MatchContext";
import { useAuth } from "../context/AuthContext";
import { MatchData, MatchStatus } from "../types/global.d";
import { getMatchStatus } from "../api/match";

// 로그 헬퍼 함수
const logMatchPage = (action: string, data?: any) => {
  console.log(`[MatchPage] ${action}`, data || "");
};

// AIStyleLoader를 지연 로딩으로 변경
const AIStyleLoader = React.lazy(() => import("../components/AIStyleLoader"));

// 로딩 중 표시할 컴포넌트
const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const MatchContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.large};
`;

const ResultContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.large};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const ScoreBoard = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: ${({ theme }) => theme.spacing.large} 0;
`;

const TeamInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
`;

const TeamName = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

const Score = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  padding: ${({ theme }) => theme.spacing.medium};
  margin: 0 ${({ theme }) => theme.spacing.medium};
  min-width: 80px;
  text-align: center;
  border-radius: 8px;
`;

const Versus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 ${({ theme }) => theme.spacing.small};
`;

const ResultMessage = styled.div`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.secondary};
  margin: ${({ theme }) => theme.spacing.large} 0;
  text-align: center;
`;

const StatsSection = styled.section`
  margin-top: ${({ theme }) => theme.spacing.large};
  width: 100%;
  max-width: 800px;
`;

const StatsTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.light};
  padding-bottom: ${({ theme }) => theme.spacing.small};
`;

const StatsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 1fr;
  gap: ${({ theme }) => theme.spacing.small};
`;

const StatLabel = styled.span`
  text-align: center;
  font-weight: bold;
`;

const HomeStat = styled.span`
  text-align: right;
  padding-right: ${({ theme }) => theme.spacing.small};
`;

const AwayStat = styled.span`
  text-align: left;
  padding-left: ${({ theme }) => theme.spacing.small};
`;

const AnalysisSection = styled.section`
  margin-top: ${({ theme }) => theme.spacing.large};
  width: 100%;
  max-width: 800px;
  padding: ${({ theme }) => theme.spacing.medium};
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
`;

const EventsSection = styled.section`
  margin-top: ${({ theme }) => theme.spacing.large};
  width: 100%;
  max-width: 800px;
`;

const EventsList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const EventItem = styled.li<{ team: "home" | "away" }>`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.small};
  margin-bottom: ${({ theme }) => theme.spacing.small};
  background-color: ${({ team }) =>
    team === "home" ? "rgba(66, 133, 244, 0.1)" : "rgba(219, 68, 55, 0.1)"};
  border-radius: 4px;
  border-left: 4px solid
    ${({ team, theme }) =>
      team === "home" ? theme.colors.primary : theme.colors.secondary};
`;

const EventMinute = styled.span`
  font-weight: bold;
  margin-right: ${({ theme }) => theme.spacing.small};
  color: ${({ theme }) => theme.colors.text};
`;

const EventType = styled.span`
  font-weight: bold;
  margin-right: ${({ theme }) => theme.spacing.small};
`;

const EventDescription = styled.span`
  flex: 1;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.medium};
  margin: ${({ theme }) => theme.spacing.large} 0;
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.small}
    ${({ theme }) => theme.spacing.large};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  background-color: rgba(219, 68, 55, 0.1);
  padding: ${({ theme }) => theme.spacing.medium};
  border-radius: 4px;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  text-align: center;
`;

const MatchPage: React.FC = () => {
  const { jobId, matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getMatchDetails, error } = useMatch();

  const [loading, setLoading] = useState<boolean>(true);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

  // interval을 useRef로 관리하여 불필요한 리렌더링 방지
  const pollingIntervalRef = useRef<number | null>(null);

  logMatchPage("컴포넌트 초기화", { jobId, matchId });

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

  // 매치 상태 poll 구동 - 의존성 배열 최적화
  useEffect(() => {
    // 작업 ID가 있을 경우에는 AIStyleLoader에서 소켓으로 처리하므로 poll 불필요
    if (matchId && !jobId && !showResults) {
      logMatchPage("매치 상태 폴링 시작", { matchId });

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
            // 매치가 진행 중일 때도 주기적으로 상태 업데이트
            setLoading(false); // 로딩 상태 해제
          }
        } catch (err) {
          logMatchPage("매치 상태 조회 실패", { matchId, error: err });
        }
      };

      // 초기 상태 확인
      pollMatchStatus();

      // 5초마다 상태 확인 (poll)
      logMatchPage("매치 상태 폴링 간격 설정", { interval: 5000 });
      pollingIntervalRef.current = setInterval(
        pollMatchStatus,
        5000
      ) as unknown as number;

      return stopPolling;
    }

    return undefined;
  }, [matchId, jobId, showResults, loadMatchDetails, stopPolling]);

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

    // 매치가 있지만 showResults가 false인 경우 (결과를 표시하지 않는 경우)
    // 이 부분이 무한 루프를 일으킬 수 있어 조건을 제거하고 바로 결과를 표시
    // if (!showResults && match) {
    //   return (
    //     <Suspense fallback={<LoadingIndicator>로딩 중...</LoadingIndicator>}>
    //       <AIStyleLoader
    //         matchId={match.id}
    //         onMatchComplete={handleMatchComplete}
    //       />
    //     </Suspense>
    //   );
    // }

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
            </Buttons>
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
    user,
    handleMatchComplete,
    handleReturnHome,
    handleReplay,
  ]);

  return renderContent;
};

export default MatchPage;
