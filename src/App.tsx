import React, { Suspense } from "react";
import { ThemeProvider } from "styled-components";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GlobalStyle from "./styles/GlobalStyle";
import theme from "./styles/theme";
import SplashScreen from "./components/SplashScreen";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import { AuthProvider } from "./context/AuthContext";
import { SquadProvider } from "./context/SquadContext";
import { MatchProvider } from "./context/MatchContext";
import ProtectedRoute from "./components/ProtectedRoute";

// 페이지 지연 로딩
const StrategyPage = React.lazy(() => import("./pages/StrategyPage"));
const MatchPage = React.lazy(() => import("./pages/MatchPage"));

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <SquadProvider>
          <MatchProvider>
            <Router>
              <Suspense fallback={<SplashScreen />}>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route
                      path="strategy"
                      element={<ProtectedRoute />}
                      Component={StrategyPage}
                    />
                    <Route
                      path="strategy/:id"
                      element={<ProtectedRoute />}
                      Component={StrategyPage}
                    />
                    <Route path="match/:matchId" element={<MatchPage />} />
                    <Route path="match/job/:jobId" element={<MatchPage />} />
                    <Route
                      path="*"
                      element={<div>페이지를 찾을 수 없습니다.</div>}
                    />
                  </Route>
                </Routes>
              </Suspense>
            </Router>
          </MatchProvider>
        </SquadProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
