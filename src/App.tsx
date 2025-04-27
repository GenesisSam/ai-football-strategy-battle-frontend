import React, { Suspense, memo } from "react";
import { ThemeProvider } from "styled-components";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GlobalStyle from "./styles/GlobalStyle";
import theme from "./styles/theme";
import SplashScreen from "./components/SplashScreen";
import HomePage from "./pages/HomePage";
import { AuthProvider } from "./context/AuthContext";
import { SquadProvider } from "./context/SquadContext";
import { MatchProvider } from "./context/MatchContext";
import ProtectedRoute from "./components/ProtectedRoute";

// 페이지 지연 로딩 - 더 작은 청크로 분할
const StrategyPage = React.lazy(() =>
  import("./pages/StrategyPage").then((module) => ({
    default: module.default,
  }))
);

const MatchPage = React.lazy(() =>
  import("./pages/MatchPage").then((module) => ({
    default: module.default,
  }))
);

// 404 페이지 컴포넌트 분리 및 메모이제이션
const NotFound = memo(() => <div>페이지를 찾을 수 없습니다.</div>);

// App 컴포넌트 메모이제이션
const App = memo(() => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <SquadProvider>
          <MatchProvider>
            <Router>
              <Routes>
                <Route path="/">
                  <Route index Component={HomePage} />
                  <Route
                    path="strategy"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<SplashScreen />}>
                          <StrategyPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="strategy/:id"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<SplashScreen />}>
                          <StrategyPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="match/:id"
                    element={
                      <Suspense fallback={<SplashScreen />}>
                        <MatchPage />
                      </Suspense>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Router>
          </MatchProvider>
        </SquadProvider>
      </AuthProvider>
    </ThemeProvider>
  );
});

export default App;
