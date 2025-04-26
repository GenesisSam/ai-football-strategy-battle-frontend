import styled from "styled-components";

// 로딩 중 표시할 컴포넌트
export const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
`;

export const MatchContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.large};
`;

export const ResultContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.large};
`;

export const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

export const ScoreBoard = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: ${({ theme }) => theme.spacing.large} 0;
`;

export const TeamInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
`;

export const TeamName = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

export const Score = styled.div`
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

export const Versus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 ${({ theme }) => theme.spacing.small};
`;

export const ResultMessage = styled.div`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.secondary};
  margin: ${({ theme }) => theme.spacing.large} 0;
  text-align: center;
`;

export const StatsSection = styled.section`
  margin-top: ${({ theme }) => theme.spacing.large};
  width: 100%;
  max-width: 800px;
`;

export const StatsTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.light};
  padding-bottom: ${({ theme }) => theme.spacing.small};
`;

export const StatsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 1fr;
  gap: ${({ theme }) => theme.spacing.small};
`;

export const StatLabel = styled.span`
  text-align: center;
  font-weight: bold;
`;

export const HomeStat = styled.span`
  text-align: right;
  padding-right: ${({ theme }) => theme.spacing.small};
`;

export const AwayStat = styled.span`
  text-align: left;
  padding-left: ${({ theme }) => theme.spacing.small};
`;

export const AnalysisSection = styled.section`
  margin-top: ${({ theme }) => theme.spacing.large};
  width: 100%;
  max-width: 800px;
  padding: ${({ theme }) => theme.spacing.medium};
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
`;

export const EventsSection = styled.section`
  margin-top: ${({ theme }) => theme.spacing.large};
  width: 100%;
  max-width: 800px;
`;

export const EventsList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

export const EventItem = styled.li<{ team: "home" | "away" }>`
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

export const EventMinute = styled.span`
  font-weight: bold;
  margin-right: ${({ theme }) => theme.spacing.small};
  color: ${({ theme }) => theme.colors.text};
`;

export const EventType = styled.span`
  font-weight: bold;
  margin-right: ${({ theme }) => theme.spacing.small};
`;

export const EventDescription = styled.span`
  flex: 1;
`;

export const Buttons = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.medium};
  margin: ${({ theme }) => theme.spacing.large} 0;
`;

export const Button = styled.button`
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

export const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  background-color: rgba(219, 68, 55, 0.1);
  padding: ${({ theme }) => theme.spacing.medium};
  border-radius: 4px;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  text-align: center;
`;
