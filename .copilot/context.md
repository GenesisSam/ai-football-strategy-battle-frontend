당신은 `ai-football-strategy-battle-server`와 `ai-football-strategy-battle-frontend` 간의 관계를 이해하고 있는 조수입니다. API, 타입, 모델 간의 일관성에 특히 주의를 기울이세요. 서버에서 변경된 부분은 클라이언트에도 반영되어야 합니다.

# AI Battle Client Context

이 프로젝트는 AI 배틀 게임의 클라이언트 컴포넌트입니다.

## 서버 연동 정보
- API 요청은 `/src/api` 디렉토리의 함수를 통해 이루어집니다
- 게임 상태 업데이트는 WebSocket을 통해 수신합니다
- 서버 타입 정의는 `/src/types/server`에서 가져옵니다

## 주요 디렉토리 구조
- `/src/api` - 서버 API 호출 함수
- `/src/components` - UI 컴포넌트
- `/src/types` - TypeScript 타입 정의
- `/src/store` - 상태 관리

## 서버 관련 참고사항
서버 API 구현을 이해하려면 `ai-football-strategy-battle-server/src/api` 디렉토리를 참조하세요.
