import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import SplashScreen from "../components/SplashScreen";
import { useSquad } from "../context/SquadContext";
import { useAuth } from "../context/AuthContext";
import { useMatch } from "../context/MatchContext";
import AIStyleLoader from "../components/AIStyleLoader";

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.large};
`;

const StrategyList = styled.div`
  width: 100%;
  max-width: 600px;
  margin-top: ${({ theme }) => theme.spacing.large};
`;

const StrategyItem = styled.div`
  background-color: ${({ theme }) => theme.colors.light};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.medium};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const StrategyName = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.dark};
`;

const StrategyDescription = styled.p`
  margin: ${({ theme }) => theme.spacing.small} 0 0;
  color: ${({ theme }) => theme.colors.neutral};
`;

const StrategyActions = styled.div`
  display: flex;
  margin-top: ${({ theme }) => theme.spacing.medium};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.medium};
  border: none;
  margin-right: ${({ theme }) => theme.spacing.small};
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;

  &:last-child {
    margin-right: 0;
  }
`;

const EditButton = styled(ActionButton)`
  background-color: ${({ theme }) => theme.colors.info};
  color: white;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
  }
`;

// 로딩 상태를 표시할 수 있는 버튼으로 개선
const GameMatchButton = styled(ActionButton)<{ $isLoading?: boolean }>`
  background-color: ${({ theme, $isLoading }) =>
    $isLoading ? theme.colors.neutral : theme.colors.secondary};
  color: white;
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: ${({ theme, $isLoading }) =>
      $isLoading ? theme.colors.neutral : theme.colors.primary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  /* 로딩 애니메이션 */
  &::after {
    content: "";
    display: ${({ $isLoading }) => ($isLoading ? "block" : "none")};
    position: absolute;
    width: 30%;
    height: 100%;
    top: 0;
    left: -30%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: loading 1.5s infinite;
  }

  @keyframes loading {
    0% {
      left: -30%;
    }
    100% {
      left: 130%;
    }
  }
`;

const EmptyMessage = styled.p`
  color: ${({ theme }) => theme.colors.neutral};
  font-size: ${({ theme }) => theme.fonts.bodySize};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xlarge};
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.medium};
  border: none;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.fonts.bodySize};
  cursor: pointer;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

interface StrategyItemProps {
  squad: {
    _id: string;
    name: string;
    formation: string;
    isActive: boolean;
  };
  isExpanded: boolean;
  loadingSquadId: string | null;
  onItemClick: (id: string) => void;
  onEditClick: (id: string) => void;
  onGameMatchClick: (id: string) => void;
}

const MemoizedStrategyItem = memo(
  ({
    squad,
    isExpanded,
    loadingSquadId,
    onItemClick,
    onEditClick,
    onGameMatchClick,
  }: StrategyItemProps) => {
    const handleItemClick = useCallback(() => {
      onItemClick(squad._id);
    }, [onItemClick, squad._id]);

    const handleEditClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onEditClick(squad._id);
      },
      [onEditClick, squad._id]
    );

    const handleGameMatchClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onGameMatchClick(squad._id);
      },
      [onGameMatchClick, squad._id]
    );

    const isLoading = loadingSquadId === squad._id;

    return (
      <StrategyItem onClick={handleItemClick}>
        <StrategyName>{squad.name}</StrategyName>
        <StrategyDescription>
          {squad.formation} {squad.isActive && "(활성화됨)"}
        </StrategyDescription>
        {isExpanded && (
          <StrategyActions>
            <EditButton
              onClick={handleEditClick}
              disabled={Boolean(loadingSquadId)}
            >
              수정
            </EditButton>
            <GameMatchButton
              onClick={handleGameMatchClick}
              disabled={Boolean(loadingSquadId)}
              $isLoading={isLoading}
            >
              {isLoading ? "준비 중..." : "게임 대전"}
            </GameMatchButton>
          </StrategyActions>
        )}
      </StrategyItem>
    );
  }
);

const HomePage: React.FC = memo(() => {
  const [showSplash, setShowSplash] = useState(true);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [startingMatch, setStartingMatch] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [loadingSquadId, setLoadingSquadId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { startQuickMatch, startGameMatch, error: matchError } = useMatch();

  const {
    squads,
    isLoading: isSquadLoading,
    fetchSquads,
    activateExistingSquad,
  } = useSquad();

  useEffect(() => {
    if (isAuthenticated) {
      fetchSquads();
    }
  }, [isAuthenticated, fetchSquads]);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleItemClick = useCallback((strategyId: string) => {
    setExpandedItemId((prevId) => (prevId === strategyId ? null : strategyId));
  }, []);

  const handleEditClick = useCallback(
    (squadId: string) => {
      navigate(`/strategy/${squadId}`);
    },
    [navigate]
  );

  // 게임 대전 시작
  const handleGameMatchClick = useCallback(
    async (squadId: string) => {
      try {
        setStartingMatch(true);
        setLoadingSquadId(squadId); // 로딩 중인 스쿼드 ID 저장

        // 선택한 스쿼드를 활성화
        await activateExistingSquad(squadId);

        // 게임 대전 시작 - 서버에 전략 전달
        const jobId = await startGameMatch(squadId);

        if (jobId) {
          // 작업 ID 저장 및 매치 페이지로 이동
          setActiveJobId(jobId);
          navigate(`/match/job/${jobId}`);
        }
      } catch (error) {
        console.error("게임 대전 시작 실패:", error);
      } finally {
        setStartingMatch(false);
        setLoadingSquadId(null); // 로딩 상태 초기화
      }
    },
    [startGameMatch, navigate, activateExistingSquad]
  );

  const loadingComponent = useMemo(
    () => (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <AIStyleLoader />
      </div>
    ),
    []
  );

  if (isAuthLoading || (isAuthenticated && isSquadLoading)) {
    return loadingComponent;
  }

  // 활성 작업이 있으면 해당 작업 페이지로 바로 이동
  if (activeJobId) {
    navigate(`/match/job/${activeJobId}`);
    return null;
  }

  return (
    <>
      {showSplash && (
        <SplashScreen duration={1500} onFinish={handleSplashFinish} />
      )}
      {startingMatch && (
        <LoadingOverlay>
          <AIStyleLoader />
        </LoadingOverlay>
      )}
      <HomeContainer>
        {isAuthenticated ? (
          <StrategyList>
            <h2>나의 전략 목록</h2>
            {squads.length > 0 ? (
              squads.map((squad) => (
                <MemoizedStrategyItem
                  key={squad._id}
                  squad={squad}
                  isExpanded={expandedItemId === squad._id}
                  loadingSquadId={loadingSquadId}
                  onItemClick={handleItemClick}
                  onEditClick={handleEditClick}
                  onGameMatchClick={handleGameMatchClick}
                />
              ))
            ) : (
              <EmptyMessage>
                등록된 전략이 없습니다. 새 전략을 추가해보세요.
              </EmptyMessage>
            )}
            <Button
              onClick={() => navigate("/strategy/new")}
              style={{
                marginTop: "20px",
                width: "100%",
                backgroundColor: "#A020F0",
              }}
              disabled={Boolean(loadingSquadId)}
            >
              새 전략 만들기
            </Button>
          </StrategyList>
        ) : (
          <div style={{ textAlign: "center" }}>
            <h2>AI 축구 전략 배틀에 오신 것을 환영합니다!</h2>
            <p>
              전략을 등록하고 다른 사용자들과 대전하려면 로그인이 필요합니다.
            </p>
          </div>
        )}
      </HomeContainer>
    </>
  );
});

export default HomePage;
