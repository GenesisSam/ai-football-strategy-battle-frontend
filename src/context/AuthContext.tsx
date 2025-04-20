import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { User, register, getProfile, login } from "../api/auth";
import axios, { AxiosError } from "axios";

// 인증 컨텍스트 인터페이스
interface AuthContextType {
  user: User | null;
  moimUser: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// 초기 컨텍스트 값
const initialAuthContext: AuthContextType = {
  user: null,
  moimUser: null,
  isLoading: true,
  isAuthenticated: false,
};

// 인증 컨텍스트 생성
export const AuthContext = createContext<AuthContextType>(initialAuthContext);

// 인증 컨텍스트 프로바이더 인터페이스
interface AuthProviderProps {
  children: ReactNode;
}

// 인증 컨텍스트 프로바이더 컴포넌트
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const refLoginProcessing = useRef(false);
  const [user, setUser] = useState<User | null>(null);
  const [moimUser, setMoimUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialAuthChecked, setInitialAuthChecked] = useState<boolean>(false);

  // useCallback에 적절한 의존성 추가 (setUser가 필요)
  const getGameProfileWithAutoSign = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        // 토큰 유효성 확인 및 최신 사용자 정보 조회
        const currentUser = await getProfile();
        setUser(currentUser);
      } catch (error) {
        if ((error as AxiosError).response?.status === 401) {
          try {
            const res = await login(email, password);
            localStorage.setItem("token", res.access_token);
            setUser(res.user);
          } catch (err) {
            if ((err as AxiosError).response?.status === 401) {
              await register(name, email, password);
              // 재귀적 호출 대신 반환 값을 직접 사용하여 스택 오버플로우 방지
              const registerRes = await login(email, password);
              localStorage.setItem("token", registerRes.access_token);
              setUser(registerRes.user);
            }
          }
        }
      }
    },
    [setUser] // setUser가 의존성으로 추가되어야 함
  );

  // 앱 초기화 시 사용자 정보 복원
  useEffect(() => {
    const initializeAuth = async () => {
      if (refLoginProcessing.current) return;

      refLoginProcessing.current = true;
      let _moimUser: Record<string, any> | undefined = undefined;

      try {
        if (window.__INIT_STATE__?.currentUser) {
          _moimUser = window.__INIT_STATE__.currentUser;
          setMoimUser(window.__INIT_STATE__.currentUser);
        }
        // window.__INIT_STATE__ 확인, authToken 존재 시 API 호출
        else if (window.__INIT_STATE__?.authToken) {
          try {
            const response = await axios.get("https://vingle.network/api/me", {
              headers: {
                Authorization: `Bearer ${window.__INIT_STATE__.authToken}`,
              },
            });

            if (response.data) {
              // 사용자 정보 상태 업데이트
              _moimUser = response.data;
              setMoimUser(response.data);
            }
          } catch (error) {
            console.error("Failed to fetch user data from Vingle API:", error);
          }
        }

        if (_moimUser) {
          await getGameProfileWithAutoSign(
            _moimUser.name,
            `${_moimUser.id}@aifsb.io`,
            _moimUser.id
          );
        }
      } catch (error) {
        console.error("Error during authentication initialization:", error);
      } finally {
        setInitialAuthChecked(true);
        setIsLoading(false);
        refLoginProcessing.current = false;
      }
    };

    initializeAuth();
  }, [getGameProfileWithAutoSign]); // getGameProfileWithAutoSign 의존성 추가

  const authValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    moimUser,
  };

  // useMemo로 컨텍스트 값 최적화
  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};

// 인증 컨텍스트 훅
export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
