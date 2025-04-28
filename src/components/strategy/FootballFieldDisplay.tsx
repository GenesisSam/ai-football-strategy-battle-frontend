import React from "react";
import styled from "styled-components";
import { Player } from "../../api/squad";

// 축구장 배경
const FootballField = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  background-color: #4c9141; /* 축구장 녹색 */
  background-image: radial-gradient(
      circle at center,
      rgba(255, 255, 255, 0.3) 9px,
      transparent 10px
    ),
    linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px);

  border: 2px solid white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.2);

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
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid white;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

// 골대 영역
const GoalArea = styled.div`
  position: absolute;
  width: 150px;
  height: 60px;
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

// 패널티 에어리어
const PenaltyArea = styled.div`
  position: absolute;
  width: 300px;
  height: 120px;
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

// 선수 포지션
const PlayerPosition = styled.div<{
  top: string;
  left: string;
  selected: boolean;
}>`
  position: absolute;
  width: 46px;
  height: 46px;
  top: ${(props) => props.top};
  left: ${(props) => props.left};
  background-color: #ffffff;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.dark};
  z-index: 2;
  transform: translate(-50%, -50%); /* 중앙 정렬을 위한 수정 */
  background-color: ${({ selected, theme }) =>
    selected ? theme.colors.primary : "#ffffff"};
  color: ${({ selected, theme }) => (selected ? "white" : theme.colors.dark)};
  box-shadow: ${({ selected }) =>
    selected ? "0 0 10px rgba(0, 0, 0, 0.5)" : "none"};
  border: ${({ selected, theme }) =>
    selected ? `2px solid ${theme.colors.primary}` : "2px solid white"};
  font-size: ${({ selected }) => (selected ? "1.2rem" : "1rem")};
  font-weight: ${({ selected }) => (selected ? "bold" : "normal")};
  text-align: center;
  line-height: 1.2;
  text-transform: uppercase;
  transition: all 0.3s ease;

  &:hover {
    transform: translate(-50%, -50%) scale(1.1); /* 중앙 정렬 유지하면서 크기 확대 */
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

const FormSection = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.medium};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  & + & {
    margin-top: 4px;
  }
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.dark};
  margin: 0 0 ${({ theme }) => theme.spacing.medium} 0;
  font-size: 1.2rem;
`;

export interface PositionPlayer extends Player {
  positionIndex: number;
}

// 축구장 컴포넌트 분리
export interface FootballFieldDisplayProps {
  positions: Array<{ position: string; top: string; left: string }>;
  players: PositionPlayer[];
  onPositionClick: (index: number) => void;
  error?: string;
}

const FootballFieldDisplay: React.FC<FootballFieldDisplayProps> = React.memo(
  ({ positions, players, onPositionClick, error }) => {
    return (
      <FormSection>
        <SectionTitle>스쿼드 구성</SectionTitle>

        {error && (
          <span
            style={{
              color: "red",
              fontSize: "0.8rem",
              display: "block",
              marginBottom: "10px",
            }}
          >
            {error}
          </span>
        )}

        <FootballField>
          <CenterCircle />
          <GoalArea className="top" />
          <GoalArea className="bottom" />
          <PenaltyArea className="top" />
          <PenaltyArea className="bottom" />

          {positions.map((pos, index) => {
            const playerForPosition = players.find(
              (p) => p.positionIndex === index
            );

            return (
              <PlayerPosition
                key={`pos-${index}`}
                top={pos.top}
                left={pos.left}
                selected={Boolean(playerForPosition)}
                title={playerForPosition ? playerForPosition.name : undefined}
                onClick={() => onPositionClick(index)}
              >
                {playerForPosition
                  ? playerForPosition.name.substring(0, 2)
                  : pos.position}
              </PlayerPosition>
            );
          })}
        </FootballField>

        <div style={{ marginTop: "15px", textAlign: "center" }}>
          선수 포지션을 클릭하여 선수를 선택하세요
        </div>
      </FormSection>
    );
  }
);

FootballFieldDisplay.displayName = "FootballFieldDisplay";

export default FootballFieldDisplay;
