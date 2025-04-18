import React from 'react';
import styled from 'styled-components';

const MatchContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.large};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const MatchPage: React.FC = () => {
  return (
    <MatchContainer>
      <Title>매치 플레이</Title>
      <p>이 페이지에서 다른 사용자와의 매치 경기를 진행할 수 있습니다.</p>
    </MatchContainer>
  );
};

export default MatchPage;