import React, { useState } from "react";
import styled from "styled-components";

const StrategyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.large};
  max-width: 1200px;
  margin: 0 auto;
`;

const StrategyHeader = styled.div`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.large};
  text-align: center;
`;

const StrategyTitle = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const StrategyForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing.small};
  color: ${({ theme }) => theme.colors.dark};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.medium};
  border: 1px solid ${({ theme }) => theme.colors.neutral};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.fonts.bodySize};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(160, 32, 240, 0.2);
  }
`;

const Textarea = styled.textarea`
  padding: ${({ theme }) => theme.spacing.medium};
  border: 1px solid ${({ theme }) => theme.colors.neutral};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.fonts.bodySize};
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(160, 32, 240, 0.2);
  }
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.medium};
  border: 1px solid ${({ theme }) => theme.colors.neutral};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.fonts.bodySize};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.medium};
  border: none;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.fonts.bodySize};
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.medium};
  margin-top: ${({ theme }) => theme.spacing.large};
`;

const CancelButton = styled(Button)`
  background-color: white;
  color: ${({ theme }) => theme.colors.dark};
  border: 1px solid ${({ theme }) => theme.colors.neutral};

  &:hover {
    background-color: ${({ theme }) => theme.colors.light};
    color: ${({ theme }) => theme.colors.dark};
  }
`;

const FormationContainer = styled.div`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.large};
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.large};
`;

const FormationVisualizer = styled.div`
  width: 60%;
  background-color: #4caf50;
  height: 400px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
`;

const FormationField = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background-image: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 0.2)
    ),
    linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 0.2)
    );
  background-size: 2px 100%, 100% 2px;
  background-position: center, center;
  background-repeat: no-repeat;
`;

const FormationSidebar = styled.div`
  width: 38%;
  display: flex;
  flex-direction: column;
`;

const FormationOptions = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const StrategyOptions = styled.div`
  margin-top: ${({ theme }) => theme.spacing.large};
`;

const PlaybackButton = styled.button`
  background-color: ${({ theme }) => theme.colors.success};
  color: white;
  padding: ${({ theme }) => theme.spacing.medium};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.medium};

  &:hover {
    background-color: #2d9300;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.neutral};
    cursor: not-allowed;
  }
`;

const PlayerMarker = styled.div<{ x: number; y: number; isSelected: boolean }>`
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.isSelected ? ({ theme }) => theme.colors.info : "blue"};
  transform: translate(-50%, -50%);
  left: ${(props) => props.x}%;
  top: ${(props) => props.y}%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: ${(props) => (props.isSelected ? "2px solid white" : "none")};
  transition: all 0.2s ease;
  z-index: 10;
`;

const PlayerCard = styled.div<{ isSelected: boolean }>`
  border: 1px solid
    ${(props) =>
      props.isSelected
        ? ({ theme }) => theme.colors.primary
        : ({ theme }) => theme.colors.neutral};
  border-radius: 4px;
  padding: ${({ theme }) => theme.spacing.medium};
  margin-bottom: ${({ theme }) => theme.spacing.small};
  cursor: pointer;
  background-color: ${(props) =>
    props.isSelected ? ({ theme }) => theme.colors.accent + "30" : "white"};

  &:hover {
    background-color: ${({ theme }) => theme.colors.light};
  }
`;

const PlayerName = styled.div`
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const PlayerRole = styled.div`
  color: ${({ theme }) => theme.colors.neutral};
  font-size: 0.9em;
`;

