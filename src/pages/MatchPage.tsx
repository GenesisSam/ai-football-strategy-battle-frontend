import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MatchContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.large};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

// 사이버틱한 로딩 애니메이션 효과
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.7);
    transform: scale(0.95);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(66, 133, 244, 0);
    transform: scale(1);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(66, 133, 244, 0);
    transform: scale(0.95);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const scan = keyframes`
  0% {
    height: 0%;
    opacity: 0.8;
  }
  50% {
    height: 100%;
    opacity: 0.3;
  }
  100% {
    height: 0%;
    opacity: 0.8;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 2rem;
`;

const LoadingCircle = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(30, 42, 73, 0.8);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 2s infinite;

  &:before {
    content: "";
    position: absolute;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    border: 2px solid ${({ theme }) => theme.colors.primary};
    border-top: 2px solid transparent;
    border-left: 2px solid transparent;
    animation: ${rotate} 3s linear infinite;
  }

  &:after {
    content: "";
    position: absolute;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    border: 2px dashed rgba(66, 133, 244, 0.6);
    border-right: 2px dashed transparent;
    border-bottom: 2px dashed transparent;
    animation: ${rotate} 2s linear infinite reverse;
  }
`;

const InnerCircle = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(25, 118, 210, 0.5),
    rgba(66, 133, 244, 0.2)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  z-index: 2;
  box-shadow: 0 0 20px rgba(66, 133, 244, 0.5) inset;
`;

const ScanLine = styled.div`
  position: absolute;
  width: 100%;
  height: 10px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(66, 133, 244, 0.8),
    transparent
  );
  animation: ${scan} 2s infinite;
  z-index: 1;
`;

const LoadingText = styled.div`
  margin-top: 2rem;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
  letter-spacing: 0.5px;
  text-align: center;
`;

// 경기 시작 후 UI
const FieldContainer = styled.div`
  width: 100%;
  min-height: 70vh;
  background-image: url("/soccer-field.jpg");
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.medium};
`;

const ChatContainer = styled.div`
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.medium};
  color: white;
  margin-top: auto;
  max-height: 300px;
  overflow-y: auto;
  scroll-behavior: smooth; // 부드러운 스크롤 효과 추가
`;

const LogMessage = styled.div<{ isOurTeam?: boolean; isSystem?: boolean }>`
  margin: 5px 0;
  padding: 8px;
  border-radius: 4px;
  background: ${(props) =>
    props.isSystem
      ? "rgba(255, 255, 255, 0.2)"
      : props.isOurTeam
      ? "rgba(66, 133, 244, 0.2)"
      : "rgba(244, 67, 54, 0.2)"};
  color: ${(props) =>
    props.isSystem ? "#ffffff" : props.isOurTeam ? "#a3cfff" : "#ffb3ad"};
  font-weight: ${(props) => (props.isSystem ? "normal" : "bold")};
`;

const GameTimeDisplay = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  padding: 5px 15px;
  border-radius: 4px;
`;

const GameTimeTag = styled.span`
  background-color: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  padding: 2px 5px;
  border-radius: 3px;
  margin-right: 8px;
  font-size: 0.8rem;
  font-weight: bold;
`;

const ResultContainer = styled.div`
  background: rgba(0, 0, 0, 0.85);
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.large};
  color: white;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ResultTitle = styled.h2`
  color: #fff;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  text-align: center;
  font-size: 2rem;
`;

const ScoreDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.large};
  width: 100%;
`;

const TeamScore = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.medium};
  width: 40%;
`;

const TeamName = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const Score = styled.div`
  font-size: 3.5rem;
  font-weight: bold;
`;

const ScoreSeparator = styled.div`
  font-size: 2rem;
  padding: 0 ${({ theme }) => theme.spacing.medium};
`;

const StatSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.medium};
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
`;

const ChartContainer = styled.div`
  width: 45%;
  min-width: 300px;
  height: 250px;
  margin: ${({ theme }) => theme.spacing.medium} 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.medium};
`;

const ChartTitle = styled.h4`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.small};
  text-align: center;
`;

const ShareButton = styled.button`
  margin-top: ${({ theme }) => theme.spacing.large};
  padding: ${({ theme }) => theme.spacing.small}
    ${({ theme }) => theme.spacing.medium};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// 결과 표시 컴포넌트 스타일 추가
