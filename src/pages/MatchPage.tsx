import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useMatch } from "../context/MatchContext";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import AIStyleLoader from "../components/AIStyleLoader";
import { MatchData } from "../types/global";

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

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.xsmall} 0;
  &:nth-child(odd) {
    background-color: rgba(0, 0, 0, 0.02);
  }
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
  background-color: ${({ team, theme }) =>
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
  const { getMatchDetails, currentMatch, error } = useMatch();
  const socket = useSocket();

  const [loading, setLoading] = useState<boolean>(true);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

  useEffect(() => {
    if (matchId && !jobId) {
      // 매치 ID가 있으면 바로 결과 가져오기
      loadMatchDetails();
    }
  }, [matchId]);

  const loadMatchDetails = async () => {
    if (!matchId) return;

    try {
      setLoading(true);
      const matchData = await getMatchDetails(matchId);
      if (matchData) {
        setMatch(matchData);
        setShowResults(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMatchComplete = (completedMatchId: string) => {
    // 매치 완료 후 결과 페이지로 이동하거나 결과를 표시
    navigate(`/match/${completedMatchId}`, { replace: true });
    loadMatchDetails(); // 결과 로딩
  };

  const handleReturnHome = () => {
    navigate("/");
  };

  const handleReplay = () => {
    if (match) {
      setShowResults(false);
    }
  };

  if (jobId) {
    return (
      <AIStyleLoader jobId={jobId} onMatchComplete={handleMatchComplete} />
    );
  }

  if (matchId && loading) {
    return (
      <AIStyleLoader matchId={matchId} onMatchComplete={handleMatchComplete} />
    );
  }

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

  if (!showResults && match) {
    return (
      <AIStyleLoader matchId={match.id} onMatchComplete={handleMatchComplete} />
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
};

export default MatchPage;
