import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Main = styled.main`
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.medium};
`;

const Layout: React.FC = () => {
  return (
    <LayoutContainer>
      <Header />
      <Main>
        <Outlet />
      </Main>
      <Footer />
    </LayoutContainer>
  );
};

export default Layout;