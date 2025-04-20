import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import {
  Squad,
  SquadSummary,
  createSquad,
  getSquads,
  getSquadById,
  updateSquad,
  deleteSquad,
  activateSquad,
  SquadRequest,
} from "../api/squad";
import { useAuth } from "./AuthContext";

// 스쿼드 컨텍스트 인터페이스
interface SquadContextType {
  squads: SquadSummary[];
  activeSquad: Squad | null;
  isLoading: boolean;
  error: string | null;
  fetchSquads: () => Promise<void>;
  fetchSquadById: (id: string) => Promise<Squad | null>;
  createNewSquad: (data: SquadRequest) => Promise<Squad | null>;
  updateExistingSquad: (
    id: string,
    data: SquadRequest
  ) => Promise<Squad | null>;
  deleteExistingSquad: (id: string) => Promise<boolean>;
  activateExistingSquad: (id: string) => Promise<boolean>;
}

// 초기 컨텍스트 값
const initialSquadContext: SquadContextType = {
  squads: [],
  activeSquad: null,
  isLoading: false,
  error: null,
  fetchSquads: async () => {},
  fetchSquadById: async () => null,
  createNewSquad: async () => null,
  updateExistingSquad: async () => null,
  deleteExistingSquad: async () => false,
  activateExistingSquad: async () => false,
};

// 스쿼드 컨텍스트 생성
export const SquadContext =
  createContext<SquadContextType>(initialSquadContext);

// 스쿼드 컨텍스트 프로바이더 인터페이스
interface SquadProviderProps {
  children: ReactNode;
}

// 스쿼드 컨텍스트 프로바이더 컴포넌트
export const SquadProvider: React.FC<SquadProviderProps> = ({ children }) => {
  const [squads, setSquads] = useState<SquadSummary[]>([]);
  const [activeSquad, setActiveSquad] = useState<Squad | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuth();

  // 스쿼드 목록 조회 함수를 useCallback으로 최적화
  const fetchSquads = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const squadList = await getSquads();
      setSquads(squadList);

      // 활성 스쿼드 설정
      const active = squadList.find((squad) => squad.isActive);
      if (active) {
        const activeSquadDetails = await getSquadById(active._id);
        setActiveSquad(activeSquadDetails);
      } else {
        setActiveSquad(null);
      }
    } catch (err) {
      console.error("Error fetching squads:", err);
      setError("스쿼드 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // 사용자 인증 상태 변경 시 스쿼드 목록 조회
  useEffect(() => {
    if (isAuthenticated) {
      fetchSquads();
    } else {
      setSquads([]);
      setActiveSquad(null);
    }
  }, [isAuthenticated, fetchSquads]);

  // 스쿼드 상세 정보 조회
  const fetchSquadById = useCallback(
    async (id: string): Promise<Squad | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const squad = await getSquadById(id);
        return squad;
      } catch (err) {
        console.error(`Error fetching squad ${id}:`, err);
        setError("스쿼드 정보를 불러오는 중 오류가 발생했습니다.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 새 스쿼드 생성
  const createNewSquad = useCallback(
    async (data: SquadRequest): Promise<Squad | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const newSquad = await createSquad(data);

        // 스쿼드 목록 갱신
        await fetchSquads();

        return newSquad;
      } catch (err) {
        console.error("Error creating squad:", err);
        setError("스쿼드 생성 중 오류가 발생했습니다.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchSquads]
  );

  // 스쿼드 정보 수정
  const updateExistingSquad = useCallback(
    async (id: string, data: SquadRequest): Promise<Squad | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const updatedSquad = await updateSquad(id, data);

        // 스쿼드 목록 갱신
        await fetchSquads();

        // 활성 스쿼드 갱신
        if (activeSquad?._id === id) {
          setActiveSquad(updatedSquad);
        }

        return updatedSquad;
      } catch (err) {
        console.error(`Error updating squad ${id}:`, err);
        setError("스쿼드 수정 중 오류가 발생했습니다.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchSquads, activeSquad]
  );

  // 스쿼드 삭제
  const deleteExistingSquad = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);
        await deleteSquad(id);

        // 스쿼드 목록 갱신
        await fetchSquads();

        // 활성 스쿼드 제거
        if (activeSquad?._id === id) {
          setActiveSquad(null);
        }

        return true;
      } catch (err) {
        console.error(`Error deleting squad ${id}:`, err);
        setError("스쿼드 삭제 중 오류가 발생했습니다.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchSquads, activeSquad]
  );

  // 스쿼드 활성화
  const activateExistingSquad = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);
        await activateSquad(id);

        // 스쿼드 목록 갱신
        await fetchSquads();

        return true;
      } catch (err) {
        console.error(`Error activating squad ${id}:`, err);
        setError("스쿼드 활성화 중 오류가 발생했습니다.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchSquads]
  );

  // useMemo로 컨텍스트 값 캐싱하여 불필요한 리렌더링 방지
  const contextValue = useMemo(
    () => ({
      squads,
      activeSquad,
      isLoading,
      error,
      fetchSquads,
      fetchSquadById,
      createNewSquad,
      updateExistingSquad,
      deleteExistingSquad,
      activateExistingSquad,
    }),
    [
      squads,
      activeSquad,
      isLoading,
      error,
      fetchSquads,
      fetchSquadById,
      createNewSquad,
      updateExistingSquad,
      deleteExistingSquad,
      activateExistingSquad,
    ]
  );

  return (
    <SquadContext.Provider value={contextValue}>
      {children}
    </SquadContext.Provider>
  );
};

// 스쿼드 컨텍스트 훅
export const useSquad = () => useContext(SquadContext);

export default SquadProvider;