const StrategyPage: React.FC = () => {
  const [strategyName, setStrategyName] = useState("");
  const [strategyDescription, setStrategyDescription] = useState("");
  const [formation, setFormation] = useState("4-4-2");
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  // 선수 위치 데이터
  const [players, setPlayers] = useState([
    {
      id: 1,
      name: "골키퍼",
      position: "GK",
      x: 10,
      y: 50,
      role: "골키퍼",
      instructions: "기본 수비",
    },
    {
      id: 2,
      name: "왼쪽 수비수",
      position: "LB",
      x: 20,
      y: 20,
      role: "수비수",
      instructions: "측면 오버랩",
    },
    {
      id: 3,
      name: "중앙 수비수",
      position: "CB",
      x: 20,
      y: 40,
      role: "수비수",
      instructions: "중앙 수비 집중",
    },
    {
      id: 4,
      name: "중앙 수비수",
      position: "CB",
      x: 20,
      y: 60,
      role: "수비수",
      instructions: "중앙 수비 집중",
    },
    {
      id: 5,
      name: "오른쪽 수비수",
      position: "RB",
      x: 20,
      y: 80,
      role: "수비수",
      instructions: "측면 오버랩",
    },
    {
      id: 6,
      name: "왼쪽 미드필더",
      position: "LM",
      x: 40,
      y: 20,
      role: "미드필더",
      instructions: "측면 공격 지원",
    },
    {
      id: 7,
      name: "중앙 미드필더",
      position: "CM",
      x: 40,
      y: 40,
      role: "미드필더",
      instructions: "공수 조율",
    },
    {
      id: 8,
      name: "중앙 미드필더",
      position: "CM",
      x: 40,
      y: 60,
      role: "미드필더",
      instructions: "공수 조율",
    },
    {
      id: 9,
      name: "오른쪽 미드필더",
      position: "RM",
      x: 40,
      y: 80,
      role: "미드필더",
      instructions: "측면 공격 지원",
    },
    {
      id: 10,
      name: "왼쪽 공격수",
      position: "LF",
      x: 70,
      y: 35,
      role: "공격수",
      instructions: "골 집중",
    },
    {
      id: 11,
      name: "오른쪽 공격수",
      position: "RF",
      x: 70,
      y: 65,
      role: "공격수",
      instructions: "골 집중",
    },
  ]);

  // 전략 인공지능 지시사항
  const [aiInstructions, setAiInstructions] = useState(
    "적극적으로 공격하며 공간을 활용한 패스 플레이를 중시합니다."
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 전략 저장 로직 (API 호출 등)
    console.log("전략 저장:", {
      strategyName,
      strategyDescription,
      formation,
      players,
      aiInstructions,
    });
    // 저장 성공 시 홈 페이지로 리다이렉트
    // window.location.href = "/";
  };

  const handleCancel = () => {
    // 홈으로 돌아가기
    window.history.back();
  };

  const handlePlayerSelect = (playerId: number) => {
    setSelectedPlayerId(selectedPlayerId === playerId ? null : playerId);
  };

  const handleFormationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormation = e.target.value;
    setFormation(newFormation);

    // 여기서 선택된 포메이션에 따라 선수 위치를 재조정할 수 있음
    // 예: 4-3-3, 4-4-2, 3-5-2 등의 포메이션별 기본 위치 설정

    // 간단한 시뮬레이션을 위한 예시
    if (newFormation === "4-3-3") {
      // 4-3-3 포메이션 선수 위치 설정
      const updated433Players = [...players];
      // 대략적인 위치 조정 (실제 구현 시 더 정교하게 계산해야 함)
      // ...
    }
  };

  const handlePlaybackStrategy = () => {
    setIsPlaybackActive(true);

    // 여기서 전략 시뮬레이션을 실행할 수 있음
    // 예: 선수들이 전략에 따라 움직이는 애니메이션 등

    setTimeout(() => {
      setIsPlaybackActive(false);
    }, 5000); // 5초 후 시뮬레이션 종료
  };

  const handlePlayerRoleChange = (playerId: number, newRole: string) => {
    setPlayers(
      players.map((player) =>
        player.id === playerId ? { ...player, role: newRole } : player
      )
    );
  };

  const handlePlayerInstructionsChange = (
    playerId: number,
    newInstructions: string
  ) => {
    setPlayers(
      players.map((player) =>
        player.id === playerId
          ? { ...player, instructions: newInstructions }
          : player
      )
    );
  };

  // 선택된 선수 정보
  const selectedPlayer = players.find(
    (player) => player.id === selectedPlayerId
  );

  return (
    <StrategyContainer>
      <StrategyHeader>
        <StrategyTitle>새 전략 만들기</StrategyTitle>
        <p>
          팀 포메이션과 선수별 역할을 설정하여 자신만의 전략을 만들어보세요!
        </p>
      </StrategyHeader>

      <StrategyForm onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="strategyName">전략 이름</Label>
          <Input
            id="strategyName"
            type="text"
            value={strategyName}
            onChange={(e) => setStrategyName(e.target.value)}
            placeholder="예: 빠른 역습 전략"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="strategyDesc">전략 설명</Label>
          <Textarea
            id="strategyDesc"
            value={strategyDescription}
            onChange={(e) => setStrategyDescription(e.target.value)}
            placeholder="전략에 대한 간략한 설명을 입력해주세요"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="formation">포메이션 선택</Label>
          <Select
            id="formation"
            value={formation}
            onChange={handleFormationChange}
          >
            <option value="4-4-2">4-4-2 (밸런스)</option>
            <option value="4-3-3">4-3-3 (공격)</option>
            <option value="5-3-2">5-3-2 (수비)</option>
            <option value="3-5-2">3-5-2 (미드필드 집중)</option>
            <option value="4-2-3-1">4-2-3-1 (카운터)</option>
          </Select>
        </FormGroup>

        <FormationContainer>
          <FormationVisualizer>
            <FormationField>
              {players.map((player) => (
                <PlayerMarker
                  key={player.id}
                  x={player.x}
                  y={player.y}
                  isSelected={player.id === selectedPlayerId}
                  onClick={() => handlePlayerSelect(player.id)}
                >
                  {player.id}
                </PlayerMarker>
              ))}
            </FormationField>
          </FormationVisualizer>

          <FormationSidebar>
            <FormationOptions>
              <h3>선수 목록</h3>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    isSelected={player.id === selectedPlayerId}
                    onClick={() => handlePlayerSelect(player.id)}
                  >
                    <PlayerName>
                      {player.name} ({player.position})
                    </PlayerName>
                    <PlayerRole>{player.role}</PlayerRole>
                  </PlayerCard>
                ))}
              </div>

              <PlaybackButton
                onClick={handlePlaybackStrategy}
                disabled={isPlaybackActive}
              >
                {isPlaybackActive ? "재생 중..." : "전략 시뮬레이션"}
              </PlaybackButton>
            </FormationOptions>

            {selectedPlayer && (
              <StrategyOptions>
                <h3>선수 지시사항</h3>
                <FormGroup>
                  <Label htmlFor="playerRole">역할</Label>
                  <Select
                    id="playerRole"
                    value={selectedPlayer.role}
                    onChange={(e) =>
                      handlePlayerRoleChange(selectedPlayer.id, e.target.value)
                    }
                  >
                    <option value="골키퍼">골키퍼</option>
                    <option value="수비수">수비수</option>
                    <option value="미드필더">미드필더</option>
                    <option value="공격수">공격수</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="playerInstructions">상세 지시사항</Label>
                  <Textarea
                    id="playerInstructions"
                    value={selectedPlayer.instructions}
                    onChange={(e) =>
                      handlePlayerInstructionsChange(
                        selectedPlayer.id,
                        e.target.value
                      )
                    }
                    placeholder="이 선수에 대한 구체적인 지시사항을 입력해주세요"
                  />
                </FormGroup>
              </StrategyOptions>
            )}
          </FormationSidebar>
        </FormationContainer>

        <FormGroup>
          <Label htmlFor="aiInstructions">AI 전략 지시사항</Label>
          <Textarea
            id="aiInstructions"
            value={aiInstructions}
            onChange={(e) => setAiInstructions(e.target.value)}
            placeholder="인공지능에게 전체적인 전략 방향을 설명해주세요"
            rows={5}
          />
        </FormGroup>

        <ButtonGroup>
          <CancelButton type="button" onClick={handleCancel}>
            취소
          </CancelButton>
          <Button type="submit">전략 저장</Button>
        </ButtonGroup>
      </StrategyForm>
    </StrategyContainer>
  );
};

export default StrategyPage;
