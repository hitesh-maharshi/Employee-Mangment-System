import { Link, useLocation } from "react-router-dom";
import { FaClock } from "react-icons/fa";
import { useTimer } from "../context/TimerContext";
import "../styles/TimerBanner.css";

function TimerBanner() {
  const location = useLocation();
  const { isRunning, isPaused, elapsed, formatTime } = useTimer();

  if (!isRunning || location.pathname === "/timelog") {
    return null;
  }

  return (
    <Link to="/timelog" className="timer-banner-tbn">
      <FaClock />
      <span>
        Timer {isPaused ? "paused" : "running"}: {formatTime(elapsed)}
      </span>
      <span className="timer-banner-link-tbn">Open Time Log</span>
    </Link>
  );
}

export default TimerBanner;