const ResultStatus = styled.div<{ result: "승리" | "무승부" | "패배" }>`
  font-size: 2rem;
  font-weight: bold;
  margin: 1rem 0;
  padding: 0.5rem 2rem;
  border-radius: 8px;
  background: ${({ result }) =>
    result === "승리"
      ? "rgba(0, 128, 0, 0.3)"
      : result === "무승부"
      ? "rgba(255, 165, 0, 0.3)"
      : "rgba(255, 0, 0, 0.3)"};
  color: ${({ result }) =>
    result === "승리"
      ? "#4caf50"
      : result === "무승부"
      ? "#ff9800"
      : "#f44336"};
`;

const AiComment = styled.div`
  background: rgba(66, 133, 244, 0.1);
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  padding: 1rem;
  margin: 1rem 0;
  font-style: italic;
  border-radius: 0 8px 8px 0;
  width: 80%;
  text-align: center;
  font-size: 1.1rem;
`;

// 스쿼드 표시를 위한 스타일 컴포넌트 추가
const SquadsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.large};
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const TeamSquadContainer = styled.div`
  width: 45%;
  min-width: 300px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.medium};
  margin: ${({ theme }) => theme.spacing.medium} 0;
`;

const TeamTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.small};
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: ${({ theme }) => theme.spacing.small};
`;

const FormationText = styled.div`
  font-size: 1.2rem;
  text-align: center;
  font-weight: bold;
  margin: ${({ theme }) => theme.spacing.small} 0;
  color: #e0e0e0;
`;

const LineupContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.small};
  margin-top: ${({ theme }) => theme.spacing.medium};
`;

const PlayerItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.small};
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  margin-bottom: 4px;
`;

const PlayerPosition = styled.span`
  font-weight: bold;
  width: 30px;
  color: ${(props) => {
    switch (props.children) {
      case "GK":
        return "#ffeb3b";
      case "DF":
        return "#2196f3";
      case "MF":
        return "#4caf50";
      case "FW":
        return "#f44336";
      default:
        return "#9e9e9e";
    }
  }};
  margin-right: ${({ theme }) => theme.spacing.small};
`;

const PlayerName = styled.span`
  flex-grow: 1;
`;

const PlayerRating = styled.span`
  color: #f57c00;
  font-weight: bold;
`;

const MiniPitchContainer = styled.div`
  position: relative;
  height: 200px;
  width: 100%;
  background-color: #2e7d32;
  margin: ${({ theme }) => theme.spacing.medium} 0;
  border-radius: 4px;
  overflow: hidden;
`;

const MiniPitchLines = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.3) 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 1px, transparent 1px);
  background-size: 50px 50px;
  z-index: 1;

  &:before,
  &:after {
    content: "";
    position: absolute;
    border: 2px solid rgba(255, 255, 255, 0.7);
  }

  &:before {
    width: 70%;
    height: 30%;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    border-bottom: 2px solid rgba(255, 255, 255, 0.7);
    border-top: none;
  }

  &:after {
    width: 70%;
    height: 30%;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    border-top: 2px solid rgba(255, 255, 255, 0.7);
    border-bottom: none;
  }
`;

const MiniPitchCenter = styled.div`
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.7);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  &:before {
    content: "";
    position: absolute;
    width: 4px;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &:after {
    content: "";
    position: absolute;
    height: 100%;
    width: 1px;
    background-color: rgba(255, 255, 255, 0.7);
    top: 0;
    left: 50%;
  }
`;

