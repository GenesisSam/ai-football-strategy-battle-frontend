import axios from "axios";
import {
  API_BASE_URL,
  REQUEST_CONFIG,
  AUTH_STORAGE_KEYS,
} from "../constants/api.constants";

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// 캐싱 설정이 적용된 API 클라이언트 생성
export const apiClient = axiosInstance;

// 인증된 API 요청을 위한 함수
export const authFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: any = new Error(
        errorData.message || `HTTP 오류 ${response.status}`
      );

      // 에러 객체에 HTTP 상태 코드와 응답 데이터 추가
      error.status = response.status;
      error.statusText = response.statusText;
      error.data = errorData;

      console.error(`[API Error] ${endpoint}:`, {
        status: response.status,
        message: error.message,
        data: errorData,
      });

      throw error;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[API Fetch Error] ${endpoint}:`, error.message);
    } else {
      console.error(`[API Unknown Error] ${endpoint}:`, error);
    }
    throw error;
  }
};

// 요청 인터셉터 설정 - JWT 토큰을 헤더에 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
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
        // 재시도 전 지연
        await new Promise((resolve) =>
          setTimeout(resolve, REQUEST_CONFIG.RETRY_DELAY)
        );
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
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
        // 로그인 페이지로 리다이렉트 또는 인증 상태 갱신 처리
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
