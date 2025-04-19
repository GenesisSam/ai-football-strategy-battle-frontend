import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import styled from "styled-components";
import { FixedSizeList as List } from "react-window";
import debounce from "lodash.debounce";
import { getAllPlayers, searchPlayers } from "../../api/player";

// 포지션 축약어와 풀네임 매핑
const positionMapping: Record<string, string> = {
  GK: "Goalkeeper",
  DF: "Defender",
  MF: "Midfielder",
  FW: "Forward",
  // 필요에 따라 더 많은 포지션 매핑을 추가할 수 있습니다
};

// 포지션 풀네임에서 축약어를 찾는 함수
const getPositionFullName = (positionCode: string): string => {
  return positionMapping[positionCode] || positionCode;
};

// 모달 배경 - 클릭 이벤트를 위해 data-testid 추가
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// 모달 컨테이너 - 이벤트 버블링 방지를 위해 onClick 이벤트 핸들러 추가
const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.large};
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

// 모달 헤더
const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  padding-bottom: ${({ theme }) => theme.spacing.small};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral};
`;

// 모달 제목
const ModalTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.dark};
`;

// 닫기 버튼
const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.dark};
`;

// 검색 입력
const SearchInput = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.neutral};
  border-radius: 4px;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

// 선수 목록 컨테이너
const PlayerListContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

// 선수 항목
const PlayerItem = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
  border-bottom: 1px solid ${({ theme }) => theme.colors.light};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small};

  &:hover {
    background-color: ${({ theme }) => theme.colors.light};
  }

  &:last-child {
    border-bottom: none;
  }
`;

// 선수 이미지
const PlayerImage = styled.div`
  width: 40px;
  height: 40px;
  background-color: #eee;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.dark};
`;

// 선수 정보
const PlayerInfo = styled.div`
  flex: 1;
`;

// 선수 이름
const PlayerName = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.dark};
`;

// 선수 포지션과 소속팀
const PlayerDetails = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.neutral};
`;

// 유저 메시지
const Message = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  background-color: ${({ theme }) => theme.colors.light};
  border-radius: 4px;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  text-align: center;
  color: ${({ theme }) => theme.colors.dark};
`;

// 로딩 인디케이터 스타일
const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
`;

// 에러 메시지 스타일
const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  background-color: ${({ theme }) => theme.colors.danger};
  color: white;
  border-radius: 4px;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  text-align: center;
`;

// 스켈레톤 로딩 스타일
const SkeletonItem = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
  border-bottom: 1px solid ${({ theme }) => theme.colors.light};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small};
`;

const SkeletonCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
  background-size: 200% 100%;
  animation: 1.5s shine linear infinite;

  @keyframes shine {
    to {
      background-position-x: -200%;
    }
  }
`;

const SkeletonLine = styled.div<{ width: string }>`
  height: 16px;
  width: ${(props) => props.width};
  border-radius: 4px;
  background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
  background-size: 200% 100%;
  animation: 1.5s shine linear infinite;
`;

// 가상 스크롤 컨테이너
const VirtualizedListContainer = styled.div`
  width: 100%;
  height: 400px; // 가상 리스트의 최대 높이
