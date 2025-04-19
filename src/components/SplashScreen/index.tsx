import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

// 축구장 전략판 애니메이션 스타일 컴포넌트
const SplashContainer = styled.div<{ isVisible: boolean }>`
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
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  pointer-events: ${(props) => (props.isVisible ? "all" : "none")};
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
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  duration = 1800,
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
    { from: 1, to: 2 }, // LB to CB
    { from: 2, to: 3 }, // CB to CB
    { from: 3, to: 4 }, // CB to RB
    { from: 1, to: 5 }, // LB to LM
    { from: 2, to: 6 }, // CB to CM
    { from: 3, to: 6 }, // CB to CM
    { from: 4, to: 7 }, // RB to RM
    { from: 5, to: 6 }, // LM to CM
    { from: 6, to: 7 }, // CM to RM
    { from: 5, to: 8 }, // LM to LW
    { from: 6, to: 9 }, // CM to ST
    { from: 7, to: 10 }, // RM to RW
    { from: 8, to: 9 }, // LW to ST
    { from: 9, to: 10 }, // ST to RW
  ];

  useEffect(() => {
    // 선수 포인트 순차적 애니메이션
    let delay = 150; // 첫 선수 등장까지 딜레이

    positions.forEach((pos, index) => {
      setTimeout(() => {
        setPlayerPoints((prev) => [...prev, pos]);
      }, delay + index * 60); // 각 선수마다 60ms 차이
    });

    // 연결선 애니메이션 총 소요 시간 계산
    const playerAnimationTime = delay + positions.length * 60;
    const connectionAnimationTime = connections.length * 40;

    // 선수 연결선 순차적 애니메이션
    setTimeout(() => {
      connections.forEach((conn, index) => {
        setTimeout(() => {
          setPlayerConnections((prev) => [...prev, conn]);
        }, index * 40); // 각 연결선마다 40ms 차이
      });
    }, playerAnimationTime + 100); // 마지막 선수 등장 후 100ms 뒤 시작

    // 모든 애니메이션(선수 + 연결선) 완료 후 500ms 동안 완성된 화면 유지 후 사라짐
    const allAnimationTime =
      playerAnimationTime + 100 + connectionAnimationTime;
    const completedViewTime = 500; // 완성된 화면 감상 시간

    // 전체 애니메이션 종료 후 스플래시 화면 숨김
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500); // 페이드 아웃
    }, allAnimationTime + completedViewTime);

    return () => clearTimeout(timer);
  }, [duration, onFinish]);

  const getLineProps = (from: number, to: number) => {
    // 연결선 위치 및 각도 계산
    if (playerPoints.length <= Math.max(from, to)) return null;

    const fromPos = positions[from];
    const toPos = positions[to];

    const fromTop = parseFloat(fromPos.top) / 100;
    const fromLeft = parseFloat(fromPos.left) / 100;
    const toTop = parseFloat(toPos.top) / 100;
    const toLeft = parseFloat(toPos.left) / 100;

    // 시작점과 끝점 좌표
    const x1 = fromLeft;
    const y1 = fromTop;
    const x2 = toLeft;
    const y2 = toTop;

    // 길이 계산
    const length = Math.sqrt(
      Math.pow((x2 - x1) * 280, 2) + Math.pow((y2 - y1) * 400, 2)
    );

    // 각도 계산
    const angle =
      (Math.atan2((y2 - y1) * 400, (x2 - x1) * 280) * 180) / Math.PI;

    return {
      width: `${length}px`,
      top: `${fromTop * 100}%`,
      left: `${fromLeft * 100}%`,
      transform: `rotate(${angle}deg)`,
    };
  };

  return (
    <SplashContainer isVisible={isVisible}>
      <FootballField>
        <CenterCircle />
        <GoalArea className="top" />
        <GoalArea className="bottom" />

        {/* 선수 포인트 */}
        {playerPoints.map((pos, index) => (
          <PlayerPoint
            key={`player-${index}`}
            style={{ top: pos.top, left: pos.left }}
          />
        ))}

        {/* 선수 연결선 */}
        {playerConnections.map((conn, index) => {
          const lineProps = getLineProps(conn.from, conn.to);
          return lineProps ? (
            <PlayerLine key={`line-${index}`} style={lineProps} />
          ) : null;
        })}
      </FootballField>
      <SplashTitle>AI 축구 전략 배틀</SplashTitle>
    </SplashContainer>
  );
};

export default SplashScreen;
