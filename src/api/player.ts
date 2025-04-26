import apiClient from "./client";

// EPL 선수 인터페이스
export interface EPLPlayer {
  id: string;
  name: string;
  position: string;
  team: string;
  nationality: string;
  age?: number;
  height?: string;
  weight?: string;
  attributes: {
    pace?: number;
    shooting?: number;
    passing?: number;
    dribbling?: number;
    defending?: number;
    physical?: number;
    reflexes?: number;
    handling?: number;
    kicking?: number;
    positioning?: number;
    diving?: number;
  };
}

// 능력치 기반 검색을 위한 필터 인터페이스
export interface PlayerAttributesFilter {
  minPace?: number;
  maxPace?: number;
  minShooting?: number;
  maxShooting?: number;
  minPassing?: number;
  maxPassing?: number;
  minDribbling?: number;
  maxDribbling?: number;
  minDefending?: number;
  maxDefending?: number;
  minPhysical?: number;
  maxPhysical?: number;
  position?: string;
}

// 상세 검색을 위한 필터 인터페이스 추가
export interface DetailedPlayerSearchFilter {
  name?: string;
  team?: string;
  position?: string;
  nationality?: string;
  minAge?: number;
  maxAge?: number;
}

// 포지션 축약어와 풀네임 매핑
const positionMapping: Record<string, string> = {
  GK: "Goalkeeper",
  DF: "Defender",
  LB: "Defender",
  RB: "Defender",
  CB: "Defender",
  LCB: "Defender",
  RCB: "Defender",
  LWB: "Defender",
  RWB: "Defender",
  DM: "Defender",
  SW: "Defender",
  DCB: "Defender",
  DMC: "Defender",
  DMR: "Defender",
  DML: "Defender",
  DFL: "Defender",
  DFR: "Defender",
  DMCB: "Defender",
  DMCF: "Defender",
  CM: "Midfielder",
  CAM: "Midfielder",
  RM: "Midfielder",
  LM: "Midfielder",
  AM: "Midfielder",
  CMF: "Midfielder",
  RCM: "Midfielder",
  LCM: "Midfielder",
  CD: "Midfielder",
  CDM: "Midfielder",
  RDM: "Midfielder",
  LDM: "Midfielder",
  RCMF: "Midfielder",
  LCMF: "Midfielder",
  MF: "Midfielder",
  AMF: "Midfielder",
  RWF: "Forward",
  LWF: "Forward",
  CF: "Forward",
  STC: "Forward",
  FW: "Forward",
  ST: "Forward",
  LW: "Forward",
  RW: "Forward",
};

// 모든 EPL 선수 목록 조회
export const getAllPlayers = async (): Promise<EPLPlayer[]> => {
  const response = await apiClient.get<EPLPlayer[]>("/epl-players");
  return response.data;
};

// EPL 선수 검색
export const searchPlayers = async (query: string): Promise<EPLPlayer[]> => {
  // 만약 포지션 코드가 매핑에 존재한다면, 해당하는 풀네임으로 검색
  let searchQuery = query;

  // 쿼리가 축약어인 포지션인 경우 풀네임으로 변환
  Object.entries(positionMapping).forEach(([code, fullName]) => {
    if (query.toUpperCase() === code) {
      searchQuery = fullName;
    }
  });

  const response = await apiClient.get<EPLPlayer[]>(`/epl-players/search`, {
    params: { query: searchQuery },
  });
  return response.data;
};

// 상세 검색 함수 추가
export const searchPlayersDetailed = async (
  filters: DetailedPlayerSearchFilter
): Promise<EPLPlayer[]> => {
  const response = await apiClient.get<EPLPlayer[]>(
    `/epl-players/detailed-search`,
    {
      params: filters,
    }
  );
  return response.data;
};

// 능력치 기반 선수 검색
export const searchPlayersByAttributes = async (
  filters: PlayerAttributesFilter
): Promise<EPLPlayer[]> => {
  const response = await apiClient.get<EPLPlayer[]>(
    "/epl-players/advanced-search",
    {
      params: filters,
    }
  );
  return response.data;
};

// ID로 EPL 선수 조회
export const getPlayerById = async (id: string): Promise<EPLPlayer> => {
  const response = await apiClient.get<EPLPlayer>(`/epl-players/${id}`);
  return response.data;
};

// 팀별 EPL 선수 목록 조회
export const getPlayersByTeam = async (team: string): Promise<EPLPlayer[]> => {
  const response = await apiClient.get<EPLPlayer[]>("/epl-players/team", {
    params: { team },
  });
  return response.data;
};