const PlayerDot = styled.div<{ x: number; y: number; isOurTeam: boolean }>`
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${(props) => (props.isOurTeam ? "#4caf50" : "#f44336")};
  border: 1px solid white;
  left: ${(props) => props.x}%;
  top: ${(props) => props.y}%;
  transform: translate(-50%, -50%);
  z-index: 2;
  font-size: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

interface GameLog {
  message: string;
  isOurTeam: boolean;
  isSystem: boolean;
  timestamp: number;
  gameTime?: string; // 경기 진행 시간 추가
}

interface Player {
  id: number;
  name: string;
  position: string; // "GK" | "DF" | "MF" | "FW"
  rating: number;
}

interface Squad {
  formation: string;
  players: Player[];
  positions: {
    id: string;
    x: number;
    y: number;
    position: string;
    playerId?: number;
  }[];
}

interface GameResult {
  ourTeamScore: number;
  opponentScore: number;
  result: "승리" | "무승부" | "패배"; // 승/무/패 정보 추가
  aiComment: string; // AI 평가 한줄평 추가
  possession: {
    ourTeam: number;
    opponent: number;
  };
  passes: {
    ourTeam: number;
    opponent: number;
  };
  shots: {
    ourTeam: number;
    opponent: number;
    ourTeamOnTarget: number;
    opponentOnTarget: number;
  };
  attacks: {
    ourTeam: number;
    opponent: number;
    ourTeamDangerous: number;
    opponentDangerous: number;
  };
  ourTeamSquad: Squad;
  opponentSquad: Squad;
}

// localStorage에서 전략 데이터 관리를 위한 키
const STRATEGIES_STORAGE_KEY = "football-strategies";

const MatchPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] =
    useState("대전 상대를 찾고 있습니다.");
  const [matchLogs, setMatchLogs] = useState<GameLog[]>([]);
  const [gameTimer, setGameTimer] = useState(0); // 경기 시간을 초 단위로 추적
  const [gameStarted, setGameStarted] = useState(false); // 경기 시작 여부를 추적하는 새로운 상태
  const [gameEnded, setGameEnded] = useState(false); // 경기 종료 여부 추적
  const [gameResult, setGameResult] = useState<GameResult>({
    ourTeamScore: 1,
    opponentScore: 0,
    result: "승리", // 승/무/패 정보 추가
    aiComment: "우리 팀의 전술적 우위가 돋보인 경기였습니다.", // AI 평가 한줄평 추가
    possession: { ourTeam: 58, opponent: 42 },
    passes: { ourTeam: 324, opponent: 287 },
    shots: {
      ourTeam: 12,
      opponent: 8,
      ourTeamOnTarget: 5,
      opponentOnTarget: 2,
    },
    attacks: {
      ourTeam: 27,
      opponent: 18,
      ourTeamDangerous: 14,
      opponentDangerous: 7,
    },
    ourTeamSquad: {
      formation: "4-3-3",
      players: [
        { id: 1, name: "김민수", position: "GK", rating: 85 },
        { id: 2, name: "이정호", position: "DF", rating: 83 },
        { id: 3, name: "박성민", position: "DF", rating: 82 },
        { id: 4, name: "최준혁", position: "DF", rating: 81 },
        { id: 5, name: "정우진", position: "DF", rating: 79 },
        { id: 7, name: "이동준", position: "MF", rating: 84 },
        { id: 8, name: "장현우", position: "MF", rating: 83 },
        { id: 9, name: "최재민", position: "MF", rating: 81 },
        { id: 13, name: "이강인", position: "FW", rating: 86 },
        { id: 14, name: "손흥민", position: "FW", rating: 88 },
        { id: 15, name: "황희찬", position: "FW", rating: 85 },
      ],
      positions: [
        { id: "gk", x: 50, y: 90, position: "GK" },
        { id: "lb", x: 20, y: 70, position: "DF" },
        { id: "cb1", x: 40, y: 70, position: "DF" },
        { id: "cb2", x: 60, y: 70, position: "DF" },
        { id: "rb", x: 80, y: 70, position: "DF" },
        { id: "dm", x: 50, y: 55, position: "MF" },
        { id: "cm1", x: 35, y: 45, position: "MF" },
        { id: "cm2", x: 65, y: 45, position: "MF" },
        { id: "lw", x: 20, y: 30, position: "FW" },
        { id: "st", x: 50, y: 25, position: "FW" },
        { id: "rw", x: 80, y: 30, position: "FW" },
      ],
    },
    opponentSquad: {
      formation: "4-2-3-1",
      players: [
        { id: 101, name: "안드레 오나나", position: "GK", rating: 85 },
        { id: 102, name: "해리 매과이어", position: "DF", rating: 81 },
        { id: 103, name: "리산드로 마르티네즈", position: "DF", rating: 83 },
        { id: 104, name: "루크 쇼", position: "DF", rating: 82 },
        { id: 105, name: "디오고 달롯", position: "DF", rating: 80 },
        { id: 106, name: "카세미로", position: "MF", rating: 87 },
        { id: 107, name: "브루노 페르난데스", position: "MF", rating: 88 },
        { id: 108, name: "메이슨 마운트", position: "MF", rating: 82 },
        { id: 109, name: "안토니", position: "MF", rating: 83 },
        { id: 110, name: "마커스 래시포드", position: "FW", rating: 85 },
        { id: 111, name: "라스무스 회이룬", position: "FW", rating: 84 },
      ],
      positions: [
        { id: "gk", x: 50, y: 90, position: "GK" },
        { id: "lb", x: 20, y: 70, position: "DF" },
        { id: "cb1", x: 40, y: 70, position: "DF" },
        { id: "cb2", x: 60, y: 70, position: "DF" },
        { id: "rb", x: 80, y: 70, position: "DF" },
        { id: "cdm1", x: 40, y: 55, position: "MF" },
        { id: "cdm2", x: 60, y: 55, position: "MF" },
        { id: "lam", x: 25, y: 40, position: "MF" },
        { id: "cam", x: 50, y: 35, position: "MF" },
        { id: "ram", x: 75, y: 40, position: "MF" },
        { id: "st", x: 50, y: 20, position: "FW" },
      ],
    },
  });

  // 채팅 컨테이너 참조 생성
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  // 경기 시간 포맷팅 함수: 초를 MM:SS 형식으로 변환
  const formatGameTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }, []);

  // 경기 로그 추가 함수
  const addLog = useCallback(
    (
      message: string,
      isOurTeam: boolean = false,
      isSystem: boolean = false,
      gameTimeOverride?: number
    ) => {
      setMatchLogs((prev) => [
        ...prev,
        {
          message,
          isOurTeam,
          isSystem,
          timestamp: Date.now(),
          gameTime: formatGameTime(
            gameTimeOverride !== undefined ? gameTimeOverride : gameTimer
          ),
        },
      ]);
    },
    [gameTimer, formatGameTime]
  );

  // 로딩 타이머 설정
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setLoadingMessage("상대 발견!");
    }, 4000);

    const timer2 = setTimeout(() => {
      setLoadingMessage("🏟️경기장 준비중");
    }, 5000);
    const timer2_2 = setTimeout(() => {
      setLoadingMessage("🏟️선수 입장");
    }, 7000);

    const timer3 = setTimeout(() => {
      setLoadingMessage("경기 시작!!!");
    }, 9000);

    const timer4 = setTimeout(() => {
      setIsLoading(false);
      // 경기 시작 후 초기 로그 메시지 추가
      addLog("경기가 시작되었습니다!", false, true);
      addLog("우리 팀이 킥오프를 시작합니다.", true);
      // 경기 시작 상태로 설정
      setGameStarted(true);
    }, 10000);

    // 컴포넌트 언마운트시 타이머 정리
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer2_2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []); // 빈 의존성 배열로 마운트시 한 번만 실행

  // addLog를 위한 참조 저장
  const addLogRef = React.useRef(addLog);
  React.useEffect(() => {
    addLogRef.current = addLog;
  }, [addLog]);

  // 게임 타이머 업데이트
  useEffect(() => {
    if (isLoading) return;

    // 1초마다 게임 타이머 증가
    const interval = setInterval(() => {
      setGameTimer((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading]);

  // 축구 경기 시뮬레이션 로그 생성 - 경기 시작 시에만 한 번 실행되도록 수정
  useEffect(() => {
    if (!gameStarted) return; // 경기가 시작되지 않았다면 실행하지 않음

    // 시작 시점은 00:00
    const initialGameTime = 0;

    const gameEvents = [
      {
        time: 500,
        gameTime: initialGameTime + 0,
        action: "김철수가 중앙에서 공을 전진시킵니다.",
        isOurTeam: true,
      },
      {
        time: 1200,
        gameTime: initialGameTime + 1,
        action: "상대 수비수가 공을 차단했습니다.",
        isOurTeam: false,
      },
      {
        time: 2100,
        gameTime: initialGameTime + 2,
        action: "마르티네즈가 우측 측면으로 돌파를 시도합니다.",
        isOurTeam: false,
      },
      {
        time: 3000,
        gameTime: initialGameTime + 4,
        action: "이영희 수비수가 태클로 공을 빼앗았습니다!",
        isOurTeam: true,
      },
      {
        time: 4800,
        gameTime: initialGameTime + 6,
        action: "우리 팀의 빠른 역습이 시작됩니다.",
        isOurTeam: true,
      },
      {
        time: 5500,
        gameTime: initialGameTime + 7,
        action: "박지성이 중앙으로 패스!",
        isOurTeam: true,
      },
      {
        time: 6200,
        gameTime: initialGameTime + 8,
        action: "최용수가 오른쪽 측면으로 빠르게 전개합니다.",
        isOurTeam: true,
      },
      {
        time: 7000,
        gameTime: initialGameTime + 10,
        action: "상대 골키퍼가 위치를 조정합니다.",
        isOurTeam: false,
      },
      {
        time: 8300,
        gameTime: initialGameTime + 12,
        action: "크로스가 들어갑니다!",
        isOurTeam: true,
        isSystem: true,
      },
      {
        time: 9000,
        gameTime: initialGameTime + 13,
        action: "손흥민이 헤딩슛!!!",
        isOurTeam: true,
      },
      {
        time: 10000,
        gameTime: initialGameTime + 14,
        action: "아쉽게 골대를 맞고 나옵니다.",
        isOurTeam: true,
        isSystem: true,
      },
      {
        time: 11500,
        gameTime: initialGameTime + 16,
        action: "로드리게스가 공을 잡아 빌드업을 시작합니다.",
        isOurTeam: false,
      },
      {
        time: 12700,
        gameTime: initialGameTime + 18,
        action: "상대팀의 패스 연결이 좋습니다.",
        isOurTeam: false,
        isSystem: true,
      },
      {
        time: 14000,
        gameTime: initialGameTime + 20,
        action: "메시가 중앙에서 드리블로 돌파합니다.",
        isOurTeam: false,
      },
      {
        time: 15200,
        gameTime: initialGameTime + 22,
        action: "슛! 우리 골키퍼가 멋진 선방을 보여줍니다!",
        isOurTeam: true,
        isSystem: true,
      },
      {
        time: 16500,
        gameTime: initialGameTime + 24,
        action: "이제 우리 팀이 공격권을 가져옵니다.",
        isOurTeam: true,
        isSystem: true,
      },
      {
        time: 17800,
        gameTime: initialGameTime + 26,
        action: "황희찬이 빠르게 측면을 돌파합니다.",
        isOurTeam: true,
      },
      {
        time: 19200,
        gameTime: initialGameTime + 28,
        action: "페널티 박스 근처까지 진입했습니다.",
        isOurTeam: true,
        isSystem: true,
      },
      {
        time: 20000,
        gameTime: initialGameTime + 30,
        action: "상대 수비수의 태클!",
        isOurTeam: false,
      },
      {
        time: 20500,
        gameTime: initialGameTime + 31,
        action: "심판이 휘슬을 붑니다! 페널티킥입니다!",
        isOurTeam: true,
        isSystem: true,
      },
      {
        time: 21500,
        gameTime: initialGameTime + 33,
        action: "손흥민이 키커로 나섭니다.",
        isOurTeam: true,
      },
      {
        time: 22800,
        gameTime: initialGameTime + 35,
        action: "침착하게 준비 중입니다...",
        isOurTeam: true,
        isSystem: true,
      },
      {
        time: 24000,
        gameTime: initialGameTime + 36,
        action: "슈팅!!!",
        isOurTeam: true,
        isSystem: true,
      },
      {
        time: 24500,
        gameTime: initialGameTime + 37,
        action: "골!!!!!!!!!!! 우리 팀이 선제골을 넣었습니다!",
        isOurTeam: true,
        isSystem: true,
      },
      {
        time: 25800,
        gameTime: initialGameTime + 38,
        action: "경기가 재개됩니다.",
        isOurTeam: false,
        isSystem: true,
      },
      {
        time: 27000,
        gameTime: initialGameTime + 40,
        action: "네이마르가 빠르게 공격을 전개합니다.",
        isOurTeam: false,
      },
      {
        time: 28200,
        gameTime: initialGameTime + 41,
        action: "음바페에게 패스!",
        isOurTeam: false,
      },
      {
        time: 29500,
        gameTime: initialGameTime + 43,
        action: "위험한 슛이 날아옵니다!",
        isOurTeam: false,
        isSystem: true,
      },
      {
        time: 30000,
        gameTime: initialGameTime + 44,
        action: "골키퍼 정면으로 향한 슛을 가볍게 방어합니다.",
        isOurTeam: true,
      },
      {
        time: 32000,
        gameTime: initialGameTime + 45,
        action: "휘슬이 울리고 경기가 종료됩니다!",
        isOurTeam: true,
        isSystem: true,
      },
    ];

    // 각 이벤트에 대한 타이머 설정
    const timers = gameEvents.map((event) => {
      return setTimeout(() => {
        // useRef로 최신 addLog 참조
        addLogRef.current(
          event.action,
          event.isOurTeam,
          event.isSystem || false,
          event.gameTime
        );
        // 게임 타이머 시간 업데이트 (시각적 효과를 위해)
        setGameTimer(event.gameTime);

        // 마지막 이벤트 후 경기 종료 상태로 변경
        if (event.time === 32000) {
          setTimeout(() => {
            setGameEnded(true);
          }, 2000);
        }
      }, event.time + 1000); // 로딩 10초 후부터 시작하도록 수정
    });

    // 언마운트시 타이머 정리
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [gameStarted]); // gameStarted 상태에만 의존하도록 변경

  // 로그가 업데이트될 때마다 스크롤을 최하단으로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [matchLogs]); // matchLogs가 변경될 때마다 실행

  // localStorage에서 선택된 전략 불러오기
  useEffect(() => {
    if (isLoading || gameStarted) return; // 이미 로딩중이거나 게임이 시작되었으면 실행하지 않음

    const savedStrategies = localStorage.getItem(STRATEGIES_STORAGE_KEY);

    if (savedStrategies) {
      try {
        const strategies = JSON.parse(savedStrategies);

        // 가장 최근 전략 선택 (임시, 추후 선택 기능 추가)
        const selectedStrategy = strategies[strategies.length - 1];

        if (selectedStrategy && selectedStrategy.squad) {
          // 경기 결과에 선택된 전략의 스쿼드 정보 반영
          const samplePlayers = [
            { id: 1, name: "김민수", position: "GK", rating: 85 },
            { id: 2, name: "이정호", position: "DF", rating: 83 },
            { id: 3, name: "박성민", position: "DF", rating: 82 },
            { id: 4, name: "최준혁", position: "DF", rating: 81 },
            { id: 5, name: "정우진", position: "DF", rating: 79 },
            { id: 6, name: "김태현", position: "DF", rating: 78 },
            { id: 7, name: "이동준", position: "MF", rating: 84 },
            { id: 8, name: "장현우", position: "MF", rating: 83 },
            { id: 9, name: "최재민", position: "MF", rating: 81 },
            { id: 10, name: "손우혁", position: "MF", rating: 80 },
            { id: 11, name: "박진우", position: "MF", rating: 79 },
            { id: 12, name: "김현민", position: "MF", rating: 78 },
            { id: 13, name: "이강인", position: "FW", rating: 86 },
            { id: 14, name: "손흥민", position: "FW", rating: 88 },
            { id: 15, name: "황희찬", position: "FW", rating: 85 },
            { id: 16, name: "정우영", position: "FW", rating: 82 },
            { id: 17, name: "김민재", position: "DF", rating: 86 },
            { id: 18, name: "오현규", position: "FW", rating: 80 },
          ];

          // 전략의 포메이션에 맞는 포지션 정보 가져오기
          const formationPositions: { [key: string]: any[] } = {
            "4-4-2": [
              { id: "gk", x: 50, y: 90, position: "GK" },
              { id: "lb", x: 20, y: 70, position: "DF" },
              { id: "cb1", x: 40, y: 70, position: "DF" },
              { id: "cb2", x: 60, y: 70, position: "DF" },
              { id: "rb", x: 80, y: 70, position: "DF" },
              { id: "lm", x: 20, y: 50, position: "MF" },
              { id: "cm1", x: 40, y: 50, position: "MF" },
              { id: "cm2", x: 60, y: 50, position: "MF" },
              { id: "rm", x: 80, y: 50, position: "MF" },
              { id: "st1", x: 40, y: 30, position: "FW" },
              { id: "st2", x: 60, y: 30, position: "FW" },
            ],
            "4-3-3": [
              { id: "gk", x: 50, y: 90, position: "GK" },
              { id: "lb", x: 20, y: 70, position: "DF" },
              { id: "cb1", x: 40, y: 70, position: "DF" },
              { id: "cb2", x: 60, y: 70, position: "DF" },
              { id: "rb", x: 80, y: 70, position: "DF" },
              { id: "dm", x: 50, y: 55, position: "MF" },
              { id: "cm1", x: 35, y: 45, position: "MF" },
              { id: "cm2", x: 65, y: 45, position: "MF" },
              { id: "lw", x: 20, y: 30, position: "FW" },
              { id: "st", x: 50, y: 25, position: "FW" },
              { id: "rw", x: 80, y: 30, position: "FW" },
            ],
            "3-5-2": [
              { id: "gk", x: 50, y: 90, position: "GK" },
              { id: "cb1", x: 30, y: 70, position: "DF" },
              { id: "cb2", x: 50, y: 70, position: "DF" },
              { id: "cb3", x: 70, y: 70, position: "DF" },
              { id: "lwb", x: 15, y: 55, position: "MF" },
              { id: "cm1", x: 35, y: 50, position: "MF" },
              { id: "cm2", x: 50, y: 45, position: "MF" },
              { id: "cm3", x: 65, y: 50, position: "MF" },
              { id: "rwb", x: 85, y: 55, position: "MF" },
              { id: "st1", x: 40, y: 30, position: "FW" },
              { id: "st2", x: 60, y: 30, position: "FW" },
            ],
            "5-3-2": [
              { id: "gk", x: 50, y: 90, position: "GK" },
              { id: "lwb", x: 10, y: 65, position: "DF" },
              { id: "cb1", x: 30, y: 70, position: "DF" },
              { id: "cb2", x: 50, y: 75, position: "DF" },
              { id: "cb3", x: 70, y: 70, position: "DF" },
              { id: "rwb", x: 90, y: 65, position: "DF" },
              { id: "cm1", x: 30, y: 50, position: "MF" },
              { id: "cm2", x: 50, y: 45, position: "MF" },
              { id: "cm3", x: 70, y: 50, position: "MF" },
              { id: "st1", x: 40, y: 30, position: "FW" },
              { id: "st2", x: 60, y: 30, position: "FW" },
            ],
            "4-2-3-1": [
              { id: "gk", x: 50, y: 90, position: "GK" },
              { id: "lb", x: 20, y: 70, position: "DF" },
              { id: "cb1", x: 40, y: 70, position: "DF" },
              { id: "cb2", x: 60, y: 70, position: "DF" },
              { id: "rb", x: 80, y: 70, position: "DF" },
              { id: "cdm1", x: 40, y: 55, position: "MF" },
              { id: "cdm2", x: 60, y: 55, position: "MF" },
              { id: "lam", x: 25, y: 40, position: "MF" },
              { id: "cam", x: 50, y: 35, position: "MF" },
              { id: "ram", x: 75, y: 40, position: "MF" },
              { id: "st", x: 50, y: 20, position: "FW" },
            ],
          };

          // 선수 ID로 선수 정보 찾기
          const playersInSquad = Object.entries(selectedStrategy.squad.players)
            .map(([positionId, playerId]) => {
              const player = samplePlayers.find((p) => p.id === playerId);
              return player ? { ...player, positionId } : null;
            })
            .filter((player) => player !== null) as (Player & {
            positionId: string;
          })[];

          // 결과 업데이트
          setGameResult((prev) => ({
            ...prev,
            ourTeamSquad: {
              formation: selectedStrategy.formation,
              players: playersInSquad,
              positions: formationPositions[selectedStrategy.formation] || [],
            },
          }));
        }
      } catch (error) {
        console.error("전략 로딩 중 오류 발생:", error);
      }
    }
  }, [isLoading, gameStarted]);

  // 공유하기 기능
  const handleShare = () => {
    alert("경기 결과가 공유되었습니다!");
  };

  // 경기 결과 렌더링
  const renderGameResult = () => {
    const {
      ourTeamScore,
      opponentScore,
      result,
      aiComment,
      possession,
      passes,
      shots,
      attacks,
      ourTeamSquad,
      opponentSquad,
    } = gameResult;

    // 차트 데이터 준비
    const possessionData = [
      { name: "우리 팀", value: possession.ourTeam },
      { name: "상대 팀", value: possession.opponent },
    ];

    const passesData = [
      { name: "우리 팀", 총패스: passes.ourTeam },
      { name: "상대 팀", 총패스: passes.opponent },
    ];

    const shotsData = [
      { name: "우리 팀", 슛: shots.ourTeam, 유효슛: shots.ourTeamOnTarget },
      { name: "상대 팀", 슛: shots.opponent, 유효슛: shots.opponentOnTarget },
    ];

    const attacksData = [
      {
        name: "우리 팀",
        공격: attacks.ourTeam,
        위험한공격: attacks.ourTeamDangerous,
      },
      {
        name: "상대 팀",
        공격: attacks.opponent,
        위험한공격: attacks.opponentDangerous,
      },
    ];

    const COLORS = ["#0088FE", "#FF8042"];

    return (
      <ResultContainer>
        <ResultTitle>경기 결과</ResultTitle>

        <ScoreDisplay>
          <TeamScore>
            <TeamName>우리 팀</TeamName>
            <Score>{ourTeamScore}</Score>
          </TeamScore>

          <ScoreSeparator>:</ScoreSeparator>

          <TeamScore>
            <TeamName>상대 팀</TeamName>
            <Score>{opponentScore}</Score>
          </TeamScore>
        </ScoreDisplay>

        <ResultStatus result={result}>결과: {result}</ResultStatus>
        <AiComment>AI 평가: {aiComment}</AiComment>

        {/* 스쿼드 정보 표시 부분 추가 */}
        <SquadsContainer>
          <TeamSquadContainer>
            <TeamTitle>우리 팀</TeamTitle>
            <FormationText>포메이션: {ourTeamSquad.formation}</FormationText>

            <MiniPitchContainer>
              <MiniPitchLines />
              <MiniPitchCenter />
              {ourTeamSquad.positions.map((pos, index) => {
                // 해당 포지션에 배정된 선수 찾기
                const player = ourTeamSquad.players.find(
                  (p) => p.positionId === pos.id
                );
                return player ? (
                  <PlayerDot
                    key={`our-${pos.id}`}
                    x={pos.x}
                    y={pos.y}
                    isOurTeam={true}
                  >
                    {index + 1}
                  </PlayerDot>
                ) : null;
              })}
            </MiniPitchContainer>

            <LineupContainer>
              {ourTeamSquad.players.map((player, index) => (
                <PlayerItem key={`our-player-${player.id}`}>
                  <PlayerPosition>{player.position}</PlayerPosition>
                  <PlayerName>{`${index + 1}. ${player.name}`}</PlayerName>
                  <PlayerRating>{player.rating}</PlayerRating>
                </PlayerItem>
              ))}
            </LineupContainer>
          </TeamSquadContainer>

          <TeamSquadContainer>
            <TeamTitle>상대 팀</TeamTitle>
            <FormationText>포메이션: {opponentSquad.formation}</FormationText>

            <MiniPitchContainer>
              <MiniPitchLines />
              <MiniPitchCenter />
              {opponentSquad.positions.map((pos, index) => (
                <PlayerDot
                  key={`opponent-${pos.id}`}
                  x={pos.x}
                  y={pos.y}
                  isOurTeam={false}
                >
                  {index + 1}
                </PlayerDot>
              ))}
            </MiniPitchContainer>

            <LineupContainer>
              {opponentSquad.players.map((player, index) => (
                <PlayerItem key={`opponent-player-${player.id}`}>
                  <PlayerPosition>{player.position}</PlayerPosition>
                  <PlayerName>{`${index + 1}. ${player.name}`}</PlayerName>
                  <PlayerRating>{player.rating}</PlayerRating>
                </PlayerItem>
              ))}
            </LineupContainer>
          </TeamSquadContainer>
        </SquadsContainer>

        <StatSection>
          <ChartContainer>
            <ChartTitle>볼 점유율 (%)</ChartTitle>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={possessionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {possessionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer>
            <ChartTitle>패스 횟수</ChartTitle>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart
                data={passesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="총패스" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer>
            <ChartTitle>슛 통계</ChartTitle>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart
                data={shotsData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="슛" fill="#8884d8" />
                <Bar dataKey="유효슛" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer>
            <ChartTitle>공격 분석</ChartTitle>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart
                data={attacksData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="공격" fill="#8884d8" />
                <Bar dataKey="위험한공격" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </StatSection>

        <ShareButton onClick={handleShare}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
          </svg>
          경기 결과 공유하기
        </ShareButton>
      </ResultContainer>
    );
  };

  return (
    <MatchContainer>
      <Title>매치 플레이</Title>

      {isLoading ? (
        <LoadingContainer>
          <LoadingCircle>
            <ScanLine />
            <InnerCircle>AI 매칭</InnerCircle>
          </LoadingCircle>
          <LoadingText>{loadingMessage}</LoadingText>
        </LoadingContainer>
      ) : gameEnded ? (
        renderGameResult()
      ) : (
        <FieldContainer>
          {/* 경기 시간 표시 */}
          <GameTimeDisplay>{formatGameTime(gameTimer)}</GameTimeDisplay>

          <ChatContainer ref={chatContainerRef}>
            {matchLogs.map((log, index) => (
              <LogMessage
                key={index}
                isOurTeam={log.isOurTeam}
                isSystem={log.isSystem}
              >
                <GameTimeTag>{log.gameTime}</GameTimeTag>
                {log.isOurTeam
                  ? "🔵 우리 팀: "
                  : log.isSystem
                  ? "⚽ "
                  : "🔴 상대 팀: "}
                {log.message}
              </LogMessage>
            ))}
          </ChatContainer>
        </FieldContainer>
      )}
    </MatchContainer>
  );
};

export default MatchPage;
