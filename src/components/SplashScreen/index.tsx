import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

// 축구장 전략판 애니메이션 스타일 컴포넌트
const SplashContainer = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.primary};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  transition: opacity 0.5s ease-in-out;
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  pointer-events: ${(props) => (props.$isVisible ? "all" : "none")};
`;

const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

const scaleIn = keyframes`
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

const SplashTitle = styled.h1`
  color: white;
  font-size: 2.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  text-align: center;
  animation: ${fadeIn} 0.6s ease-in-out forwards;
  opacity: 0;
  animation-delay: 1s;
`;

// 축구장 스타일
const FootballField = styled.div`
  width: 280px;
  height: 400px;
  background-color: #4c9141; /* 축구장 녹색 */
  border: 4px solid white;
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.large};
  animation: ${scaleIn} 0.5s ease-in-out forwards;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);

  /* 중앙선 */
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: white;
    transform: translateY(-50%);
  }
`;

// 중앙 원
const CenterCircle = styled.div`
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid white;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  /* 중앙 점 */
  &::after {
    content: "";
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: white;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

// 골대 영역
const GoalArea = styled.div`
  position: absolute;
  width: 120px;
  height: 50px;
  border: 2px solid white;
  left: 50%;
  transform: translateX(-50%);

  &.top {
    top: 0;
  }

  &.bottom {
    bottom: 0;
  }
`;

// 선수 포인트 애니메이션
const fadeInScale = keyframes`
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

// 선 애니메이션
const drawLine = keyframes`
  0% { width: 0; }
  100% { width: 100%; }
`;

// 선수 포인트
const PlayerPoint = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: white;
  transform: translate(-50%, -50%);
  animation: ${fadeInScale} 0.3s forwards;
  opacity: 0;
  z-index: 2;
`;

// 선수 연결선
const PlayerLine = styled.div`
  position: absolute;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.6);
  animation: ${drawLine} 0.3s forwards;
  transform-origin: left center;
  z-index: 1;
`;

interface Position {
  top: string;
  left: string;
}

interface PlayerConnection {
  from: number;
  to: number;
}

interface SplashScreenProps {
  duration?: number;
  onFinish?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  duration = 3000,
  onFinish,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [playerPoints, setPlayerPoints] = useState<Position[]>([]);
  const [playerConnections, setPlayerConnections] = useState<
    PlayerConnection[]
  >([]);

  // 선수 포지션 좌표 (4-3-3 포메이션)
  const positions = [
    { top: "85%", left: "50%" }, // GK
    { top: "70%", left: "20%" }, // LB
    { top: "70%", left: "40%" }, // CB
    { top: "70%", left: "60%" }, // CB
    { top: "70%", left: "80%" }, // RB
    { top: "50%", left: "30%" }, // LM
    { top: "50%", left: "50%" }, // CM
    { top: "50%", left: "70%" }, // RM
    { top: "30%", left: "20%" }, // LW
    { top: "23%", left: "50%" }, // ST
    { top: "30%", left: "80%" }, // RW
  ];

  // 선수 연결 관계
  const connections = [
    { from: 0, to: 2 }, // GK to CB
    { from: 0, to: 3 }, // GK to CB
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 1, to: 5 },
    { from: 2, to: 6 },
    { from: 3, to: 6 },
    { from: 4, to: 7 },
    { from: 5, to: 6 },
    { from: 6, to: 7 },
    { from: 5, to: 8 },
    { from: 6, to: 9 },
    { from: 7, to: 10 },
    { from: 8, to: 9 },
    { from: 9, to: 10 },
  ];

  // 점진적인 포인트 애니메이션
  useEffect(() => {
    const pointTimer = setTimeout(() => {
      setPlayerPoints(positions);
    }, 500);

    // 연결선 애니메이션은 포인트 애니메이션 후에 시작
    const lineTimer = setTimeout(() => {
      setPlayerConnections(connections);
    }, 800);

    // 스플래시 화면 사라지기
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    // 애니메이션 완료 후 콜백 함수 호출
    const finishTimer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, duration + 500); // 페이드 아웃 시간 추가

    // 타이머 클린업
    return () => {
      clearTimeout(pointTimer);
      clearTimeout(lineTimer);
      clearTimeout(hideTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  // 두 포인트 사이의 선 스타일 계산
  const calculateLineStyle = (from: number, to: number) => {
    const fromPos = positions[from];
    const toPos = positions[to];

    // % 단위를 숫자로 변환
    const fromTop = parseFloat(fromPos.top);
    const fromLeft = parseFloat(fromPos.left);
    const toTop = parseFloat(toPos.top);
    const toLeft = parseFloat(toPos.left);

    // 각도 계산 (라디안)
    const angleRad = Math.atan2(toTop - fromTop, toLeft - fromLeft);
    // 각도를 도로 변환
    const angleDeg = (angleRad * 180) / Math.PI;

    // 두 점 사이의 거리 계산 (픽셀 기준이 아닌 % 비율)
    const distance = Math.sqrt(
      Math.pow(toLeft - fromLeft, 2) + Math.pow(toTop - fromTop, 2)
    );

    return {
      width: `${distance}%`,
      height: "2px",
      top: `${fromTop}%`,
      left: `${fromLeft}%`,
      transform: `rotate(${angleDeg}deg)`,
      transformOrigin: "left center",
      position: "absolute" as const,
      backgroundColor: "rgba(255, 255, 255, 0.6)",
      zIndex: 1,
      animationDelay: `${0.8 + Math.random() * 0.5}s`,
    };
  };

  return (
    <SplashContainer $isVisible={isVisible}>
      <SplashTitle>AI 축구 전략 배틀</SplashTitle>
      <FootballField>
        <CenterCircle />
        <GoalArea className="top" />
        <GoalArea className="bottom" />

        {/* 선수 포지션 포인트 */}
        {playerPoints.map((position, idx) => (
          <PlayerPoint
            key={`point-${idx}`}
            style={{
              top: position.top,
              left: position.left,
              animationDelay: `${0.5 + idx * 0.1}s`,
            }}
          />
        ))}

        {/* 선수 연결선 */}
        {playerConnections.map(({ from, to }, idx) => (
          <PlayerLine
            key={`line-${idx}`}
            style={calculateLineStyle(from, to)}
          />
        ))}
      </FootballField>
    </SplashContainer>
  );
};

export default SplashScreen;
