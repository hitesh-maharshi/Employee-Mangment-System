import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useTimer } from "../context/TimerContext";
import "../styles/TimeLog.css";

function TimeLog() {
  const [projects, setProjects] = useState([]);
  const [entries, setEntries] = useState([]);

  const {
    isRunning,
    isPaused,
    elapsed,
    selectedProject,
    description,
    setSelectedProject,
    setSelectedProjectName,
    setDescription,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    getElapsedHours,
    formatTime,
  } = useTimer();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const projRes = await axiosInstance.get("/projects/my-projects");
      setProjects(projRes.data.data || []);

      const logsRes = await axiosInstance.get("/timelog/getUserTime");
      setEntries(logsRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch logs data:", err);
    }
  };

  const formatHours = (hours) => {
    const totalSeconds = Math.floor(hours * 3600);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId);
    const project = projects.find((p) => p._id === projectId);
    setSelectedProjectName(project ? project.projectName : "");
  };

  const handleStart = () => {
    const { error } = startTimer();
    if (error) alert(error);
  };

  const handleStop = async () => {
    if (!selectedProject || !description.trim()) {
      return alert("Missing project or description");
    }

    pauseTimer();

    const totalHours = getElapsedHours();
    const proj = projects.find((p) => p._id === selectedProject);

    try {
      const token = localStorage.getItem("accessToken");

      const response = await axiosInstance.post("/timelog/saveTime", {
        project: proj ? proj.projectName : selectedProject,
        totalTime: totalHours,
        description: description,
      });

      if (response.data.success) {
        alert("Time log saved successfully ✅");
        resetTimer();
        await fetchData();
      }
    } catch (error) {
      console.error("SAVE TIME ERROR:", error);
      alert(error.response?.data?.message || "Failed to save time log");
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this log?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axiosInstance.delete(`/timelog/deleteTime/${id}`);
      setEntries(entries.filter((e) => e._id !== id));
      alert("Time log deleted ❌");
    } catch (err) {
      console.error(err);
      alert("Failed to delete log");
    }
  };

  const projectTotals = {};

  entries.forEach((e) => {
    projectTotals[e.project] = (projectTotals[e.project] || 0) + e.totalTime;
  });

  return (
    <div className="time-log-container-tml" style={{ padding: "30px" }}>
      <h2>Time Log</h2>

      {isRunning }

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxWidth: "450px",
          marginBottom: "20px",
        }}
      >
        <select
          value={selectedProject}
          onChange={(e) => handleProjectChange(e.target.value)}
          disabled={isRunning}
          style={{ width: "100%", padding: "10px", borderRadius: "6px" }}
        >
          <option value="">Select Project</option>

          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.projectName}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="What are you working on? (Description required)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isRunning}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div className={`timer-box-tml ${isRunning ? "timer-running" : ""}`}>
        <h3 className="timer-text-tml">{formatTime(elapsed)}</h3>

        {!isRunning ? (
          <button onClick={handleStart} className="main-btn-tml">
            Start
          </button>
        ) : isPaused ? (
          <>
            <button onClick={resumeTimer} className="main-btn-tml">
              Resume
            </button>
            <button onClick={handleStop} className="main-btn-tml">
              Stop
            </button>
          </>
        ) : (
          <>
            <button onClick={pauseTimer} className="main-btn-tml">
              Pause
            </button>
            <button onClick={handleStop} className="main-btn-tml">
              Stop
            </button>
          </>
        )}
      </div>

      <h3>Project Summary</h3>

      <table className="entry-table-tml">
        <thead>
          <tr>
            <th>Project</th>
            <th>Total Hours</th>
          </tr>
        </thead>

        <tbody>
          {Object.keys(projectTotals).map((pid) => (
            <tr key={pid}>
              <td>{pid}</td>
              <td>{formatHours(projectTotals[pid])}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Your Entries</h3>

      <table className="entry-table-tml">
        <thead>
          <tr>
            <th>Project</th>
            <th>Description</th>
            <th>Hours</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {entries.map((e) => (
            <tr key={e._id}>
              <td>{e.project}</td>
              <td>{e.description}</td>
              <td>{formatHours(e.totalTime)}</td>
              <td>{new Date(e.date).toLocaleDateString()}</td>

              <td>
                <button
                  className="delete-btn-tml"
                  onClick={() => handleDelete(e._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TimeLog;
