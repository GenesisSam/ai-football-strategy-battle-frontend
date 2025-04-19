import apiClient from "./client";

// 사용자 인터페이스
export interface User {
  id: string;
  username: string;
  email: string;
  mmr: number;
  statistics: {
    totalMatches: number;
    wins: number;
    draws: number;
    losses: number;
    goalScored: number;
    goalConceded: number;
    _id: string;
  };
}

// 인증 응답 인터페이스
export interface AuthResponse {
  user: User;
  access_token: string;
}

// 회원가입
export const register = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/register", {
    username,
    email,
    password,
  });
  return response.data;
};

// 로그인
export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  return response.data;
};

// 사용자 프로필 조회
export const getProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>("/auth/profile");
  return response.data;
};

// 간편 로그인 상태 확인 (토큰 유효성 검사 없이 로컬 스토리지 확인)
export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem("token");
};

// 로그아웃
export const logout = (): void => {
  localStorage.removeItem("token");
};
