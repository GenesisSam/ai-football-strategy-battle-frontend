import React from 'react';
import styled from 'styled-components';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.large};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.fonts.bodySize};
  max-width: 600px;
  text-align: center;
`;

const HomePage: React.FC = () => {
  return (
    <HomeContainer>
      <Title>AI 축구 전략 배틀</Title>
      <Description>
        인공지능 기반 축구 전략 시뮬레이션에 오신 것을 환영합니다. 
        자신만의 전략을 만들고 다른 플레이어와 경쟁해보세요!
      </Description>
    </HomeContainer>
  );
};

export default HomePage;