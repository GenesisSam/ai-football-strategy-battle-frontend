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
import MatchProvider from "./context/MatchContext";

// 페이지 컴포넌트
import HomePage from "./pages/HomePage";
import StrategyPage from "./pages/StrategyPage";
import MatchSimulator from "./pages/MatchSimulator";
import Layout from "./components/layout/Layout";

// 라우트 가드 컴포넌트 (인증 상태에 따라 접근 제어)
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <SquadProvider>
          <MatchProvider>
            <Router>
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
                    <Route
                      path="match-simulator/:id"
                      Component={MatchSimulator}
                    />
                  </Route>

                  {/* 404 페이지 */}
                  <Route
                    path="*"
                    element={<div>페이지를 찾을 수 없습니다.</div>}
                  />
                </Route>
              </Routes>
            </Router>
          </MatchProvider>
        </SquadProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
