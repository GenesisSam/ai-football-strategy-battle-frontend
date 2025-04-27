import styled, { keyframes } from 'styled-components';

// 애니메이션 정의
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
`;

export const StatusTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1rem 0 0.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

export const StatusText = styled.p`
  font-size: 1rem;
  margin: 0.5rem 0 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: 5px;
  margin: 1rem 0;
  overflow: hidden;
`;

interface ProgressFillProps {
  width: number;
}

export const ProgressFill = styled.div<ProgressFillProps>`
  height: 100%;
  width: ${props => props.width}%;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 5px;
  transition: width 0.3s ease;
`;

export const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 1rem;
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 0, 0, 0.1);
  border-radius: 4px;
  border-left: 3px solid ${({ theme }) => theme.colors.error};
`;

export const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 1rem;
`;

export const SuccessIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.success};
  color: white;
  font-size: 2rem;
  margin-bottom: 1rem;
  animation: ${pulse} 1s ease-in-out;
  
  &:before {
    content: "✓";
  }
`;

export const ErrorIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
  font-size: 2rem;
  margin-bottom: 1rem;
  
  &:before {
    content: "✕";
  }
`;

export const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
  }
`;