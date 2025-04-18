import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colors.dark};
  color: white;
  padding: ${({ theme }) => theme.spacing.medium};
  text-align: center;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <p>&copy; {new Date().getFullYear()} AI 축구 전략 배틀. All rights reserved.</p>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;