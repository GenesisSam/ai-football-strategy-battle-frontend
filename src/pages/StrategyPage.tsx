import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";

const StrategyContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.large};
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.small};
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.small};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: ${({ theme }) => theme.fonts.bodySize};
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.small};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: ${({ theme }) => theme.fonts.bodySize};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.small};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: ${({ theme }) => theme.fonts.bodySize};
  min-height: 150px;
  resize: vertical;
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.small}
    ${({ theme }) => theme.spacing.large};
  font-size: ${({ theme }) => theme.fonts.bodySize};
  font-weight: bold;
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.medium};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const ButtonSecondary = styled(Button)`
  background-color: ${({ theme }) => theme.colors.secondary};
  margin-right: ${({ theme }) => theme.spacing.small};

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondaryDark};
  }
`;

const DetailItem = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const DetailLabel = styled.h3`
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const DetailValue = styled.p`
  font-size: ${({ theme }) => theme.fonts.bodySize};
`;

const ButtonGroup = styled.div`
  display: flex;
  margin-top: ${({ theme }) => theme.spacing.large};
`;

// 스쿼드 메이커 스타일 컴포넌트
const SquadMakerContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.large};
  margin-bottom: ${({ theme }) => theme.spacing.xlarge};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PitchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 700px;
  height: 500px;
  background-color: #2e7d32;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const PitchLines = styled.div`
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

  /* 왼쪽 골대 영역 (이제 위쪽이 됨) */
  &:before {
    width: 300px;
    height: 120px;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    border-bottom: 2px solid rgba(255, 255, 255, 0.7);
    border-top: none;
  }

  /* 오른쪽 골대 영역 (이제 아래쪽이 됨) */
  &:after {
    width: 300px;
    height: 120px;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    border-top: 2px solid rgba(255, 255, 255, 0.7);
    border-bottom: none;
  }
`;

const PitchCenter = styled.div`
  position: absolute;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.7);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  &:before {
    content: "";
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  /* 센터 라인 가로로 변경 */
  &:after {
    content: "";
    position: absolute;
    height: 100%;
    width: 2px;
    background-color: rgba(255, 255, 255, 0.7);
    top: 0;
    left: 50%;
  }
`;

const PlayerPosition = styled.div<{
  x: number;
  y: number;
  isOccupied: boolean;
}>`
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.isOccupied ? "#f44336" : "rgba(255, 255, 255, 0.2)"};
  border: 2px solid white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: white;
  cursor: pointer;
  left: ${(props) => props.x}%;
  top: ${(props) => props.y}%;
  transform: translate(-50%, -50%);
  z-index: 5;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) =>
      props.isOccupied ? "#d32f2f" : "rgba(255, 255, 255, 0.4)"};
  }
`;

const PlayerInfo = styled.div`
  font-size: 12px;
  text-align: center;
`;

const PlayersList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.medium};
  margin-top: ${({ theme }) => theme.spacing.medium};
  max-width: 700px;
  width: 100%;
`;

const PlayerCard = styled.div<{ position: Position; isSelected: boolean }>`
  padding: ${({ theme }) => theme.spacing.small};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 2px solid
    ${(props) => {
      if (props.isSelected) return "#f44336";

      switch (props.position) {
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
  background-color: ${(props) =>
    props.isSelected ? "rgba(244, 67, 54, 0.1)" : "white"};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const PlayerCardHeader = styled.div<{ position: Position }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.small};

  & > span {
    font-weight: bold;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    background-color: ${(props) => {
      switch (props.position) {
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
  }
`;

const PlayerName = styled.div`
  font-weight: bold;
`;

const PlayerRating = styled.div`
  font-weight: bold;
  font-size: 16px;
  color: #f57c00;
`;

const SquadHeader = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin: ${({ theme }) => theme.spacing.large} 0;
`;

const PositionTabs = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  width: 100%;
  max-width: 700px;
`;

const PositionTab = styled.button<{ active: boolean }>`
  padding: ${({ theme }) => theme.spacing.small}
    ${({ theme }) => theme.spacing.medium};
  background: ${(props) =>
    props.active ? props.theme.colors.primary : "transparent"};
  color: ${(props) => (props.active ? "white" : props.theme.colors.text)};
  border: none;
  cursor: pointer;
  font-weight: ${(props) => (props.active ? "bold" : "normal")};
  transition: background-color 0.3s ease;

  &:hover {
    background: ${(props) =>
      props.active
        ? props.theme.colors.primaryDark
        : props.theme.colors.background};
  }
`;

const SaveSquadButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing.large};
`;

// 드래그 관련 스타일 추가
const DraggablePlayerCard = styled(PlayerCard)<{ isDragging: boolean }>`
  cursor: grab;
  opacity: ${(props) => (props.isDragging ? 0.5 : 1)};
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;

  &:hover {
    transform: ${(props) =>
      props.isDragging ? "scale(1)" : "translateY(-3px)"};
    box-shadow: ${(props) =>
      props.isDragging ? "none" : "0 4px 8px rgba(0, 0, 0, 0.1)"};
  }

  &:active {
    cursor: grabbing;
  }
`;

const DropZone = styled(PlayerPosition)<{ isOver: boolean }>`
  background-color: ${(props) =>
    props.isOver
      ? "rgba(76, 175, 80, 0.4)"
      : props.isOccupied
      ? "#f44336"
      : "rgba(255, 255, 255, 0.2)"};
  transition: background-color 0.3s ease, transform 0.3s ease;
  transform: ${(props) => (props.isOver ? "scale(1.1)" : "scale(1)")}
    translate(-50%, -50%);
`;

// 선수 포지션 타입 정의
type Position = "GK" | "DF" | "MF" | "FW";

// 선수 정보 인터페이스
interface Player {
  id: number;
  name: string;
  position: Position;
  rating: number;
}

// 스쿼드 포지션 인터페이스
interface SquadPosition {
  id: string;
  x: number;
  y: number;
  position: Position;
  playerId?: number;
}

// 전략 데이터 인터페이스 추가
interface Strategy {
  id: number;
  name: string;
  formation: string;
  description: string;
  attackStyle: string;
  defenseStyle: string;
  specialInstructions: string;
  squad?: {
    formation: string;
    players: {
      [key: string]: number;
    };
  };
}

interface StrategyPageProps {
  mode?: "view" | "create" | "list" | "edit";
}

// localStorage에서 전략 데이터 관리를 위한 키
const STRATEGIES_STORAGE_KEY = "football-strategies";

const StrategyPage: React.FC<StrategyPageProps> = ({ mode = "list" }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    formation: "4-4-2",
    description: "",
    attackStyle: "",
    defenseStyle: "",
    specialInstructions: "",
  });

  // 전략 목록 상태 추가
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  // localStorage에서 전략 불러오기
  useEffect(() => {
    const savedStrategies = localStorage.getItem(STRATEGIES_STORAGE_KEY);
    if (savedStrategies) {
      setStrategies(JSON.parse(savedStrategies));
    } else {
      // 저장된 전략이 없을 경우 빈 배열로 초기화
      setStrategies([]);
      localStorage.setItem(STRATEGIES_STORAGE_KEY, JSON.stringify([]));
    }
  }, []);

  // 수정할 전략을 불러올 때 사용
  useEffect(() => {
    if (mode === "edit" && id) {
      const strategyToEdit = strategies.find((s) => s.id === parseInt(id));
      if (strategyToEdit) {
        setFormData({
          name: strategyToEdit.name,
          formation: strategyToEdit.formation,
          description: strategyToEdit.description,
          attackStyle: strategyToEdit.attackStyle,
          defenseStyle: strategyToEdit.defenseStyle,
          specialInstructions: strategyToEdit.specialInstructions,
        });

        if (strategyToEdit.squad) {
          setAssignedPlayers(strategyToEdit.squad.players);
        }
      }
    }
  }, [mode, id, strategies]);

  // 전략 저장 함수
  const saveStrategy = (strategyData: Omit<Strategy, "id">) => {
    const newStrategy = {
      ...strategyData,
      id: Date.now(), // 유니크 ID 생성 (현재 시간 타임스탬프 사용)
      squad: {
        formation: formData.formation,
        players: assignedPlayers,
      },
    };

    const updatedStrategies = [...strategies, newStrategy];
    setStrategies(updatedStrategies);
    localStorage.setItem(
      STRATEGIES_STORAGE_KEY,
      JSON.stringify(updatedStrategies)
    );

    return newStrategy.id;
  };

  // 전략 업데이트 함수
  const updateStrategy = (
    strategyId: number,
    strategyData: Omit<Strategy, "id">
  ) => {
    const updatedStrategies = strategies.map((strategy) => {
      if (strategy.id === strategyId) {
        return {
          ...strategy,
          ...strategyData,
          squad: {
            formation: formData.formation,
            players: assignedPlayers,
          },
        };
      }
      return strategy;
    });

    setStrategies(updatedStrategies);
    localStorage.setItem(
      STRATEGIES_STORAGE_KEY,
      JSON.stringify(updatedStrategies)
    );
  };

  // 전략 삭제 함수
  const deleteStrategy = (strategyId: number) => {
    const filteredStrategies = strategies.filter(
      (strategy) => strategy.id !== strategyId
    );
    setStrategies(filteredStrategies);
    localStorage.setItem(
      STRATEGIES_STORAGE_KEY,
      JSON.stringify(filteredStrategies)
    );
  };

  // 전략 삭제 핸들러 추가
  const handleDeleteStrategy = (strategyId: number) => {
    if (window.confirm("이 전략을 정말 삭제하시겠습니까?")) {
      deleteStrategy(strategyId);
      alert("전략이 삭제되었습니다.");
    }
  };

  // 전략 수정 페이지로 이동
  const handleEditStrategy = (strategyId: number) => {
    navigate(`/strategy/edit/${strategyId}`);
  };

  // 샘플 선수 데이터
  const samplePlayers: Player[] = [
    // 한국 선수
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

    // 맨체스터 유나이티드 선수
    { id: 101, name: "안드레 오나나", position: "GK", rating: 85 },
    { id: 102, name: "해리 매과이어", position: "DF", rating: 81 },
    { id: 103, name: "리산드로 마르티네즈", position: "DF", rating: 83 },
    { id: 104, name: "루크 쇼", position: "DF", rating: 82 },
    { id: 105, name: "디오고 달롯", position: "DF", rating: 80 },
    { id: 106, name: "카세미로", position: "MF", rating: 87 },
    { id: 107, name: "브루노 페르난데스", position: "MF", rating: 88 },
    { id: 108, name: "메이슨 마운트", position: "MF", rating: 82 },
    { id: 109, name: "라스무스 회이룬", position: "FW", rating: 84 },
    { id: 110, name: "마커스 래시포드", position: "FW", rating: 85 },

    // 첼시 선수
    { id: 201, name: "로베르트 산체스", position: "GK", rating: 82 },
    { id: 202, name: "리스 제임스", position: "DF", rating: 84 },
    { id: 203, name: "웨슬리 포파나", position: "DF", rating: 82 },
    { id: 204, name: "마크 쿠쿠레야", position: "DF", rating: 81 },
    { id: 205, name: "엔조 페르난데스", position: "MF", rating: 83 },
    { id: 206, name: "모이세스 카이세도", position: "MF", rating: 82 },
    { id: 207, name: "코너 갤러거", position: "MF", rating: 80 },
    { id: 208, name: "콜 파머", position: "MF", rating: 84 },
    { id: 209, name: "니콜라스 잭슨", position: "FW", rating: 82 },
    { id: 210, name: "크리스토퍼 은쿤쿠", position: "FW", rating: 84 },

    // 리버풀 선수
    { id: 301, name: "알리송 베케르", position: "GK", rating: 89 },
    { id: 302, name: "버질 판 다이크", position: "DF", rating: 88 },
    { id: 303, name: "앤드류 로버트슨", position: "DF", rating: 85 },
    { id: 304, name: "트렌트 알렉산더아널드", position: "DF", rating: 86 },
    { id: 305, name: "이브라히마 코나테", position: "DF", rating: 83 },
    { id: 306, name: "알렉시스 맥앨리스터", position: "MF", rating: 84 },
    { id: 307, name: "도미니크 소보슬라이", position: "MF", rating: 83 },
    { id: 308, name: "커티스 존스", position: "MF", rating: 81 },
    { id: 309, name: "모하메드 살라", position: "FW", rating: 89 },
    { id: 310, name: "다르윈 누녜스", position: "FW", rating: 82 },
    { id: 311, name: "루이스 디아스", position: "FW", rating: 85 },

    // 아스날 선수
    { id: 401, name: "다비드 라야", position: "GK", rating: 84 },
    { id: 402, name: "윌리엄 살리바", position: "DF", rating: 85 },
    { id: 403, name: "가브리엘 마가랴에스", position: "DF", rating: 84 },
    { id: 404, name: "벤 화이트", position: "DF", rating: 83 },
    { id: 405, name: "올렉산드르 진첸코", position: "DF", rating: 82 },
    { id: 406, name: "토마스 파티", position: "MF", rating: 85 },
    { id: 407, name: "데클란 라이스", position: "MF", rating: 86 },
    { id: 408, name: "마르틴 외데고르", position: "MF", rating: 87 },
    { id: 409, name: "부카요 사카", position: "FW", rating: 86 },
    { id: 410, name: "가브리엘 제수스", position: "FW", rating: 84 },
    { id: 411, name: "가브리엘 마르티넬리", position: "FW", rating: 85 },
    { id: 412, name: "레안드로 트로사르", position: "FW", rating: 82 },
  ];

  // 포지션 필터 상태
  const [currentPosition, setCurrentPosition] = useState<Position | "ALL">(
    "ALL"
  );
  // 선택된 선수 상태
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  // 현재 스쿼드 상태
  const [squadPositions, setSquadPositions] = useState<SquadPosition[]>([]);
  // 배치된 선수들 상태
  const [assignedPlayers, setAssignedPlayers] = useState<{
    [key: string]: number;
  }>({});
  // 드래그 상태 추가
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
  const [dragOverPositionId, setDragOverPositionId] = useState<string | null>(
    null
  );

  // 포메이션에 따른 포지션 매핑
  const formationPositions: { [key: string]: SquadPosition[] } = {
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

  // 포메이션 변경시 스쿼드 포지션 업데이트
  useEffect(() => {
    if (formData.formation) {
      setSquadPositions(formationPositions[formData.formation]);
      // 포메이션이 바뀌면 선수 배치 초기화
      setAssignedPlayers({});
    }
  }, [formData.formation]);

  // 선수 선택 핸들러
  const handleSelectPlayer = (player: Player) => {
    if (selectedPlayer && selectedPlayer.id === player.id) {
      setSelectedPlayer(null);
    } else {
      setSelectedPlayer(player);
    }
  };

  // 포지션 선택 핸들러
  const handleSelectPosition = (positionId: string, positionType: Position) => {
    if (!selectedPlayer) {
      // 이미 배치된 선수가 있는지 확인
      const playerId = assignedPlayers[positionId];
      if (playerId) {
        const playerInfo = samplePlayers.find((p) => p.id === playerId);
        if (playerInfo) {
          // 이미 배치된 선수를 선택함
          setSelectedPlayer(playerInfo);
          // 포지션에서 선수 제거
          const newAssigned = { ...assignedPlayers };
          delete newAssigned[positionId];
          setAssignedPlayers(newAssigned);
        }
      }
      return;
    }

    // 선택한 선수의 포지션과 배치하려는 포지션이 일치하는지 확인
    if (selectedPlayer.position !== positionType) {
      alert(
        `${selectedPlayer.name}의 포지션(${selectedPlayer.position})과 선택한 포지션(${positionType})이 일치하지 않습니다.`
      );
      return;
    }

    // 이미 배치된 선수인지 확인
    const assignedPosition = Object.entries(assignedPlayers).find(
      ([_, playerId]) => playerId === selectedPlayer.id
    );

    if (assignedPosition) {
      // 이미 배치된 선수라면 기존 포지션에서 제거
      const newAssigned = { ...assignedPlayers };
      delete newAssigned[assignedPosition[0]];

      // 새 포지션에 배치
      newAssigned[positionId] = selectedPlayer.id;
      setAssignedPlayers(newAssigned);
    } else {
      // 새 선수 배치
      setAssignedPlayers({
        ...assignedPlayers,
        [positionId]: selectedPlayer.id,
      });
    }

    // 선택 상태 초기화
    setSelectedPlayer(null);
  };

  // 드래그 시작 핸들러
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    player: Player
  ) => {
    e.dataTransfer.setData("playerId", player.id.toString());
    setDraggedPlayer(player);
  };

  // 드래그 중 핸들러
  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    positionId: string,
    positionType: Position
  ) => {
    e.preventDefault();
    setDragOverPositionId(positionId);
  };

  // 드래그 종료 핸들러
  const handleDragEnd = () => {
    setDraggedPlayer(null);
    setDragOverPositionId(null);
  };

  // 드롭 핸들러
  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    positionId: string,
    positionType: Position
  ) => {
    e.preventDefault();

    const playerId = parseInt(e.dataTransfer.getData("playerId"));
    const player = samplePlayers.find((p) => p.id === playerId);

    if (!player) return;

    // 선택한 선수의 포지션과 배치하려는 포지션이 일치하는지 확인
    if (player.position !== positionType) {
      alert(
        `${player.name}의 포지션(${player.position})과 선택한 포지션(${positionType})이 일치하지 않습니다.`
      );
      return;
    }

    // 이미 배치된 선수인지 확인
    const assignedPosition = Object.entries(assignedPlayers).find(
      ([_, pid]) => pid === player.id
    );

    if (assignedPosition) {
      // 이미 배치된 선수라면 기존 포지션에서 제거
      const newAssigned = { ...assignedPlayers };
      delete newAssigned[assignedPosition[0]];

      // 새 포지션에 배치
      newAssigned[positionId] = player.id;
      setAssignedPlayers(newAssigned);
    } else {
      // 새 선수 배치
      setAssignedPlayers({
        ...assignedPlayers,
        [positionId]: player.id,
      });
    }

    setDraggedPlayer(null);
    setDragOverPositionId(null);
  };

  // 드래그 떠남 핸들러
  const handleDragLeave = () => {
    setDragOverPositionId(null);
  };

  // 포지션 필터 변경 핸들러
  const handleChangePositionFilter = (position: Position | "ALL") => {
    setCurrentPosition(position);
  };

  // 스쿼드 저장 핸들러
  const handleSaveSquad = () => {
    const squadData = {
      formation: formData.formation,
      players: assignedPlayers,
    };

    // 실제로는 API 호출로 저장
    console.log("저장된 스쿼드:", squadData);
    alert("스쿼드가 성공적으로 저장되었습니다!");
  };

  // 테스트 매치로 이동 함수 대신 새로운 핸들러 2개 추가
  const handleQuickMatch = () => {
    // 빠른 대전 기능 (아직 구현 전)
    alert("빠른 대전 기능은 현재 개발 중입니다. (WIP)");
  };

  const handleFiveMinuteMatch = () => {
    // 5분 대전 기능 - 시뮬레이션으로 이동
    navigate("/match");
  };

  // 필터된 선수 목록
  const filteredPlayers = samplePlayers.filter(
    (player) => currentPosition === "ALL" || player.position === currentPosition
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (mode === "edit" && id) {
      // 전략 업데이트
      updateStrategy(parseInt(id), {
        name: formData.name,
        formation: formData.formation,
        description: formData.description,
        attackStyle: formData.attackStyle,
        defenseStyle: formData.defenseStyle,
        specialInstructions: formData.specialInstructions,
      });
      alert("전략이 성공적으로 수정되었습니다!");
    } else {
      // 새 전략 생성
      const newId = saveStrategy({
        name: formData.name,
        formation: formData.formation,
        description: formData.description,
        attackStyle: formData.attackStyle,
        defenseStyle: formData.defenseStyle,
        specialInstructions: formData.specialInstructions,
      });
      alert("전략이 성공적으로 생성되었습니다!");
    }

    navigate("/strategy");
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/strategy/edit/${id}`);
    }
  };

  const renderCreateMode = () => (
    <>
      <Title>새 전략 만들기</Title>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">전략 이름</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="전략 이름을 입력하세요"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="formation">포메이션</Label>
          <Select
            id="formation"
            name="formation"
            value={formData.formation}
            onChange={handleInputChange}
            required
          >
            <option value="4-4-2">4-4-2</option>
            <option value="4-3-3">4-3-3</option>
            <option value="3-5-2">3-5-2</option>
            <option value="5-3-2">5-3-2</option>
            <option value="4-2-3-1">4-2-3-1</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="description">전략 설명</Label>
          <Input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="전략에 대한 간단한 설명"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="attackStyle">공격 스타일</Label>
          <Input
            type="text"
            id="attackStyle"
            name="attackStyle"
            value={formData.attackStyle}
            onChange={handleInputChange}
            placeholder="공격 스타일 (예: 빠른 역습, 점유율 기반 공격 등)"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="defenseStyle">수비 스타일</Label>
          <Input
            type="text"
            id="defenseStyle"
            name="defenseStyle"
            value={formData.defenseStyle}
            onChange={handleInputChange}
            placeholder="수비 스타일 (예: 높은 압박, 낮은 블록 등)"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="specialInstructions">특별 지시사항</Label>
          <TextArea
            id="specialInstructions"
            name="specialInstructions"
            value={formData.specialInstructions}
            onChange={handleInputChange}
            placeholder="팀에 대한 특별 지시사항을 입력하세요"
          />
        </FormGroup>

        {/* 스쿼드 메이커 섹션 수정 */}
        <SquadHeader>스쿼드 구성</SquadHeader>
        <SquadMakerContainer>
          <PitchContainer>
            <PitchLines />
            <PitchCenter />
            {squadPositions.map((position) => {
              const playerId = assignedPlayers[position.id];
              const player = playerId
                ? samplePlayers.find((p) => p.id === playerId)
                : null;

              return (
                <DropZone
                  key={position.id}
                  x={position.x}
                  y={position.y}
                  isOccupied={!!player}
                  isOver={dragOverPositionId === position.id}
                  onClick={() =>
                    handleSelectPosition(position.id, position.position)
                  }
                  onDragOver={(e) =>
                    handleDragOver(e, position.id, position.position)
                  }
                  onDrop={(e) => handleDrop(e, position.id, position.position)}
                  onDragLeave={handleDragLeave}
                >
                  <PlayerInfo>
                    {player ? (
                      <>
                        {player.name.substring(0, 3)}
                        <br />
                        {player.position}
                      </>
                    ) : (
                      position.position
                    )}
                  </PlayerInfo>
                </DropZone>
              );
            })}
          </PitchContainer>

          <PositionTabs>
            <PositionTab
              active={currentPosition === "ALL"}
              onClick={() => handleChangePositionFilter("ALL")}
              type="button"
            >
              전체
            </PositionTab>
            <PositionTab
              active={currentPosition === "GK"}
              onClick={() => handleChangePositionFilter("GK")}
              type="button"
            >
              골키퍼
            </PositionTab>
            <PositionTab
              active={currentPosition === "DF"}
              onClick={() => handleChangePositionFilter("DF")}
              type="button"
            >
              수비수
            </PositionTab>
            <PositionTab
              active={currentPosition === "MF"}
              onClick={() => handleChangePositionFilter("MF")}
              type="button"
            >
              미드필더
            </PositionTab>
            <PositionTab
              active={currentPosition === "FW"}
              onClick={() => handleChangePositionFilter("FW")}
              type="button"
            >
              공격수
            </PositionTab>
          </PositionTabs>

          <PlayersList>
            {filteredPlayers.map((player) => {
              const isAssigned = Object.values(assignedPlayers).includes(
                player.id
              );
              const isSelected = selectedPlayer?.id === player.id;
              const isDragging = draggedPlayer?.id === player.id;

              return (
                <DraggablePlayerCard
                  key={player.id}
                  position={player.position}
                  isSelected={isSelected}
                  isDragging={isDragging}
                  onClick={() => handleSelectPlayer(player)}
                  draggable={!isAssigned || isSelected}
                  onDragStart={(e) => handleDragStart(e, player)}
                  onDragEnd={handleDragEnd}
                  style={{
                    opacity: isAssigned && !isSelected && !isDragging ? 0.5 : 1,
                  }}
                >
                  <PlayerCardHeader position={player.position}>
                    <span>{player.position}</span>
                    <PlayerRating>{player.rating}</PlayerRating>
                  </PlayerCardHeader>
                  <PlayerName>{player.name}</PlayerName>
                  {isAssigned && !isSelected && <small>(배치됨)</small>}
                </DraggablePlayerCard>
              );
            })}
          </PlayersList>

          <SaveSquadButton type="button" onClick={handleSaveSquad}>
            스쿼드 저장
          </SaveSquadButton>
        </SquadMakerContainer>

        <Button type="submit">전략 생성</Button>
      </form>
    </>
  );

  const renderEditMode = () => {
    const strategy = strategies.find((s) => s.id === parseInt(id || "0"));
    if (!strategy) {
      return (
        <>
          <Title>전략을 찾을 수 없습니다</Title>
          <p>요청하신 전략을 찾을 수 없습니다.</p>
          <Button onClick={handleBack}>돌아가기</Button>
        </>
      );
    }

    return (
      <>
        <Title>전략 수정하기</Title>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">전략 이름</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="전략 이름을 입력하세요"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="formation">포메이션</Label>
            <Select
              id="formation"
              name="formation"
              value={formData.formation}
              onChange={handleInputChange}
              required
            >
              <option value="4-4-2">4-4-2</option>
              <option value="4-3-3">4-3-3</option>
              <option value="3-5-2">3-5-2</option>
              <option value="5-3-2">5-3-2</option>
              <option value="4-2-3-1">4-2-3-1</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">전략 설명</Label>
            <Input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="전략에 대한 간단한 설명"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="attackStyle">공격 스타일</Label>
            <Input
              type="text"
              id="attackStyle"
              name="attackStyle"
              value={formData.attackStyle}
              onChange={handleInputChange}
              placeholder="공격 스타일 (예: 빠른 역습, 점유율 기반 공격 등)"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="defenseStyle">수비 스타일</Label>
            <Input
              type="text"
              id="defenseStyle"
              name="defenseStyle"
              value={formData.defenseStyle}
              onChange={handleInputChange}
              placeholder="수비 스타일 (예: 높은 압박, 낮은 블록 등)"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="specialInstructions">특별 지시사항</Label>
            <TextArea
              id="specialInstructions"
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleInputChange}
              placeholder="팀에 대한 특별 지시사항을 입력하세요"
            />
          </FormGroup>

          {/* 스쿼드 메이커 섹션 */}
          <SquadHeader>스쿼드 구성</SquadHeader>
          <SquadMakerContainer>
            <PitchContainer>
              <PitchLines />
              <PitchCenter />
              {squadPositions.map((position) => {
                const playerId = assignedPlayers[position.id];
                const player = playerId
                  ? samplePlayers.find((p) => p.id === playerId)
                  : null;

                return (
                  <DropZone
                    key={position.id}
                    x={position.x}
                    y={position.y}
                    isOccupied={!!player}
                    isOver={dragOverPositionId === position.id}
                    onClick={() =>
                      handleSelectPosition(position.id, position.position)
                    }
                    onDragOver={(e) =>
                      handleDragOver(e, position.id, position.position)
                    }
                    onDrop={(e) =>
                      handleDrop(e, position.id, position.position)
                    }
                    onDragLeave={handleDragLeave}
                  >
                    <PlayerInfo>
                      {player ? (
                        <>
                          {player.name.substring(0, 3)}
                          <br />
                          {player.position}
                        </>
                      ) : (
                        position.position
                      )}
                    </PlayerInfo>
                  </DropZone>
                );
              })}
            </PitchContainer>

            <PositionTabs>
              <PositionTab
                active={currentPosition === "ALL"}
                onClick={() => handleChangePositionFilter("ALL")}
                type="button"
              >
                전체
              </PositionTab>
              <PositionTab
                active={currentPosition === "GK"}
                onClick={() => handleChangePositionFilter("GK")}
                type="button"
              >
                골키퍼
              </PositionTab>
              <PositionTab
                active={currentPosition === "DF"}
                onClick={() => handleChangePositionFilter("DF")}
                type="button"
              >
                수비수
              </PositionTab>
              <PositionTab
                active={currentPosition === "MF"}
                onClick={() => handleChangePositionFilter("MF")}
                type="button"
              >
                미드필더
              </PositionTab>
              <PositionTab
                active={currentPosition === "FW"}
                onClick={() => handleChangePositionFilter("FW")}
                type="button"
              >
                공격수
              </PositionTab>
            </PositionTabs>

            <PlayersList>
              {filteredPlayers.map((player) => {
                const isAssigned = Object.values(assignedPlayers).includes(
                  player.id
                );
                const isSelected = selectedPlayer?.id === player.id;
                const isDragging = draggedPlayer?.id === player.id;

                return (
                  <DraggablePlayerCard
                    key={player.id}
                    position={player.position}
                    isSelected={isSelected}
                    isDragging={isDragging}
                    onClick={() => handleSelectPlayer(player)}
                    draggable={!isAssigned || isSelected}
                    onDragStart={(e) => handleDragStart(e, player)}
                    onDragEnd={handleDragEnd}
                    style={{
                      opacity:
                        isAssigned && !isSelected && !isDragging ? 0.5 : 1,
                    }}
                  >
                    <PlayerCardHeader position={player.position}>
                      <span>{player.position}</span>
                      <PlayerRating>{player.rating}</PlayerRating>
                    </PlayerCardHeader>
                    <PlayerName>{player.name}</PlayerName>
                    {isAssigned && !isSelected && <small>(배치됨)</small>}
                  </DraggablePlayerCard>
                );
              })}
            </PlayersList>

            <SaveSquadButton type="button" onClick={handleSaveSquad}>
              스쿼드 저장
            </SaveSquadButton>
          </SquadMakerContainer>

          <ButtonGroup>
            <ButtonSecondary type="button" onClick={handleBack}>
              취소
            </ButtonSecondary>
            <Button type="submit">전략 수정 완료</Button>
          </ButtonGroup>
        </form>
      </>
    );
  };

  const renderViewMode = () => {
    const strategy = strategies.find((s) => s.id === parseInt(id || "0"));

    if (!strategy) {
      return (
        <>
          <Title>전략을 찾을 수 없습니다</Title>
          <p>요청하신 전략을 찾을 수 없습니다.</p>
          <Button onClick={handleBack}>돌아가기</Button>
        </>
      );
    }

    return (
      <>
        <Title>{strategy.name}</Title>

        <DetailItem>
          <DetailLabel>포메이션</DetailLabel>
          <DetailValue>{strategy.formation}</DetailValue>
        </DetailItem>

        <DetailItem>
          <DetailLabel>설명</DetailLabel>
          <DetailValue>{strategy.description}</DetailValue>
        </DetailItem>

        <DetailItem>
          <DetailLabel>공격 스타일</DetailLabel>
          <DetailValue>{strategy.attackStyle}</DetailValue>
        </DetailItem>

        <DetailItem>
          <DetailLabel>수비 스타일</DetailLabel>
          <DetailValue>{strategy.defenseStyle}</DetailValue>
        </DetailItem>

        <DetailItem>
          <DetailLabel>특별 지시사항</DetailLabel>
          <DetailValue>{strategy.specialInstructions}</DetailValue>
        </DetailItem>

        <ButtonGroup>
          <ButtonSecondary onClick={handleEdit}>수정하기</ButtonSecondary>
          <ButtonSecondary onClick={handleQuickMatch}>
            빠른 대전
          </ButtonSecondary>
          <Button onClick={handleFiveMinuteMatch}>5분 대전</Button>
        </ButtonGroup>
      </>
    );
  };

  const renderListMode = () => (
    <>
      <Title>내 전략 목록</Title>

      {strategies.length === 0 ? (
        <div>
          <p>저장된 전략이 없습니다. 새로운 전략을 만들어 보세요!</p>
        </div>
      ) : (
        <div>
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: "0 0 8px 0" }}>{strategy.name}</h3>
              <p style={{ margin: "0 0 8px 0" }}>
                포메이션: {strategy.formation}
              </p>
              <p style={{ margin: "0 0 16px 0" }}>{strategy.description}</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <ButtonSecondary
                  onClick={() => navigate(`/strategy/${strategy.id}`)}
                >
                  보기
                </ButtonSecondary>
                <ButtonSecondary
                  onClick={() => handleEditStrategy(strategy.id)}
                >
                  수정
                </ButtonSecondary>
                <ButtonSecondary
                  onClick={() => handleDeleteStrategy(strategy.id)}
                  style={{ backgroundColor: "#d32f2f" }}
                >
                  삭제
                </ButtonSecondary>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button onClick={() => navigate("/strategy/create")}>
        새 전략 만들기
      </Button>
    </>
  );

  return (
    <StrategyContainer>
      {mode === "create" && renderCreateMode()}
      {mode === "edit" && renderEditMode()}
      {mode === "view" && renderViewMode()}
      {mode === "list" && renderListMode()}
    </StrategyContainer>
  );
};

export default StrategyPage;
