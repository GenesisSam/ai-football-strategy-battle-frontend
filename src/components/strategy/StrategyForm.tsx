import React, { useCallback } from "react";
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.neutral};
  border-radius: 4px;
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
`;

// 전략 정보 입력 폼 분리
export interface StrategyFormProps {
  attackStyle: string;
  defenseStyle: string;
  specialInstructions: string;
  onAttackStyleChange: (value: string) => void;
  onDefenseStyleChange: (value: string) => void;
  onSpecialInstructionsChange: (value: string) => void;
}

const StrategyForm: React.FC<StrategyFormProps> = React.memo(
  ({
    attackStyle,
    defenseStyle,
    specialInstructions,
    onAttackStyleChange,
    onDefenseStyleChange,
    onSpecialInstructionsChange,
  }) => {
    // 인라인 함수 대신 useCallback으로 이벤트 핸들러 메모이제이션
    const handleAttackStyleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onAttackStyleChange(e.target.value);
      },
      [onAttackStyleChange]
    );

    const handleDefenseStyleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onDefenseStyleChange(e.target.value);
      },
      [onDefenseStyleChange]
    );

    const handleSpecialInstructionsChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onSpecialInstructionsChange(e.target.value);
      },
      [onSpecialInstructionsChange]
    );

    return (
      <FormSection>
        <SectionTitle>전략 구성</SectionTitle>

        <FormGroup>
          <Label htmlFor="attackStyle">공격 스타일</Label>
          <TextArea
            id="attackStyle"
            value={attackStyle}
            onChange={handleAttackStyleChange}
            placeholder="예: 빠른 역습, 점유율 기반 공격, 측면 활용 등"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="defenseStyle">수비 스타일</Label>
          <TextArea
            id="defenseStyle"
            value={defenseStyle}
            onChange={handleDefenseStyleChange}
            placeholder="예: 높은 압박, 낮은 블록, 오프사이드 트랩 등"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="specialInstructions">특별 지시사항</Label>
          <TextArea
            id="specialInstructions"
            value={specialInstructions}
            onChange={handleSpecialInstructionsChange}
            placeholder="예: 특정 선수에 대한 지시, 세트 피스 전략 등"
          />
        </FormGroup>
      </FormSection>
    );
  }
);

StrategyForm.displayName = "StrategyForm";

export default StrategyForm;
