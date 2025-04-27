import React, { useEffect } from 'react';
import { useMatch } from '../../context/MatchContext';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  StatusText, 
  ProgressBar, 
  ProgressFill,
  ErrorMessage,
  StatusTitle,
  LoadingSpinner,
  SuccessIcon,
  ErrorIcon,
  Button
} from './styled';

interface JobStatusTrackerProps {
  jobId: string;
  onComplete?: (matchId: string) => void;
}

// 로그 헬퍼 함수
const logJob = (action: string, data?: any) => {
  console.log(`[JobStatusTracker] ${action}`, data || "");
};

const JobStatusTracker: React.FC<JobStatusTrackerProps> = ({ jobId, onComplete }) => {
  const { 
    jobStatus, 
    subscribeToJob, 
    unsubscribeFromJob,
    currentJobId 
  } = useMatch();
  const navigate = useNavigate();

  // 작업 상태가 없거나 작업 ID가 현재 작업 ID와 다르면 상태를 구독
  useEffect(() => {
    if (!jobId) return;
    
    if (!currentJobId || currentJobId !== jobId) {
      logJob('작업 구독', { jobId });
      subscribeToJob(jobId);
    }
    
    // 컴포넌트 언마운트 시 구독 취소
    return () => {
      logJob('작업 구독 취소', { jobId });
      unsubscribeFromJob(jobId);
    };
  }, [jobId, currentJobId, subscribeToJob, unsubscribeFromJob]);

  // 작업 완료 시 콜백 호출 또는 페이지 이동
  useEffect(() => {
    const status = jobStatus[jobId];
    
    if (status?.status === 'completed' && status.result?.matchId) {
      logJob('작업 완료', { jobId, matchId: status.result.matchId });
      
      if (onComplete) {
        onComplete(status.result.matchId);
      } else {
        // 완료 콜백이 없으면 매치 페이지로 리디렉션
        navigate(`/match/${status.result.matchId}`, { replace: true });
      }
    }
  }, [jobId, jobStatus, onComplete, navigate]);

  // 컴포넌트 렌더링
  if (!jobId || !jobStatus[jobId]) {
    return (
      <Container>
        <LoadingSpinner />
        <StatusText>작업 상태를 가져오는 중...</StatusText>
      </Container>
    );
  }

  const status = jobStatus[jobId];

  // 작업 상태에 따른 UI 렌더링
  switch (status.status) {
    case 'pending':
      return (
        <Container>
          <LoadingSpinner />
          <StatusTitle>매치 준비 중</StatusTitle>
          <StatusText>작업이 곧 시작됩니다...</StatusText>
        </Container>
      );
      
    case 'processing':
      return (
        <Container>
          <LoadingSpinner />
          <StatusTitle>매치 진행 중</StatusTitle>
          <StatusText>
            {status.progress !== undefined 
              ? `진행률: ${Math.round(status.progress * 100)}%` 
              : '경기가 진행 중입니다...'}
          </StatusText>
          {status.progress !== undefined && (
            <ProgressBar>
              <ProgressFill width={Math.round(status.progress * 100)} />
            </ProgressBar>
          )}
        </Container>
      );
      
    case 'completed':
      return (
        <Container>
          <SuccessIcon />
          <StatusTitle>매치 완료!</StatusTitle>
          <StatusText>
            {status.result?.message || '매치가 성공적으로 생성되었습니다.'}
          </StatusText>
          {!onComplete && status.result?.matchId && (
            <Button onClick={() => navigate(`/match/${status.result.matchId}`)}>
              매치 결과 보기
            </Button>
          )}
        </Container>
      );
      
    case 'failed':
      return (
        <Container>
          <ErrorIcon />
          <StatusTitle>매치 생성 실패</StatusTitle>
          <ErrorMessage>
            {status.error || '알 수 없는 오류가 발생했습니다.'}
          </ErrorMessage>
          <Button onClick={() => navigate('/')}>
            메인으로 돌아가기
          </Button>
        </Container>
      );
      
    default:
      return (
        <Container>
          <LoadingSpinner />
          <StatusText>매치 상태 확인 중...</StatusText>
        </Container>
      );
  }
};

export default JobStatusTracker;