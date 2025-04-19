import axios from "axios";

// API 기본 URL 설정 (환경에 따라 변경될 수 있음)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,

  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 설정 - JWT 토큰을 헤더에 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 인증 관련 API URL 경로
const authUrls = ["/auth/login", "/auth/register", "/auth/profile"];

// 응답 인터셉터 설정 - 토큰 만료 등의 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized 에러 처리 (토큰 만료 등)
    if (error.response && error.response.status === 401) {
      // URL이 인증 관련 엔드포인트인 경우 리다이렉트를 하지 않음
      const requestUrl = error.config?.url;
      if (!authUrls.some((authUrl) => requestUrl?.includes(authUrl))) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // 로그인 페이지로 리다이렉트 또는 인증 상태 갱신 처리
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
