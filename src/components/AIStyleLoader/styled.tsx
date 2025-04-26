import styled from "styled-components";

export const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 100;
`;

export const LoadingText = styled.h2`
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2rem;
  text-align: center;
`;

export const StatusMessage = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 1rem;
  max-width: 600px;
  text-align: center;
`;

export const ScoreDisplay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0;
  font-size: 2.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

export const TeamName = styled.span`
  padding: 0 1.5rem;
`;

export const Score = styled.span`
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: white;
  margin: 0 1rem;
`;

export const LoadingBar = styled.div`
  width: 300px;
  height: 10px;
  background-color: ${({ theme }) => theme.colors.light};
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

export const LoadingProgress = styled.div<{ width: number }>`
  height: 100%;
  width: ${({ width }) => width}%;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 5px;
  transition: width 0.3s ease-in-out;
`;

export const LogsContainer = styled.div`
  width: 80%;
  max-width: 800px;
  max-height: 300px;
  overflow-y: auto;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  margin-top: 2rem;
`;

export const LogEntry = styled.div`
  padding: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.light};
  display: flex;
  align-items: flex-start;

  &:last-child {
    border-bottom: none;
  }
`;

export const LogTime = styled.span`
  color: ${({ theme }) => theme.colors.secondary};
  margin-right: 1rem;
  font-weight: bold;
  min-width: 50px;
`;

export const LogMessage = styled.span`
  color: ${({ theme }) => theme.colors.text};
`;
