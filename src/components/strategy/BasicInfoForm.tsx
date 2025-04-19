import React from "react";
import styled from "styled-components";

const FormSection = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.medium};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  & + & {
    margin-top: 4px;
  }
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.dark};
  margin: 0 0 ${({ theme }) => theme.spacing.medium} 0;
  font-size: 1.2rem;
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.small};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.dark};
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.neutral};
  border-radius: 4px;
  font-size: 1rem;
`;

// 기본 정보 폼 분리
export interface BasicInfoFormProps {
  squadName: string;
  formation: string;
  onSquadNameChange: (value: string) => void;
  onFormationChange: (value: string) => void; // props는 유지하지만 사용하지 않음
  squadNameError?: string;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = React.memo(
  ({ squadName, onSquadNameChange, squadNameError }) => {
    return (
      <FormSection>
        <SectionTitle>기본 정보</SectionTitle>

        <FormGroup>
          <Label htmlFor="squadName">팀 이름</Label>
          <Input
            id="squadName"
            value={squadName}
            onChange={(e) => onSquadNameChange(e.target.value)}
            placeholder="팀 이름을 입력하세요"
          />
          {squadNameError && (
            <span style={{ color: "red", fontSize: "0.8rem" }}>
              {squadNameError}
            </span>
          )}
        </FormGroup>
      </FormSection>
    );
  }
);

BasicInfoForm.displayName = "BasicInfoForm";

export default BasicInfoForm;
