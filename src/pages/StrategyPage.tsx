import React from 'react';
import styled from 'styled-components';

const StrategyContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.large};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const StrategyPage: React.FC = () => {
  return (
    <StrategyContainer>
      <Title>전략 설정</Title>
      <p>이 페이지에서 축구 전략을 설정할 수 있습니다.</p>
    </StrategyContainer>
  );
};

export default StrategyPage;