import { ThemeProvider } from "styled-components";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GlobalStyle from "./styles/GlobalStyle";
import theme from "./styles/theme";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import StrategyPage from "./pages/StrategyPage";
import MatchPage from "./pages/MatchPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="strategy">
              <Route index element={<StrategyPage />} />
              <Route path="create" element={<StrategyPage mode="create" />} />
              <Route path=":id" element={<StrategyPage mode="view" />} />
            </Route>
            <Route path="match" element={<MatchPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
