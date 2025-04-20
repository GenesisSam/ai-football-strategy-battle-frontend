import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "styled-components";
import GlobalStyle from "./styles/GlobalStyle";
import theme from "./styles/theme";

// 컨텍스트 프로바이더
import AuthProvider from "./context/AuthContext";
import SquadProvider from "./context/SquadContext";

// 로딩 컴포넌트
import SplashScreen from "./components/SplashScreen";

// 레이아웃 컴포넌트
import Layout from "./components/layout/Layout";

// 라우트 가드 컴포넌트 (인증 상태에 따라 접근 제어)
import ProtectedRoute from "./components/ProtectedRoute";

// 코드 스플리팅을 위한 지연 로딩
const HomePage = lazy(() => import("./pages/HomePage"));
const StrategyPage = lazy(() => import("./pages/StrategyPage"));

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <SquadProvider>
          <Router>
            <Suspense fallback={<SplashScreen />}>
              <Routes>
                {/* 공개 라우트 */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />

                  {/* 보호된 라우트 */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="strategy">
                      <Route index element={<Navigate to="/strategy/new" />} />
                      <Route path="new" element={<StrategyPage />} />
                      <Route path=":id" element={<StrategyPage />} />
                    </Route>
                  </Route>

                  {/* 404 페이지 */}
                  <Route
                    path="*"
                    element={<div>페이지를 찾을 수 없습니다.</div>}
                  />
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </SquadProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
