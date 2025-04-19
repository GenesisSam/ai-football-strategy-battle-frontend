import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.large};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.fonts.bodySize};
  max-width: 600px;
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const StrategiesContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: ${({ theme }) => theme.spacing.large} 0;
`;

const StrategyList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const StrategyItem = styled.li`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.medium};
  margin-bottom: ${({ theme }) => theme.spacing.small};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }
`;

const StrategyName = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const StrategyDescription = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const CreateButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.small}
    ${({ theme }) => theme.spacing.large};
  font-size: ${({ theme }) => theme.fonts.bodySize};
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const STRATEGIES_STORAGE_KEY = "football-strategies";

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

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  useEffect(() => {
    const savedStrategies = localStorage.getItem(STRATEGIES_STORAGE_KEY);
    if (savedStrategies) {
      setStrategies(JSON.parse(savedStrategies));
    }
  }, []);

  const handleCreateStrategy = () => {
    navigate("/strategy/create");
  };

  const handleStrategyClick = (id: number) => {
    navigate(`/strategy/${id}`);
  };

  const displayStrategies =
    strategies.length > 0
      ? strategies
      : [
          {
            id: 1,
            name: "4-3-3 공격적 전략",
            description: "높은 압박과 빠른 공격 전환",
            formation: "4-3-3",
            attackStyle: "",
            defenseStyle: "",
            specialInstructions: "",
          },
          {
            id: 2,
            name: "5-3-2 수비적 전략",
            description: "견고한 수비와 역습 전략",
            formation: "5-3-2",
            attackStyle: "",
            defenseStyle: "",
            specialInstructions: "",
          },
          {
            id: 3,
            name: "4-4-2 밸런스 전략",
            description: "균형 잡힌 공수 운영",
            formation: "4-4-2",
            attackStyle: "",
            defenseStyle: "",
            specialInstructions: "",
          },
          {
            id: 4,
            name: "3-5-2 측면 활용 전략",
            description: "윙백을 활용한 측면 공격",
            formation: "3-5-2",
            attackStyle: "",
            defenseStyle: "",
            specialInstructions: "",
          },
          {
            id: 5,
            name: "4-2-3-1 미드필드 장악",
            description: "중원 장악을 통한 경기 운영",
            formation: "4-2-3-1",
            attackStyle: "",
            defenseStyle: "",
            specialInstructions: "",
          },
        ];

  return (
    <HomeContainer>
      <Title>AI 축구 전략 배틀</Title>
      <Description>
        인공지능 기반 축구 전략 시뮬레이션에 오신 것을 환영합니다. 자신만의
        전략을 만들고 다른 플레이어와 경쟁해보세요!
      </Description>

      <StrategiesContainer>
        <SectionTitle>
          {strategies.length > 0 ? "내 전략" : "인기 전략"}
        </SectionTitle>
        <StrategyList>
          {displayStrategies.map((strategy) => (
            <StrategyItem
              key={strategy.id}
              onClick={() => handleStrategyClick(strategy.id)}
            >
              <StrategyName>{strategy.name}</StrategyName>
              <StrategyDescription>{strategy.description}</StrategyDescription>
            </StrategyItem>
          ))}
        </StrategyList>
        <CreateButton onClick={handleCreateStrategy}>
          나만의 전략 만들기
        </CreateButton>
      </StrategiesContainer>
    </HomeContainer>
  );
};

export default HomePage;
