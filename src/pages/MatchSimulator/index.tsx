import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import AIStyleLoader from "../../components/AIStyleLoader";
import { useSquad } from "../../context/SquadContext";
import { useMatch } from "../../context/MatchContext";
import socketClient, {
  SocketEvents,
  MatchEventMessage,
  MatchStatusChange,
  MatchmakingStatus,
  MatchJobStatus,
} from "../../api/socket";
import { MatchEvent, Match, Score } from "../../api/match";

const SimulatorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  flex-direction: column;
`;

const MatchContainer = styled.div`
  width: 90%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 90vh;
`;

const MatchHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: ${({ theme }) => theme.colors.dark};
  color: white;
  border-radius: 8px 8px 0 0;
`;

const TeamInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  flex: 1;
`;

const TeamName = styled.h2`
  margin: 0;
  font-size: 1.2rem;
`;

const ScoreDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  padding: 0 20px;
`;

const TimerDisplay = styled.div`
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
`;

const EventLog = styled.div`
  width: 100%;
  height: 70%;
  overflow-y: auto;
  padding: 15px;
  background-color: white;
  border-radius: 0 0 8px 8px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const EventItem = styled.div<{ type: string }>`
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: 4px;
  background-color: ${({ type }) => {
    switch (type) {
      case "goal":
        return "rgba(255, 178, 43, 0.2)";
      case "yellowCard":
        return "rgba(255, 255, 0, 0.2)";
      case "redCard":
        return "rgba(255, 0, 0, 0.2)";
      case "kickOff":
        return "rgba(0, 191, 255, 0.2)";
      case "halfTime":
      case "fullTime":
        return "rgba(128, 128, 128, 0.2)";
      default:
        return "rgba(240, 240, 240, 0.6)";
    }
  }};
  border-left: 4px solid
    ${({ type, theme }) => {
      switch (type) {
        case "goal":
          return theme.colors.warning;
        case "yellowCard":
          return "yellow";
        case "redCard":
          return theme.colors.danger;
        case "kickOff":
          return theme.colors.info;
        case "halfTime":
        case "fullTime":
          return theme.colors.neutral;
        default:
          return theme.colors.light;
      }
    }};
`;

const MinuteTag = styled.span`
  display: inline-block;
  font-weight: bold;
  margin-right: 8px;
  color: ${({ theme }) => theme.colors.dark};
`;

const EventDescription = styled.span`
  color: ${({ theme }) => theme.colors.dark};
