import apiClient from "./client";

// 선수 능력치 인터페이스
export interface PlayerAttributes {
  // 골키퍼
  reflexes?: number;
  handling?: number;
  kicking?: number;
  positioning?: number;
  diving?: number;
  // 필드 플레이어
  pace?: number;
  tackling?: number;
  marking?: number;
  passing?: number;
  heading?: number;
  shooting?: number;
  dribbling?: number;
}

// 선수 인터페이스
export interface Player {
  position: string;
  name: string;
  attributes: PlayerAttributes;
}

// 전략 인터페이스 추가
export interface StrategyObject {
  strategyName: string;
  attackStyle: string;
  defenseStyle: string;
  specialDirectingInstrument: string;
  formation: string;
  selectionSquadList: string[];
  replacementSquadList: string[];
  lineUp: {
    [positionName: string]: string[];
  };
}

// 스쿼드 인터페이스
export interface Squad {
  _id: string;
  userId: string;
  name: string;
  formation: string;
  players: Player[];
  strategy: StrategyObject; // 객체 타입으로 변경
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 스쿼드 목록용 간략한 인터페이스
export interface SquadSummary {
  _id: string;
  name: string;
  formation: string;
  isActive: boolean;
  createdAt: string;
}

// 스쿼드 생성/수정 요청 인터페이스
export interface SquadRequest {
  name: string;
  formation: string;
  players: Player[]; // Player로 변경
  strategy: StrategyObject;
}

// 스쿼드 생성
export const createSquad = async (data: SquadRequest): Promise<Squad> => {
  const response = await apiClient.post<Squad>("/squads", data);
  return response.data;
};

// 사용자 스쿼드 목록 조회
export const getSquads = async (): Promise<SquadSummary[]> => {
  const response = await apiClient.get<SquadSummary[]>("/squads");
  return response.data;
};

// 스쿼드 상세 조회
export const getSquadById = async (id: string): Promise<Squad> => {
  const response = await apiClient.get<Squad>(`/squads/${id}`);
  return response.data;
};

// 스쿼드 업데이트
export const updateSquad = async (
  id: string,
  data: SquadRequest
): Promise<Squad> => {
  const response = await apiClient.put<Squad>(`/squads/${id}`, data);
  return response.data;
};

// 스쿼드 삭제
export const deleteSquad = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/squads/${id}`);
  return response.data;
};

// 스쿼드 활성화
export const activateSquad = async (
  id: string
): Promise<{ id: string; isActive: boolean; message: string }> => {
  const response = await apiClient.post<{
    id: string;
    isActive: boolean;
    message: string;
  }>(`/squads/${id}/activate`);
  return response.data;
};
