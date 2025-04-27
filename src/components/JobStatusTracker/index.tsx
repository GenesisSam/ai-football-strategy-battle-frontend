import React, { useEffect } from "react";
import { useMatch } from "../../context/MatchContext";
import { useNavigate } from "react-router-dom";
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
  Button,
} from "./styled";

interface JobStatusTrackerProps {
  jobId: string;
  onComplete?: (matchId: string) => void;
}

// 로그 헬퍼 함수
const logJob = (action: string, data?: any) => {
  console.log(`[JobStatusTracker] ${action}`, data || "");
};

/**
 * 백지화된 JobStatusTracker 컴포넌트
 * 현재 서버측에서 작업 추적 기능이 백지화되었으므로 대체 UI를 표시합니다.
 */
const JobStatusTracker: React.FC<JobStatusTrackerProps> = ({
  jobId,
  onComplete,
}) => {
  const navigate = useNavigate();

  // 로그 남기기
  useEffect(() => {
    logJob("작업 추적기 초기화 (백지화된 기능)", { jobId });
    return () => {
      logJob("작업 추적기 정리 (백지화된 기능)", { jobId });
    };
  }, [jobId]);

  // 백지화된 기능을 알리는 화면 표시
  return (
    <Container>
      <LoadingSpinner />
      <StatusTitle>매치 처리 중</StatusTitle>
      <StatusText>
        매치 생성 요청이 처리되고 있습니다.
        <br />
        잠시 후 매치 결과를 확인할 수 있습니다.
      </StatusText>
      <ProgressBar>
        <ProgressFill width={50} /> {/* 진행률 50% 고정 표시 */}
      </ProgressBar>
      <StatusText style={{ marginTop: "20px", fontSize: "14px", opacity: 0.7 }}>
        참고: 현재 실시간 작업 상태 추적 기능은 구현되지 않았습니다.
      </StatusText>
      <Button onClick={() => navigate("/")}>메인으로 돌아가기</Button>
    </Container>
  );
};

export default JobStatusTracker;
