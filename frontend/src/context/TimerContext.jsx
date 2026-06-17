import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "timerState";

const TimerContext = createContext(null);

function readStoredState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function getElapsedFromState(state) {
  if (!state) return 0;
  if (state.isRunning && !state.isPaused && state.startTime) {
    return Date.now() - state.startTime;
  }
  return state.elapsed || 0;
}

export function formatTimerTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m}m ${s}s`;
}

export function TimerProvider({ children }) {
  const saved = readStoredState();

  const [isRunning, setIsRunning] = useState(saved?.isRunning ?? false);
  const [isPaused, setIsPaused] = useState(saved?.isPaused ?? false);
  const [startTime, setStartTime] = useState(saved?.startTime ?? null);
  const [elapsed, setElapsed] = useState(() => getElapsedFromState(saved));
  const [selectedProject, setSelectedProject] = useState(
    saved?.selectedProject ?? ""
  );
  const [selectedProjectName, setSelectedProjectName] = useState(
    saved?.selectedProjectName ?? ""
  );
  const [description, setDescription] = useState(saved?.description ?? "");

  useEffect(() => {
    let interval;

    if (isRunning && !isPaused && startTime) {
      interval = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, startTime]);

  useEffect(() => {
    if (!isRunning && !selectedProject && elapsed === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        isRunning,
        isPaused,
        startTime,
        elapsed,
        selectedProject,
        selectedProjectName,
        description,
      })
    );
  }, [
    isRunning,
    isPaused,
    startTime,
    elapsed,
    selectedProject,
    selectedProjectName,
    description,
  ]);

  const startTimer = useCallback(() => {
    if (!selectedProject) {
      return { error: "Select project first" };
    }
    if (!description.trim()) {
      return { error: "Please enter a work description first" };
    }

    setStartTime(Date.now());
    setElapsed(0);
    setIsRunning(true);
    setIsPaused(false);
    return { error: null };
  }, [selectedProject, description]);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
    setStartTime(Date.now() - elapsed);
  }, [elapsed]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setStartTime(null);
    setElapsed(0);
    setSelectedProject("");
    setSelectedProjectName("");
    setDescription("");
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getElapsedHours = useCallback(() => elapsed / 3600000, [elapsed]);

  return (
    <TimerContext.Provider
      value={{
        isRunning,
        isPaused,
        elapsed,
        selectedProject,
        selectedProjectName,
        description,
        setSelectedProject,
        setSelectedProjectName,
        setDescription,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        getElapsedHours,
        formatTime: formatTimerTime,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within TimerProvider");
  }
  return context;
}