`;

type LoadingStage =
  | "searching"
  | "found"
  | "preparing"
  | "starting"
  | "complete"
  | "processing"
  | "simulating";

// 이벤트 핸들러 타입 명확하게 지정
type MatchEventHandler = (message: MatchEventMessage) => void;
type MatchStatusChangeHandler = (change: MatchStatusChange) => void;

const MatchSimulator: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("searching");
  const [loadingComplete, setLoadingComplete] = useState(false);
  const effectRan = useRef(false);
  const eventLogRef = useRef<HTMLDivElement>(null);

  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [gameTime, setGameTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [pollingStarted, setPollingStarted] = useState<boolean>(false);

  // 이벤트 핸들러 참조 유지
  const matchEventHandlerRef = useRef<MatchEventHandler | null>(null);
  const matchStatusChangeHandlerRef = useRef<MatchStatusChangeHandler | null>(
    null
  );

  const { activateExistingSquad } = useSquad();
  const {
    startGameMatch,
    fetchMatchById,
    fetchMatchEvents,
    matchmakingStatus,
    matchJobStatus,
    subscribeToMatchJob,
    startPollingMatchJob,
    stopPollingMatchJob,
  } = useMatch();

  // 이벤트 로그 자동 스크롤
  useEffect(() => {
    if (eventLogRef.current) {
      // 즉시 실행되는 스크롤 대신 requestAnimationFrame 사용하여 렌더링 이후 스크롤
      requestAnimationFrame(() => {
        if (eventLogRef.current) {
          eventLogRef.current.scrollTop = eventLogRef.current.scrollHeight;
        }
      });
    }
  }, [events]);

  // matchmakingStatus를 관찰하여 로딩 단계 업데이트
  useEffect(() => {
    if (!matchmakingStatus) return;

    if (matchmakingStatus.status === "searching") {
      setLoadingStage("searching");
    } else if (
      matchmakingStatus.status === "matched" &&
      matchmakingStatus.matchId
    ) {
      setLoadingStage("found");
      setMatchId(matchmakingStatus.matchId);

      // setTimeout 중첩 대신 간결한 구현
      const timers = [
        { delay: 0, stage: "found" },
        { delay: 1500, stage: "preparing" },
        { delay: 2500, stage: "starting" },
        { delay: 3500, stage: "complete" },
      ] as const;

      timers.forEach(({ delay, stage }) => {
        setTimeout(() => {
          setLoadingStage(stage);
          if (stage === "complete") {
            setLoadingComplete(true);
          }
        }, delay);
      });
    } else if (matchmakingStatus.status === "error") {
      setError(
        matchmakingStatus.errorMessage || "매치메이킹 중 오류가 발생했습니다."
      );

      // 명시적으로 정리 작업 수행
      const redirectTimer = setTimeout(() => {
        socketClient.disconnect();
        stopPollingMatchJob();
        navigate("/");
      }, 5000);

      return () => {
        clearTimeout(redirectTimer);
      };
    }
  }, [matchmakingStatus, navigate, stopPollingMatchJob]);

  // 매치 작업 상태 변화를 관찰
  useEffect(() => {
    if (!jobId || !matchJobStatus || matchJobStatus.jobId !== jobId) return;

    console.log("매치 작업 상태 업데이트:", matchJobStatus);

    if (matchJobStatus.status === "processing") {
      setLoadingStage("processing");
    } else if (
      matchJobStatus.status === "completed" &&
      matchJobStatus.matchId
    ) {
      setLoadingStage("complete");
      setMatchId(matchJobStatus.matchId);
      setLoadingComplete(true);
    } else if (matchJobStatus.status === "failed") {
      setError(`매치 생성 실패: ${matchJobStatus.error || "알 수 없는 오류"}`);

      // 명시적으로 정리 작업 수행
      const redirectTimer = setTimeout(() => {
        socketClient.disconnect();
        stopPollingMatchJob();
        navigate("/");
      }, 5000);

      return () => {
        clearTimeout(redirectTimer);
      };
    }
  }, [matchJobStatus, jobId, navigate, stopPollingMatchJob]);

  // 매치 이벤트 핸들러 - useCallback으로 최적화
  const handleMatchEvent = useCallback(
    (message: MatchEventMessage) => {
      if (!matchId || message.matchId !== matchId) return;

      setEvents((prevEvents) => [...prevEvents, message.event]);

      if (message.event.type === "goal" && message.event.currentScore) {
        setMatch((prevMatch) =>
          prevMatch
            ? { ...prevMatch, score: message.event.currentScore as Score }
            : null
        );
      }

      setGameTime(message.event.minute);
    },
    [matchId]
  );

  // 매치 상태 변경 핸들러 - useCallback으로 최적화
  const handleMatchStatusChange = useCallback(
    (change: MatchStatusChange) => {
      if (!matchId || change.matchId !== matchId) return;

      setMatch((prevMatch) =>
        prevMatch ? { ...prevMatch, status: change.status } : null
      );

      if (change.status === "completed") {
        console.log("매치가 종료되었습니다.");
      }
    },
    [matchId]
  );

  // 이벤트 핸들러 참조 업데이트
  useEffect(() => {
    matchEventHandlerRef.current = handleMatchEvent;
    matchStatusChangeHandlerRef.current = handleMatchStatusChange;
  }, [handleMatchEvent, handleMatchStatusChange]);

  // WebSocket 연결 설정 - useCallback으로 최적화
  const setupSocketConnection = useCallback((matchId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("인증 토큰을 찾을 수 없습니다.");
      return null;
    }

    socketClient.connect(token);
    socketClient.subscribeToMatch(matchId);

    // 이벤트 핸들러를 클로저 대신 현재 ref 참조를 사용하는 래퍼 함수로 등록
    const matchEventWrapper = (message: MatchEventMessage) => {
      matchEventHandlerRef.current?.(message);
    };

    const matchStatusChangeWrapper = (change: MatchStatusChange) => {
      matchStatusChangeHandlerRef.current?.(change);
    };

    socketClient.addEventListener(SocketEvents.MATCH_EVENT, matchEventWrapper);
    socketClient.addEventListener(
      SocketEvents.MATCH_STATUS_CHANGE,
      matchStatusChangeWrapper
    );

    return () => {
      socketClient.removeEventListener(
        SocketEvents.MATCH_EVENT,
        matchEventWrapper
      );
      socketClient.removeEventListener(
        SocketEvents.MATCH_STATUS_CHANGE,
        matchStatusChangeWrapper
      );
      socketClient.disconnect();
    };
  }, []);

  // 매치 생성 함수 - 불필요한 의존성 제거하여 최적화
  const createMatch = useCallback(
    async (squadId: string) => {
      try {
        setLoadingStage("searching");
        setError(null);

        // 게임 매치 요청 - 비동기 API 사용
        const jobId = await startGameMatch(squadId);

        if (!jobId) {
          throw new Error("매치 생성에 실패했습니다.");
        }

        console.log("매치메이킹 요청이 성공했습니다. 작업 ID:", jobId);
        setJobId(jobId);

        // 작업 상태를 구독
        const subscribed = await subscribeToMatchJob(jobId);

        if (!subscribed) {
          console.warn(
            "WebSocket 구독에 실패했습니다. HTTP 폴링으로 대체합니다."
          );
        }

        // WebSocket이 작동하지 않을 경우를 대비한 폴링 설정
        const pollingTimer = setTimeout(() => {
          if (!pollingStarted) {
            console.log("WebSocket 응답 없음, HTTP 폴링 시작");
            startPollingMatchJob(jobId, 3000, 60); // 3초 간격으로 최대 60번(3분) 시도
            setPollingStarted(true);
          }
        }, 10000); // WebSocket이 10초 동안 응답하지 않으면 폴링 시작

        return { success: true, cleanup: () => clearTimeout(pollingTimer) };
      } catch (err) {
        console.error("매치 생성 중 오류:", err);
        setError(
          "매치 생성 중 오류가 발생했습니다. 잠시 후 메인 화면으로 돌아갑니다."
        );

        // 에러 발생 시 5초 후 메인 화면으로 리다이렉트
        const redirectTimer = setTimeout(() => {
          navigate("/");
        }, 5000);

        return { success: false, cleanup: () => clearTimeout(redirectTimer) };
      }
    },
    [startGameMatch, navigate, subscribeToMatchJob, startPollingMatchJob]
  );

  // 매치 데이터 로드 함수
  const loadMatchData = useCallback(
    async (matchId: string) => {
      try {
        const matchData = await fetchMatchById(matchId);
        if (!matchData) {
          throw new Error("매치 데이터를 불러올 수 없습니다.");
        }

        setMatch(matchData);

        const eventData = await fetchMatchEvents(matchId);
        setEvents(eventData);

        if (eventData.length > 0) {
          setGameTime(eventData[eventData.length - 1].minute);
        }

        return true;
      } catch (err) {
        console.error(
          "매치 데이터 로드 중 오류:",
          err instanceof Error ? err.message : String(err)
        );
        setError("매치 데이터를 불러오는 중 오류가 발생했습니다.");
        return false;
      }
    },
    [fetchMatchById, fetchMatchEvents]
  );

  // 로딩 메시지 표시 함수 - useMemo로 최적화
  const loadingMessage = useMemo(() => {
    switch (loadingStage) {
      case "searching":
        return matchmakingStatus?.queuePosition
          ? `대전 상대 찾는 중... (대기열 위치: ${
              matchmakingStatus.queuePosition
            }, 예상 대기 시간: ${
              matchmakingStatus.estimatedWaitTime || "계산 중"
            })`
          : "대전 상대 찾는 중...";
      case "found":
        return matchmakingStatus?.opponent
          ? `상대 발견!! - ${matchmakingStatus.opponent.username}님의 "${matchmakingStatus.opponent.squadName}"`
          : "상대 발견!!";
      case "preparing":
        return "🏟️ 경기장을 준비합니다";
      case "starting":
        return "경기! 시작!!";
      case "processing":
        return "매치를 생성하는 중입니다...";
      case "simulating":
        return "경기 시뮬레이션 중...";
      case "complete":
        return "경기 준비 완료";
      default:
        return "로딩 중...";
    }
  }, [loadingStage, matchmakingStatus]);

  // 컴포넌트 마운트 시 초기화 및 매치 시작
  useEffect(() => {
    // 이미 실행됐으면 중복 실행 방지
    if (effectRan.current) return;

    if (!id) {
      navigate("/");
      return;
    }

    let cleanup: (() => void) | undefined;

    const initMatch = async () => {
      activateExistingSquad(id);
      const result = await createMatch(id);
      if (result.success) {
        cleanup = result.cleanup;
      }
    };

    initMatch();
    effectRan.current = true;

    // 언마운트 시 정리
    return () => {
      socketClient.disconnect();
      stopPollingMatchJob();
      cleanup?.();
    };
  }, [id, navigate, activateExistingSquad, createMatch, stopPollingMatchJob]);

  // 매치 ID가 확정되고 로딩이 완료된 경우 매치 데이터 로드
  useEffect(() => {
    if (!matchId || !loadingComplete) return;

    let socketCleanup: (() => void) | null = null;

    const loadData = async () => {
      const success = await loadMatchData(matchId);

      if (success) {
        socketCleanup = setupSocketConnection(matchId);
      } else {
        // 매치 데이터 로드 실패 시 메인 화면으로 리다이렉트
        setError(
          "매치 데이터를 불러오는데 실패했습니다. 잠시 후 메인 화면으로 돌아갑니다."
        );
        const redirectTimer = setTimeout(() => {
          navigate("/");
        }, 5000);

        return () => clearTimeout(redirectTimer);
      }
    };

    loadData();

    return () => {
      socketCleanup?.();
    };
  }, [
    matchId,
    loadingComplete,
    loadMatchData,
    setupSocketConnection,
    navigate,
  ]);

  // 타임아웃 설정 (10분 후에도 매치가 생성되지 않으면 메인으로 돌아감)
  useEffect(() => {
    if (loadingComplete || !jobId) return;

    const timeoutId = setTimeout(() => {
      if (!matchId) {
        setError(
          "매치 생성 시간이 초과되었습니다(10분). 메인 화면으로 돌아갑니다."
        );
        socketClient.disconnect();
        stopPollingMatchJob();
        navigate("/");
      }
    }, 600000); // 10분

    return () => {
      clearTimeout(timeoutId);
    };
  }, [loadingComplete, matchId, jobId, navigate, stopPollingMatchJob]);

  // 스코어 정보 메모이제이션
  const scoreDisplay = useMemo(() => {
    return match?.score ? `${match.score.home} : ${match.score.away}` : "0 : 0";
  }, [match?.score]);

  // 이벤트 리스트 메모이제이션
  const eventItems = useMemo(() => {
    if (events.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "20px" }}>
          아직 이벤트가 없습니다. 경기가 시작되면 여기에 이벤트가 표시됩니다.
        </div>
      );
    }

    return events.map((event, index) => (
      <EventItem key={`event-${index}`} type={event.type}>
        <MinuteTag>{event.minute}′</MinuteTag>
        <EventDescription>{event.description}</EventDescription>
      </EventItem>
    ));
  }, [events]);

  return (
    <SimulatorContainer>
      {!loadingComplete && (
        <AIStyleLoader statusText={loadingMessage} size="lg" />
      )}
      {loadingComplete && (
        <MatchContainer>
          {error && (
            <div
              style={{
                color: "red",
                padding: "20px",
                backgroundColor: "rgba(255, 0, 0, 0.1)",
                borderRadius: "8px",
                marginBottom: "20px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {error}
            </div>
          )}

          {match ? (
            <>
              <MatchHeader>
                <TeamInfo>
                  <TeamName>{match.homeTeam.name}</TeamName>
                </TeamInfo>
                <ScoreDisplay>{scoreDisplay}</ScoreDisplay>
                <TeamInfo>
                  <TeamName>{match.awayTeam.name}</TeamName>
                </TeamInfo>
                <TimerDisplay>{Math.floor(gameTime)}′</TimerDisplay>
              </MatchHeader>

              <EventLog ref={eventLogRef}>{eventItems}</EventLog>
            </>
          ) : (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
              <h2>매치 데이터를 불러오는 중입니다...</h2>
              <p>상대를 찾고 매치를 설정하는 동안 잠시만 기다려주세요.</p>
            </div>
          )}
        </MatchContainer>
      )}
    </SimulatorContainer>
  );
};

export default React.memo(MatchSimulator);
