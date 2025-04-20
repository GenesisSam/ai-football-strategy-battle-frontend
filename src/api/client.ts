import axios from "axios";
import { setupCache } from "axios-cache-interceptor";

// API 기본 URL 설정 (환경에 따라 변경될 수 있음)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 캐싱 설정이 적용된 API 클라이언트 생성
export const apiClient = setupCache(axiosInstance, {
  // GET 요청에 대해 5분 동안 캐싱
  ttl: 5 * 60 * 1000,
  methods: ["get"],
  // 캐시 키 생성 (URL + 토큰 조합으로 사용자별 캐시)
  generateKey: (request) => {
    const token = localStorage.getItem("token") || "";
    const tokenHash = token ? token.substring(token.length - 8) : "no-token";
    return `${request.url}-${tokenHash}`;
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
  async (error) => {
    const originalRequest = error.config;

    // 타임아웃이거나 네트워크 에러인 경우 재시도
    if (
      (error.code === "ECONNABORTED" || !error.response) &&
      !originalRequest._retry &&
      originalRequest.method === "get"
    ) {
      console.log("요청 타임아웃 또는 네트워크 오류, 재시도 중...");
      originalRequest._retry = true;

      try {
        // 1.5초 대기 후 요청 재시도
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return await axios(originalRequest);
      } catch (retryError) {
        console.error("재시도 실패:", retryError);
        return Promise.reject(retryError);
      }
    }

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

// 에러 디버깅을 위한 응답 로깅 (개발 중에만 활성화)
if (import.meta.env.DEV) {
  apiClient.interceptors.response.use(
    (response) => {
      // 캐시에서 가져온 응답인지 확인
      const fromCache = response.request?.fromCache || false;
      console.log(
        `[API ${fromCache ? "Cache Hit" : "Success"}] ${response.config.url}`,
        fromCache ? "[캐시된 데이터]" : response.data
      );
      return response;
    },
    (error) => {
      console.error(
        `[API Error] ${error.config?.url || "알 수 없는 URL"}`,
        error.response?.data || error.message
      );
      return Promise.reject(error);
    }
  );
}

export default apiClient;
