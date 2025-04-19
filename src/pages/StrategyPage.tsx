import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { useSquad } from "../context/SquadContext";
import { Player, SquadRequest } from "../api/squad";
import FootballFieldDisplay, {
  PositionPlayer,
} from "../components/strategy/FootballFieldDisplay";
import PlayerSelectionModal from "../components/strategy/PlayerSelectionModal";
import BasicInfoForm from "../components/strategy/BasicInfoForm";
import StrategyForm from "../components/strategy/StrategyForm";
import formations from "../data/formations";

// 축구장 배경 스타일
const StrategyContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.large};
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.small}
    ${({ theme }) => theme.spacing.medium};
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.neutral};
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.danger};

  &:hover {
    background-color: #c62828;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  margin-top: 8px;
  grid-template-columns: 1fr 3fr;
  gap: ${({ theme }) => theme.spacing.large};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Message = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  background-color: ${({ theme }) => theme.colors.light};
  border-radius: 4px;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  text-align: center;
  color: ${({ theme }) => theme.colors.dark};
`;

const FormSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xsmall};
  font-weight: bold;
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.small};
  border: 1px solid ${({ theme }) => theme.colors.neutral};
  border-radius: 4px;
`;

const FormationOptGroup = styled.optgroup`
  font-weight: bold;
`;

const StrategyPage: React.FC = () => {
  const { id } = useParams();
  const isNewStrategy = id === undefined;
  const navigate = useNavigate();
  const refLoading = React.useRef(false);

  const { fetchSquadById, createNewSquad, updateExistingSquad, isLoading } =
    useSquad();

  // 스쿼드 상태
  const [squadName, setSquadName] = useState<string>("");
  const [formation, setFormation] = useState<string>("4-3-3");
  const [players, setPlayers] = useState<PositionPlayer[]>([]);

  // 전략 상태
  const [attackStyle, setAttackStyle] = useState<string>("");
  const [defenseStyle, setDefenseStyle] = useState<string>("");
  const [specialInstructions, setSpecialInstructions] = useState<string>("");

  // 선수 선택 모달 상태
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedPositionIndex, setSelectedPositionIndex] = useState<
    number | null
  >(null);

  // 유효성 검사
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 스쿼드 로딩
  useEffect(() => {
    if (!isNewStrategy && id && !refLoading.current) {
      refLoading.current = true;
      fetchSquadById(id).then((squad) => {
        if (squad) {
          setSquadName(squad.name);
          setFormation(squad.formation);

          // 선수들을 포지션 인덱스와 함께 저장
          const playersWithPositions: PositionPlayer[] = squad.players.map(
            (player, index) => ({
              ...player,
              positionIndex: index,
            })
          );

          setPlayers(playersWithPositions);

          // 전략 정보 파싱
          const strategyLines = squad.strategy.split("\n");
          if (strategyLines.length >= 3) {
            setAttackStyle(strategyLines[0]);
            setDefenseStyle(strategyLines[1]);
            setSpecialInstructions(strategyLines.slice(2).join("\n"));
          } else {
            setSpecialInstructions(squad.strategy);
          }

          refLoading.current = false;
        }
      });
    }
  }, [id]);

  // 포지션 클릭 핸들러 - useCallback으로 최적화
  const handlePositionClick = useCallback((positionIndex: number) => {
    setSelectedPositionIndex(positionIndex);
    setShowModal(true);
  }, []);

  // 선수 선택 핸들러 - useCallback으로 최적화
  const handleSelectPlayer = useCallback(
    (playerName: string, position: string) => {
      setPlayers((prev) => {
        if (selectedPositionIndex === null) return prev;

        // 이미 선택된 선수인지 확인
        const isAlreadySelected = prev.some(
          (p) =>
            p.name === playerName && p.positionIndex !== selectedPositionIndex
        );

        // 이미 다른 포지션에 배치된 선수라면 기존 선수를 유지
        if (isAlreadySelected) {
          return prev;
        }

        // 선택된 선수에 맞는 능력치 생성
        const attributes = generatePlayerAttributes(position);

        const newPlayer: Player = {
          name: playerName,
          position,
          attributes,
        };

        const newPlayers = [...prev];
        const existingIndex = prev.findIndex(
          (p) => p.positionIndex === selectedPositionIndex
        );

        if (existingIndex >= 0) {
          // 기존 선수 교체
          newPlayers[existingIndex] = {
            ...newPlayer,
            positionIndex: selectedPositionIndex,
          };
        } else {
          // 새 선수 추가
          newPlayers.push({
            ...newPlayer,
            positionIndex: selectedPositionIndex,
          });
        }

        return newPlayers;
      });

      setShowModal(false);
    },
    [selectedPositionIndex]
  );

  // 모달 닫기 핸들러
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  // 선수 능력치 생성
  const generatePlayerAttributes = (position: string) => {
    const baseAttributes = {
      pace: 70 + Math.floor(Math.random() * 20),
      tackling: 70 + Math.floor(Math.random() * 20),
      marking: 70 + Math.floor(Math.random() * 20),
      passing: 70 + Math.floor(Math.random() * 20),
      heading: 70 + Math.floor(Math.random() * 20),
      shooting: 70 + Math.floor(Math.random() * 20),
      dribbling: 70 + Math.floor(Math.random() * 20),
    };

    // 포지션에 따라 능력치 조정
    if (position === "GK") {
      return {
        reflexes: 75 + Math.floor(Math.random() * 15),
        handling: 75 + Math.floor(Math.random() * 15),
        kicking: 70 + Math.floor(Math.random() * 15),
        positioning: 75 + Math.floor(Math.random() * 15),
        diving: 75 + Math.floor(Math.random() * 15),
      };
    } else if (position.includes("B") || position === "CB") {
      return {
        ...baseAttributes,
        tackling: baseAttributes.tackling + 10,
        marking: baseAttributes.marking + 10,
        heading: baseAttributes.heading + 5,
      };
    } else if (position.includes("M")) {
      return {
        ...baseAttributes,
        passing: baseAttributes.passing + 10,
        dribbling: baseAttributes.dribbling + 5,
      };
    } else {
      // 공격수
      return {
        ...baseAttributes,
        shooting: baseAttributes.shooting + 10,
        dribbling: baseAttributes.dribbling + 5,
        pace: baseAttributes.pace + 5,
      };
    }
  };

  // 폼 제출 핸들러 - useCallback으로 최적화
  const handleSubmit = useCallback(async () => {
    // 유효성 검사
    const validationErrors: { [key: string]: string } = {};

    if (!squadName.trim()) {
      validationErrors.squadName = "팀 이름을 입력하세요";
    }

    if (players.length < 11) {
      validationErrors.players = "11명의 선수를 모두 선택하세요";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // 전략 문자열 생성
    const strategy = `${attackStyle}\n${defenseStyle}\n${specialInstructions}`;

    // API 요청 데이터 생성
    const requestData: SquadRequest = {
      name: squadName,
      formation,
      players: players
        .sort((a, b) => a.positionIndex - b.positionIndex)
        .map((p) => ({
          name: p.name,
          position: p.position,
          attributes: p.attributes,
        })),
      strategy,
    };

    try {
      if (isNewStrategy) {
        // 새 스쿼드 생성
        const newSquad = await createNewSquad(requestData);
        if (newSquad) {
          navigate("/");
        }
      } else if (id) {
        // 기존 스쿼드 업데이트
        const updatedSquad = await updateExistingSquad(id, requestData);
        if (updatedSquad) {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("스쿼드 저장 오류:", error);
      setErrors({
        submit: "스쿼드 저장 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    }
  }, [
    squadName,
    formation,
    players,
    attackStyle,
    defenseStyle,
    specialInstructions,
    isNewStrategy,
    id,
    createNewSquad,
    updateExistingSquad,
    navigate,
  ]);

  // 현재 포메이션에 따른 포지션들 - useMemo로 최적화
  const currentPositions = useMemo(() => {
    return formations[formation]?.positions || [];
  }, [formation]);

  // 포메이션 변경 핸들러 - useCallback으로 최적화
  const handleFormationChange = useCallback((newFormation: string) => {
    setFormation(newFormation);
    setPlayers([]); // 포메이션 변경 시 선수 포지션 재설정
  }, []);

  // 취소 버튼 핸들러 - useCallback으로 최적화
  const handleCancel = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // 현재 선택된 포지션 이름 가져오기
  const selectedPositionName = useMemo(() => {
    if (
      selectedPositionIndex !== null &&
      currentPositions[selectedPositionIndex]
    ) {
      return currentPositions[selectedPositionIndex].position;
    }
    return "";
  }, [selectedPositionIndex, currentPositions]);

  return (
    <StrategyContainer>
      <Header>
        <Title>{isNewStrategy ? "새 전략 만들기" : "전략 수정하기"}</Title>
        <ActionButtons>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "저장 중..." : "전략 저장"}
          </Button>
          <CancelButton onClick={handleCancel}>취소</CancelButton>
        </ActionButtons>
      </Header>

      {errors.submit && <Message>{errors.submit}</Message>}

      <ContentGrid>
        <div>
          <BasicInfoForm
            squadName={squadName}
            formation={formation}
            onSquadNameChange={setSquadName}
            onFormationChange={handleFormationChange}
            squadNameError={errors.squadName}
          />

          <StrategyForm
            attackStyle={attackStyle}
            defenseStyle={defenseStyle}
            specialInstructions={specialInstructions}
            onAttackStyleChange={setAttackStyle}
            onDefenseStyleChange={setDefenseStyle}
            onSpecialInstructionsChange={setSpecialInstructions}
          />
        </div>

        <div>
          <FormSection>
            <FormGroup>
              <Label htmlFor="formation">포메이션</Label>
              <Select
                id="formation"
                value={formation}
                onChange={(e) => handleFormationChange(e.target.value)}
              >
                <FormationOptGroup label="3 Back">
                  <option value="3-4-3">3-4-3</option>
                  <option value="3-4-1-2">3-4-1-2</option>
                  <option value="3-2-3-2">3-2-3-2</option>
                  <option value="3-2-2-1-2">3-2-2-1-2</option>
                  <option value="3-1-2-1-3">3-1-2-1-3</option>
                  <option value="3-1-4-2">3-1-4-2</option>
                </FormationOptGroup>
                <FormationOptGroup label="4 Back">
                  <option value="4-5-1">4-5-1</option>
                  <option value="4-4-2">4-4-2</option>
                  <option value="4-4-1-1">4-4-1-1</option>
                  <option value="4-3-3">4-3-3</option>
                  <option value="4-3-2-1">4-3-2-1</option>
                  <option value="4-3-1-2">4-3-1-2</option>
                  <option value="4-2-4">4-2-4</option>
                  <option value="4-2-3-1">4-2-3-1</option>
                  <option value="4-2-2-2">4-2-2-2</option>
                  <option value="4-2-2-1-1">4-2-2-1-1</option>
                  <option value="4-2-1-3">4-2-1-3</option>
                  <option value="4-1-4-1">4-1-4-1</option>
                  <option value="4-1-3-2">4-1-3-2</option>
                  <option value="4-1-2-3">4-1-2-3</option>
                  <option value="4-1-2-1-2">4-1-2-1-2</option>
                </FormationOptGroup>
                <FormationOptGroup label="5 Back">
                  <option value="5-4-1">5-4-1</option>
                  <option value="5-3-2">5-3-2</option>
                  <option value="5-2-3">5-2-3</option>
                  <option value="5-2-1-2">5-2-1-2</option>
                  <option value="5-1-2-1-1">5-1-2-1-1</option>
                </FormationOptGroup>
              </Select>
            </FormGroup>
          </FormSection>
          <FootballFieldDisplay
            positions={currentPositions}
            players={players}
            onPositionClick={handlePositionClick}
            error={errors.players}
          />
        </div>
      </ContentGrid>

      <PlayerSelectionModal
        show={showModal}
        onClose={handleCloseModal}
        positionName={selectedPositionName}
        onSelectPlayer={handleSelectPlayer}
        isLoading={false}
      />
    </StrategyContainer>
  );
};

export default StrategyPage;
