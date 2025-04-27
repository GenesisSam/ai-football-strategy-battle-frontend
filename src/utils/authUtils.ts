/**
 * 인증 관련 유틸리티 함수
 */

/**
 * localStorage에서 인증 토큰을 가져오는 함수
 * @returns {string | null} 저장된 토큰 또는 null (토큰이 없는 경우)
 */
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

/**
 * localStorage에 인증 토큰을 저장하는 함수
 * @param {string} token - 저장할 토큰
 */
export const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};

/**
 * localStorage에서 인증 토큰을 제거하는 함수 (로그아웃 시 사용)
 */
export const removeToken = (): void => {
  localStorage.removeItem("token");
};

/**
 * 유효한 토큰이 있는지 확인하는 함수
 * 실제 토큰 검증은 백엔드에서 수행하지만, 클라이언트에서 토큰이 존재하는지 간단히 확인할 수 있습니다.
 * @returns {boolean} 토큰이 존재하면 true, 그렇지 않으면 false
 */
export const hasToken = (): boolean => {
  return !!getToken();
};