`;

// 선수 타입 정의
export interface PlayerType {
  name: string;
  position: string;
  team: string;
  imgInitial: string;
}

// 선수 선택 모달 컴포넌트 분리
export interface PlayerSelectionModalProps {
  show: boolean;
  onClose: () => void;
  positionName: string;
  onSelectPlayer: (name: string, position: string) => void;
  filteredPlayers?: PlayerType[];
  isLoading?: boolean;
}

const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({
  show,
  onClose,
  positionName,
  onSelectPlayer,
  filteredPlayers: initialFilteredPlayers,
  isLoading: externalLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerType[]>([]);
  const hasFetchedRef = useRef<boolean>(false);

  // API에서 선수 데이터 가져오기
  useEffect(() => {
    if (show) {
      if (initialFilteredPlayers && initialFilteredPlayers.length > 0) {
        setPlayers(initialFilteredPlayers);
        setFilteredPlayers(initialFilteredPlayers);
        hasFetchedRef.current = true;
      } else if (!hasFetchedRef.current) {
        // 포지션이 있을 경우 해당 포지션의 선수만 가져옴
        if (positionName) {
          fetchPlayersByPosition(positionName);
        } else {
          fetchPlayers();
        }
        hasFetchedRef.current = true;
      }
    } else {
      // 모달이 닫힐 때 플래그 초기화
      hasFetchedRef.current = false;
      setSearchTerm("");
      setError(null);
    }
  }, [show, initialFilteredPlayers, positionName]);

  // 배경 클릭 시 모달 닫기 핸들러
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // 이벤트의 target이 ModalOverlay와 동일한 경우에만 닫기
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // 이벤트 버블링 방지 핸들러
  const handleModalContentClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
    },
    []
  );

  // 포지션별 선수 데이터 가져오기
  const fetchPlayersByPosition = async (position: string) => {
    setLoading(true);
    setError(null);
    try {
      const positionPlayers = await searchPlayers(position);
      // API에서 받은 선수 데이터를 PlayerType 인터페이스에 맞게 변환
      const formattedPlayers: PlayerType[] = positionPlayers.map((player) => {
        // 이름의 첫 글자를 이미지 이니셜로 사용
        const imgInitial = player.name.charAt(0).toUpperCase();
        return {
          name: player.name,
          position: getPositionFullName(player.position),
          team: player.team,
          imgInitial,
        };
      });
      setPlayers(formattedPlayers);
      setFilteredPlayers(formattedPlayers);
    } catch (err) {
      console.error(
        `${position} 포지션 선수 데이터를 불러오는데 실패했습니다:`,
        err
      );
      setError(
        `${position} 포지션 선수 데이터를 불러오는데 실패했습니다. 나중에 다시 시도해주세요.`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const eplPlayers = await getAllPlayers();
      // API에서 받은 선수 데이터를 PlayerType 인터페이스에 맞게 변환
      const formattedPlayers: PlayerType[] = eplPlayers.map((player) => {
        // 이름의 첫 글자를 이미지 이니셜로 사용
        const imgInitial = player.name.charAt(0).toUpperCase();
        return {
          name: player.name,
          position: getPositionFullName(player.position),
          team: player.team,
          imgInitial,
        };
      });
      setPlayers(formattedPlayers);
      setFilteredPlayers(formattedPlayers);
    } catch (err) {
      console.error("선수 데이터를 불러오는데 실패했습니다:", err);
      setError(
        "선수 데이터를 불러오는데 실패했습니다. 나중에 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  // 검색 처리 함수 - useMemo로 의존성 명확히 지정
  const handleSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (!query) {
          setFilteredPlayers(players);
          return;
        }

        setLoading(true);
        try {
          // 길이가 2 이상이면 API에서 검색
          if (query.length >= 2) {
            // 포지션 정보가 있을 때는 포지션 기반 검색에 추가 필터링
            const results = await searchPlayers(`${query ?? positionName}`);
            const formattedResults = results.map((player) => ({
              name: player.name,
              position: getPositionFullName(player.position),
              team: player.team,
              imgInitial: player.name.charAt(0).toUpperCase(),
            }));
            setFilteredPlayers(formattedResults);
          } else {
            // 2글자 미만이면 로컬에서 필터링
            const filtered = players.filter(
              (player) =>
                player.name.toLowerCase().includes(query.toLowerCase()) ||
                player.position.toLowerCase().includes(query.toLowerCase()) ||
                player.team.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredPlayers(filtered);
          }
        } catch (err) {
          console.error("선수 검색 중 오류가 발생했습니다:", err);
          setError("검색 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
          setLoading(false);
        }
      }, 300),
    [players, positionName]
  );

  // 검색어 변경시 검색 함수 호출
  useEffect(() => {
    handleSearch(searchTerm);

    // 컴포넌트 언마운트 시 실행 중인 디바운스 취소
    return () => {
      handleSearch.cancel();
    };
  }, [searchTerm, handleSearch]);

  const isComponentLoading = loading || externalLoading;

  if (!show) return null;

  // 가상 스크롤 행 렌더러 - 메모이제이션 필요 없는 로컬 컴포넌트
  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const player = filteredPlayers[index];
    return (
      <PlayerItem
        style={style}
        key={`${player.name}-${index}`}
        onClick={() => onSelectPlayer(player.name, player.position)}
      >
        <PlayerImage>{player.imgInitial}</PlayerImage>
        <PlayerInfo>
          <PlayerName>{player.name}</PlayerName>
          <PlayerDetails>
            {player.position} | {player.team}
          </PlayerDetails>
        </PlayerInfo>
      </PlayerItem>
    );
  };

  // 스켈레톤 로딩 컴포넌트
  const SkeletonLoader = () => (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonItem key={index}>
          <SkeletonCircle />
          <div style={{ flexGrow: 1 }}>
            <SkeletonLine width="60%" />
            <div style={{ height: "8px" }} />
            <SkeletonLine width="85%" />
          </div>
        </SkeletonItem>
      ))}
    </>
  );

  return (
    <ModalOverlay onClick={handleOverlayClick} data-testid="modal-overlay">
      <ModalContainer onClick={handleModalContentClick}>
        <ModalHeader>
          <ModalTitle>{positionName} 포지션 선수 선택</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <SearchInput
          type="text"
          placeholder="선수 이름, 포지션 또는 팀 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <PlayerListContainer>
          {isComponentLoading ? (
            <SkeletonLoader />
          ) : filteredPlayers.length > 0 ? (
            <VirtualizedListContainer>
              <List
                height={400}
                width="100%"
                itemCount={filteredPlayers.length}
                itemSize={60} // 각 항목의 높이
                overscanCount={5} // 최적화: 미리 렌더링할 행 수
              >
                {Row}
              </List>
            </VirtualizedListContainer>
          ) : (
            <Message>검색 결과가 없습니다.</Message>
          )}
        </PlayerListContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default React.memo(PlayerSelectionModal);
