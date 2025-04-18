import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';

const HeaderContainer = styled.header`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.medium};
  color: white;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  color: white;
  padding: ${({ theme }) => theme.spacing.small};
  border-radius: 4px;
  transition: background-color 0.3s;
  
  ${({ $active, theme }) => $active && `
    background-color: rgba(255, 255, 255, 0.2);
    font-weight: bold;
  `}
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Header: React.FC = () => {
  const location = useLocation();
  
  return (
    <HeaderContainer>
      <Nav>
        <Logo>
          <Link to="/">AI 축구 전략</Link>
        </Logo>
        <NavLinks>
          <NavLink to="/" $active={location.pathname === '/'}>
            홈
          </NavLink>
          <NavLink to="/strategy" $active={location.pathname === '/strategy'}>
            전략
          </NavLink>
          <NavLink to="/match" $active={location.pathname === '/match'}>
            매치
          </NavLink>
        </NavLinks>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;