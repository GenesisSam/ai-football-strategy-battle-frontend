# AI 축구 전략 배틀 API 문서

이 문서는 AI 축구 전략 배틀의 모든 사용 가능한 API에 대한 설명을 제공합니다.
기본 API 경로: `/api`

## 목차

1. [기본 API](#1-기본-api)
2. [인증 API](#2-인증-api)
3. [EPL 선수 API](#3-epl-선수-api)
4. [스쿼드 API](#4-스쿼드-api)
5. [매치 API](#5-매치-api)
6. [웹소켓 API](#6-웹소켓-api)

## 1. 기본 API

### 서버 상태 확인
- **URL**: `/api`
- **Method**: `GET`
- **Description**: 서버가 정상적으로 동작 중인지 확인합니다.
- **Auth Required**: No
- **Response**:
  - **200 OK**
    ```
    "Hello World"
    ```

## 2. 인증 API

### 회원가입
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Description**: 새로운 사용자를 등록합니다.
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "username": "player1",
    "email": "player1@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  - **201 Created**
    ```json
    {
      "user": {
        "id": "123abc",
        "username": "player1",
        "email": "player1@example.com"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
  - **400 Bad Request**: 잘못된 입력 데이터
  - **409 Conflict**: 이메일 또는 사용자 이름이 이미 사용중

### 로그인
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Description**: 사용자 인증 및 JWT 토큰을 발급합니다.
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "player1@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  - **200 OK**
    ```json
    {
      "user": {
        "id": "123abc",
        "username": "player1",
        "email": "player1@example.com"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
  - **401 Unauthorized**: 인증 실패

### 사용자 프로필 조회
- **URL**: `/api/auth/profile`
- **Method**: `GET`
- **Description**: 현재 인증된 사용자의 프로필 정보를 조회합니다.
- **Auth Required**: Yes (JWT)
- **Response**:
  - **200 OK**
    ```json
    {
      "id": "123abc",
      "username": "player1",
      "email": "player1@example.com"
    }
    ```
  - **401 Unauthorized**: 인증되지 않은 접근

## 3. EPL 선수 API

### 모든 EPL 선수 목록 조회
- **URL**: `/api/epl-players`
- **Method**: `GET`
- **Description**: 모든 EPL 선수의 목록을 조회합니다.
- **Auth Required**: No
- **Response**:
  - **200 OK**
    ```json
    [
      {
        "id": "player123",
        "name": "Harry Kane",
        "position": "Forward",
        "team": "Tottenham Hotspur",
        "nationality": "England",
        "age": 27,
        "attributes": {
          "pace": 85,
          "shooting": 90,
          "passing": 80,
          "dribbling": 85,
          "defending": 40,
          "physical": 75
        }
      },
      {
        "id": "player456",
        "name": "Kevin De Bruyne",
        "position": "Midfielder",
        "team": "Manchester City",
        "nationality": "Belgium",
        "age": 29,
        "attributes": {
          "pace": 75,
          "shooting": 85,
          "passing": 95,
          "dribbling": 88,
          "defending": 60,
          "physical": 78
        }
      }
    ]
    ```

### EPL 선수 검색
- **URL**: `/api/epl-players/search`
- **Method**: `GET`
- **Description**: 이름, 팀, 포지션, 국적 등으로 EPL 선수를 검색합니다.
- **Auth Required**: No
- **Query Parameters**:
  - `query`: 검색어 (이름, 팀, 포지션, 국적 등)
- **Response**:
  - **200 OK**
    ```json
    [
      {
        "id": "player123",
        "name": "Harry Kane",
        "position": "Forward",
        "team": "Tottenham Hotspur",
        "nationality": "England",
        "attributes": { ... }
      }
    ]
    ```

### 팀별 EPL 선수 목록 조회
- **URL**: `/api/epl-players/team`
- **Method**: `GET`
- **Description**: 특정 팀의 모든 EPL 선수를 조회합니다.
- **Auth Required**: No
- **Query Parameters**:
  - `team`: 팀 이름 (예: "Manchester United")
- **Response**:
  - **200 OK**
    ```json
    [
      {
        "id": "player789",
        "name": "Bruno Fernandes",
        "position": "Midfielder",
        "team": "Manchester United",
        "nationality": "Portugal",
        "attributes": { ... }
      },
      {
        "id": "player101",
        "name": "Marcus Rashford",
        "position": "Forward",
        "team": "Manchester United",
        "nationality": "England",
        "attributes": { ... }
      }
    ]
    ```

### ID로 EPL 선수 조회
- **URL**: `/api/epl-players/:id`
- **Method**: `GET`
- **Description**: ID를 사용하여 특정 EPL 선수의 정보를 조회합니다.
- **Auth Required**: No
- **Parameters**:
  - `id`: 조회할 선수 ID
- **Response**:
  - **200 OK**
    ```json
    {
      "id": "player123",
      "name": "Harry Kane",
      "position": "Forward",
      "team": "Tottenham Hotspur",
      "nationality": "England",
      "age": 27,
      "height": "188cm",
      "weight": "86kg",
      "attributes": {
        "pace": 85,
        "shooting": 90,
        "passing": 80,
        "dribbling": 85,
        "defending": 40,
        "physical": 75
      },
      "statistics": {
        "matchesPlayed": 38,
        "goals": 23,
        "assists": 14,
        "yellowCards": 2,
        "redCards": 0
      }
    }
    ```
  - **404 Not Found**: 선수를 찾을 수 없음

### EPL 선수 등록 (관리자용)
- **URL**: `/api/epl-players`
- **Method**: `POST`
- **Description**: 새로운 EPL 선수를 등록합니다.
- **Auth Required**: Yes (JWT)
- **Request Body**:
  ```json
  {
    "name": "New Player",
    "position": "Midfielder",
    "team": "Chelsea",
    "nationality": "France",
    "age": 25,
    "height": "180cm",
    "weight": "75kg",
    "attributes": {
      "pace": 82,
      "shooting": 78,
      "passing": 85,
      "dribbling": 88,
      "defending": 70,
      "physical": 72
    }
  }
  ```
- **Response**:
  - **201 Created**
    ```json
    {
      "id": "player999",
      "name": "New Player",
      "position": "Midfielder",
      "team": "Chelsea",
      "nationality": "France",
      "age": 25,
      "height": "180cm",
      "weight": "75kg",
      "attributes": {
        "pace": 82,
        "shooting": 78,
        "passing": 85,
        "dribbling": 88,
        "defending": 70,
        "physical": 72
      }
    }
    ```
  - **401 Unauthorized**: 인증되지 않은 접근
  - **400 Bad Request**: 잘못된 입력 데이터

### EPL 선수 일괄 등록 (관리자용)
- **URL**: `/api/epl-players/bulk`
- **Method**: `POST`
- **Description**: 여러 EPL 선수를 한 번에 등록합니다.
- **Auth Required**: Yes (JWT)
- **Request Body**:
  ```json
  [
    {
      "name": "Player 1",
      "position": "Goalkeeper",
      "team": "Arsenal",
      "attributes": { ... }
    },
    {
      "name": "Player 2",
      "position": "Defender",
      "team": "Liverpool",
      "attributes": { ... }
    }
  ]
  ```
- **Response**:
  - **201 Created**
    ```json
    [
      {
        "id": "player1001",
        "name": "Player 1",
        "position": "Goalkeeper",
        "team": "Arsenal",
        "attributes": { ... }
      },
      {
        "id": "player1002",
        "name": "Player 2",
        "position": "Defender",
        "team": "Liverpool",
        "attributes": { ... }
      }
    ]
    ```
  - **401 Unauthorized**: 인증되지 않은 접근
  - **400 Bad Request**: 잘못된 입력 데이터

### EPL 선수 정보 수정 (관리자용)
- **URL**: `/api/epl-players/:id`
- **Method**: `PUT`
- **Description**: 특정 EPL 선수의 정보를 수정합니다.
- **Auth Required**: Yes (JWT)
- **Parameters**:
  - `id`: 수정할 선수 ID
- **Request Body**:
  ```json
  {
    "team": "Manchester United",
    "attributes": {
      "pace": 84,
      "shooting": 88
    }
  }
  ```
- **Response**:
  - **200 OK**
    ```json
    {
      "id": "player123",
      "name": "Harry Kane",
      "position": "Forward",
      "team": "Manchester United",
      "attributes": {
        "pace": 84,
        "shooting": 88,
        "passing": 80,
        "dribbling": 85,
        "defending": 40,
        "physical": 75
      }
    }
    ```
  - **401 Unauthorized**: 인증되지 않은 접근
  - **404 Not Found**: 선수를 찾을 수 없음
  - **400 Bad Request**: 잘못된 입력 데이터

### EPL 선수 삭제 (관리자용)
- **URL**: `/api/epl-players/:id`
- **Method**: `DELETE`
- **Description**: 특정 EPL 선수를 삭제합니다.
- **Auth Required**: Yes (JWT)
- **Parameters**:
  - `id`: 삭제할 선수 ID
- **Response**:
  - **200 OK**
    ```json
    {
      "id": "player123",
      "name": "Harry Kane",
      "message": "선수가 성공적으로 삭제되었습니다."
    }
    ```
  - **401 Unauthorized**: 인증되지 않은 접근
  - **404 Not Found**: 선수를 찾을 수 없음

### EPL 선수 데이터 스크랩 (관리자용)
- **URL**: `/api/epl-players/scrape`
- **Method**: `POST`
- **Description**: EPL 선수 데이터를 웹에서 스크랩하여 데이터베이스에 저장합니다.
- **Auth Required**: Yes (JWT)
- **Response**:
  - **200 OK**
    ```json
    {
      "message": "EPL 선수 데이터 스크랩 및 저장 완료"
    }
    ```
  - **401 Unauthorized**: 인증되지 않은 접근

### EPL 선수 데이터 동기화 (관리자용)
- **URL**: `/api/epl-players/sync`
- **Method**: `POST`
- **Description**: 제공된 선수 데이터로 EPL 선수 데이터베이스를 동기화합니다.
- **Auth Required**: Yes (JWT)
- **Request Body**:
  ```json
  [
    {
      "name": "Player 1",
      "position": "Goalkeeper",
      "team": "Arsenal",
      "attributes": { ... }
    },
    {
      "name": "Player 2",
      "position": "Defender",
      "team": "Liverpool",
      "attributes": { ... }
    }
  ]
  ```
- **Response**:
  - **200 OK**
    ```json
    {
      "message": "EPL 선수 데이터 동기화가 완료되었습니다.",
      "syncedCount": 243,
      "addedCount": 5,
      "updatedCount": 18,
      "removedCount": 2
    }
    ```
  - **401 Unauthorized**: 인증되지 않은 접근
  - **400 Bad Request**: 잘못된 입력 데이터

## 4. 스쿼드 API

### 스쿼드 생성
- **URL**: `/api/squads`
- **Method**: `POST`
- **Description**: 새로운 축구팀 스쿼드를 생성합니다.
- **Auth Required**: Yes (JWT)
- **Request Body**:
  ```json
  {
    "name": "드림팀",
    "formation": "4-3-3",
    "players": [
      {
        "position": "GK",
        "name": "김골키퍼",
        "attributes": {
          "reflexes": 85,
          "handling": 80,
          "kicking": 75,
          "positioning": 83,
          "diving": 82
        }
      },
      {
        "position": "RB",
        "name": "이수비수",
        "attributes": {
          "pace": 80,
          "tackling": 85,
          "marking": 82,
          "passing": 75,
          "heading": 78
        }
      },
      // ... 9명의 추가 선수 정보 (총 11명)
    ],
    "strategy": "공격적인 포지셔닝과 빠른 역습을 활용한 공격 전략. 풀백이 공격에 참여하고 미드필더는 수비를 보조합니다."
  }
  ```
- **Response**:
  - **201 Created**
    ```json
    {
      "id": "squad123",
      "name": "드림팀",
      "formation": "4-3-3",
      "players": [...],
      "strategy": "공격적인 포지셔닝과 빠른 역습을 활용한 공격 전략...",
      "userId": "user123",
      "createdAt": "2025-04-17T12:00:00.000Z",
      "isActive": false
    }
    ```
  - **400 Bad Request**: 잘못된 입력 데이터
  - **401 Unauthorized**: 인증되지 않은 접근

### 사용자 스쿼드 목록 조회
- **URL**: `/api/squads`
- **Method**: `GET`
- **Description**: 현재 인증된 사용자의 모든 스쿼드를 조회합니다.
- **Auth Required**: Yes (JWT)
- **Response**:
  - **200 OK**
    ```json
    [
      {
        "id": "squad123",
        "name": "드림팀",
        "formation": "4-3-3",
        "isActive": true,
        "createdAt": "2025-04-15T10:30:00.000Z"
      },
      {
        "id": "squad456",
        "name": "수비형 팀",
        "formation": "5-4-1",
        "isActive": false,
        "createdAt": "2025-04-16T14:20:00.000Z"
      }
    ]
    ```
  - **401 Unauthorized**: 인증되지 않은 접근

### 스쿼드 상세 조회
- **URL**: `/api/squads/:id`
- **Method**: `GET`
- **Description**: 특정 스쿼드의 상세 정보를 조회합니다.
- **Auth Required**: Yes (JWT)
- **Parameters**:
  - `id`: 조회할 스쿼드 ID
- **Response**:
  - **200 OK**
    ```json
    {
      "id": "squad123",
      "name": "드림팀",
      "formation": "4-3-3",
      "players": [...],
      "strategy": "공격적인 포지셔닝과 빠른 역습을 활용한 공격 전략...",
      "userId": "user123",
      "createdAt": "2025-04-17T12:00:00.000Z",
      "isActive": true
    }
    ```
  - **401 Unauthorized**: 인증되지 않은 접근
  - **404 Not Found**: 스쿼드를 찾을 수 없음

### 스쿼드 업데이트
- **URL**: `/api/squads/:id`
- **Method**: `PUT`
- **Description**: 특정 스쿼드의 정보를 수정합니다.
- **Auth Required**: Yes (JWT)
- **Parameters**:
  - `id`: 수정할 스쿼드 ID
- **Request Body**:
  ```json
  {
    "name": "드림팀 v2",
    "formation": "4-2-3-1",
    "players": [...],
    "strategy": "수비적인 전략으로 카운터 어택을 노립니다. 윙어는 빠른 역습을 위해 넓게 포지셔닝합니다."
  }
  ```
- **Response**:
  - **200 OK**
    ```json
    {
      "id": "squad123",
      "name": "드림팀 v2",
      "formation": "4-2-3-1",
      "players": [...],
      "strategy": "수비적인 전략으로 카운터 어택을 노립니다...",
      "userId": "user123",
      "createdAt": "2025-04-17T12:00:00.000Z",
      "updatedAt": "2025-04-17T14:30:00.000Z",
      "isActive": true
    }
    ```
  - **400 Bad Request**: 잘못된 입력 데이터
  - **401 Unauthorized**: 인증되지 않은 접근
  - **404 Not Found**: 스쿼드를 찾을 수 없음

### 스쿼드 삭제
- **URL**: `/api/squads/:id`
- **Method**: `DELETE`
- **Description**: 특정 스쿼드를 삭제합니다.
- **Auth Required**: Yes (JWT)
- **Parameters**:
  - `id`: 삭제할 스쿼드 ID
- **Response**:
  - **200 OK**
    ```json
    {
      "message": "스쿼드가 성공적으로 삭제되었습니다."
    }
    ```
  - **401 Unauthorized**: 인증되지 않은 접근
  - **404 Not Found**: 스쿼드를 찾을 수 없음

### 스쿼드 활성화
- **URL**: `/api/squads/:id/activate`
- **Method**: `POST`
- **Description**: 특정 스쿼드를 활성 상태로 설정합니다. 매치 생성 시 활성화된 스쿼드가 사용됩니다.
- **Auth Required**: Yes (JWT)
- **Parameters**:
  - `id`: 활성화할 스쿼드 ID
- **Response**:
  - **200 OK**
    ```json
    {
      "id": "squad123",
      "isActive": true,
      "message": "스쿼드가 성공적으로 활성화되었습니다."
    }
    ```
  - **401 Unauthorized**: 인증되지 않은 접근
  - **404 Not Found**: 스쿼드를 찾을 수 없음

## 5. 매치 API

### 빠른 매치 생성 (AI 상대)
- **URL**: `/api/matches/quick`
- **Method**: `POST`
- **Description**: AI 상대와의 빠른 매치를 생성합니다.
- **Auth Required**: Yes (JWT)
- **Request Body**:
  ```json
  {
    "squadId": "squad123"
  }
  ```
- **Response**:
  - **201 Created**
    ```json
    {
      "id": "match123",
      "homeTeam": {
        "userId": "user123",
        "squadId": "squad123",
        "name": "드림팀"
      },
      "awayTeam": {
        "isAI": true,
        "name": "AI 오포넌트"
      },
      "status": "scheduled",
      "createdAt": "2025-04-17T15:00:00.000Z"
    }
    ```
  - **400 Bad Request**: 잘못된 입력 데이터
  - **401 Unauthorized**: 인증되지 않은 접근
  - **404 Not Found**: 스쿼드를 찾을 수 없음

### 게임 매치 생성 (다른 사용자)
- **URL**: `/api/matches/game`
- **Method**: `POST`
- **Description**: 다른 사용자와의 매치를 위한 매치메이킹 큐에 참여합니다.
- **Auth Required**: Yes (JWT)
- **Request Body**:
  ```json
  {
    "squadId": "squad123"
  }
  ```
- **Response**:
  - **201 Created**
    ```json
    {
      "message": "매치메이킹 큐에 성공적으로 참여했습니다.",
      "queuePosition": 3,
      "estimatedWaitTime": "약 2분"
    }
    ```
  - **400 Bad Request**: 잘못된 입력 데이터
  - **401 Unauthorized**: 인증되지 않은 접근
  - **404 Not Found**: 스쿼드를 찾을 수 없음

### 매치 상세 조회
- **URL**: `/api/matches/:id`
- **Method**: `GET`
- **Description**: 특정 매치의 상세 정보를 조회합니다.
- **Auth Required**: No
- **Parameters**:
  - `id`: 조회할 매치 ID
- **Response**:
  - **200 OK**
    ```json
    {
      "id": "match123",
      "homeTeam": {
        "userId": "user123",
        "squadId": "squad123",
        "name": "드림팀",
        "formation": "4-3-3",
        "players": [...]
      },
      "awayTeam": {
        "userId": "user456",
        "squadId": "squad456",
        "name": "상대 팀",
        "formation": "4-4-2",
        "players": [...]
      },
      "status": "completed",
      "score": {
        "home": 2,
        "away": 1
      },
      "startTime": "2025-04-17T15:05:00.000Z",
      "endTime": "2025-04-17T15:15:00.000Z",
      "matchDuration": 90
    }
    ```
  - **404 Not Found**: 매치를 찾을 수 없음

### 사용자 매치 목록 조회
- **URL**: `/api/matches`
- **Method**: `GET`
- **Description**: 현재 인증된 사용자의 모든 매치를 조회합니다.
- **Auth Required**: Yes (JWT)
- **Response**:
  - **200 OK**
    ```json
    [
      {
        "id": "match123",
        "homeTeam": {
          "name": "드림팀",
          "isUserTeam": true
        },
        "awayTeam": {
          "name": "AI 오포넌트",
          "isAI": true
        },
        "status": "completed",
        "score": {
          "home": 2,
          "away": 1
        },
        "createdAt": "2025-04-15T11:00:00.000Z"
      },
      {
        "id": "match456",
        "homeTeam": {
          "name": "상대 팀"
        },
        "awayTeam": {
          "name": "드림팀",
          "isUserTeam": true
        },
        "status": "scheduled",
        "createdAt": "2025-04-17T09:30:00.000Z"
      }
    ]
    ```
  - **401 Unauthorized**: 인증되지 않은 접근

### 매치 이벤트 조회
- **URL**: `/api/matches/:id/events`
- **Method**: `GET`
- **Description**: 특정 매치의 모든 이벤트를 조회합니다.
- **Auth Required**: No
- **Parameters**:
  - `id`: 이벤트를 조회할 매치 ID
- **Response**:
  - **200 OK**
    ```json
    [
      {
        "type": "kickOff",
        "minute": 0,
        "team": "home",
        "description": "경기가 시작되었습니다."
      },
      {
        "type": "shot",
        "minute": 12,
        "team": "home",
        "playerId": "player123",
        "playerName": "김공격수",
        "description": "김공격수의 슛이 골포스트를 맞고 나갔습니다."
      },
      {
        "type": "goal",
        "minute": 34,
        "team": "home",
        "playerId": "player123",
        "playerName": "김공격수",
        "assistPlayerId": "player456",
        "assistPlayerName": "이미드필더",
        "description": "김공격수가 이미드필더의 패스를 받아 골을 넣었습니다!",
        "currentScore": {
          "home": 1,
          "away": 0
        }
      }
      // ... 더 많은 이벤트들
    ]
    ```
  - **404 Not Found**: 매치를 찾을 수 없음

### 매치 통계 조회
- **URL**: `/api/matches/:id/statistics`
- **Method**: `GET`
- **Description**: 특정 매치의 통계 정보를 조회합니다.
- **Auth Required**: No
- **Parameters**:
  - `id`: 통계를 조회할 매치 ID
- **Response**:
  - **200 OK**
    ```json
    {
      "possession": {
        "home": 57,
        "away": 43
      },
      "shots": {
        "home": 15,
        "away": 9
      },
      "shotsOnTarget": {
        "home": 6,
        "away": 3
      },
      "corners": {
        "home": 8,
        "away": 4
      },
      "fouls": {
        "home": 10,
        "away": 12
      },
      "yellowCards": {
        "home": 1,
        "away": 2
      },
      "redCards": {
        "home": 0,
        "away": 0
      },
      "passes": {
        "home": 430,
        "away": 325
      },
      "passAccuracy": {
        "home": 85,
        "away": 78
      },
      "playerStats": {
        "home": [...],
        "away": [...]
      }
    }
    ```
  - **404 Not Found**: 매치를 찾을 수 없음

### 매치 분석 조회
- **URL**: `/api/matches/:id/analysis`
- **Method**: `GET`
- **Description**: 특정 매치에 대한 AI 분석 결과를 조회합니다.
- **Auth Required**: No
- **Parameters**:
  - `id`: 분석을 조회할 매치 ID
- **Response**:
  - **200 OK**
    ```json
    {
      "summary": "홈팀은 점유율 우위를 바탕으로 공격적인 게임을 펼쳤습니다. 특히 중앙 미드필더의 패스 정확도가 매우 높았고, 윙어들의 빠른 속도로 측면 공격이 효과적이었습니다.",
      "keyPlayers": {
        "home": ["김미드필더", "이공격수"],
        "away": ["최수비수"]
      },
      "tacticalInsights": {
        "home": "4-3-3 포메이션을 활용한 점유율 게임과 윙어를 통한 빠른 공격 전환이 효과적이었습니다.",
        "away": "5-4-1 포메이션의 수비적 전략은 초반에 효과적이었으나, 후반부에 체력 저하로 인해 압박이 약해졌습니다."
      },
      "improvementSuggestions": {
        "home": "골결정력을 높이면 더 많은 득점 기회가 있었을 것입니다. 슈팅 효율이 40%로 다소 낮았습니다.",
        "away": "중앙 미드필더의 압박을 강화하고 역습 상황에서 더 많은 선수가 공격에 가담하는 것이 필요합니다."
      }
    }
    ```
  - **404 Not Found**: 매치를 찾을 수 없음

### 매치 공유
- **URL**: `/api/matches/:id/share`
- **Method**: `POST`
- **Description**: 특정 매치의 결과를 이미지로 생성하여 공유합니다.
- **Auth Required**: Yes (JWT)
- **Parameters**:
  - `id`: 공유할 매치 ID
- **Response**:
  - **200 OK**
    ```json
    {
      "imageUrl": "https://example.com/matches/match123.png"
    }
    ```
  - **401 Unauthorized**: 인증되지 않은 접근
  - **404 Not Found**: 매치를 찾을 수 없음

## 6. 웹소켓 API

### 연결
- **URL**: `/api/socket`
- **Description**: 웹소켓 연결을 설정합니다.
- **Auth Required**: Yes (JWT in query parameter)
  - `token`: JWT 토큰

### 이벤트

#### 매치 이벤트 구독
- **Event Name**: `subscribe_match`
- **Description**: 특정 매치의 실시간 이벤트를 구독합니다.
- **Payload**:
  ```json
  {
    "matchId": "match123"
  }
  ```

#### 매치 이벤트 수신
- **Event Name**: `match_event`
- **Description**: 매치 중 발생하는 실시간 이벤트를 수신합니다.
- **Payload**:
  ```json
  {
    "matchId": "match123",
    "event": {
      "type": "goal",
      "minute": 34,
      "team": "home",
      "playerId": "player123",
      "playerName": "김공격수",
      "description": "김공격수가 골을 넣었습니다!",
      "currentScore": {
        "home": 1,
        "away": 0
      }
    }
  }
  ```

#### 매치 상태 변경 수신
- **Event Name**: `match_status_change`
- **Description**: 매치 상태가 변경될 때 수신합니다.
- **Payload**:
  ```json
  {
    "matchId": "match123",
    "status": "in_progress",
    "timestamp": "2025-04-17T15:05:00.000Z"
  }
  ```

#### 매치메이킹 상태 수신
- **Event Name**: `matchmaking_status`
- **Description**: 매치메이킹 진행 상태를 수신합니다.
- **Payload**:
  ```json
  {
    "status": "searching",
    "queuePosition": 2,
    "estimatedWaitTime": "약 1분"
  }
  ```
  또는
  ```json
  {
    "status": "matched",
    "matchId": "match123",
    "opponent": {
      "username": "상대방",
      "squadName": "상대팀"
    }
  }
  ```

---

## Swagger UI 문서

API 문서는 다음 URL에서 Swagger UI를 통해 접근할 수 있습니다:
```
http://localhost:3000/api/docs
```

API 호출에 필요한 인증은 Swagger UI 페이지 우측 상단의 '권한' 버튼을 통해 JWT 토큰을 설정할 수 있습니다.
