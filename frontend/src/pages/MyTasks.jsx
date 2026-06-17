import { useEffect, useState } from "react";
import "../styles/MyTasks.css";

const API_BASE_URL = 'https://employee-mangment-system-1.onrender.com/api/v1';

async function apiCall(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('accessToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || `API Error: ${response.status}`);
  return json;
}

function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) {
        setLoading(false);
        return;
      }

      const res = await apiCall("/task/getTaskById");
      let data = res.data || [];

      // Filter tasks assigned today
      data = data.filter(t => t.created_at && t.created_at.split("T")[0] === today);
      
      // Sort newest first
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const markDone = async (id) => {
    try {
      await apiCall(`/task/markAsDone/${id}`, 'PUT');
      fetchTasks(); // Refresh tasks after marking done
    } catch (err) {
      alert("Failed to mark task as done: " + err.message);
    }
  };

  if (loading)
    return (
      <p className="tasks-loading-tsk" style={{ padding: "20px" }}>
        Loading tasks...
      </p>
    );

  return (
    <div className="tasks-container-tsk" style={{ padding: "30px" }}>
      <h2 className="tasks-title-tsk">
        My Tasks for {today}
      </h2>

      {tasks.length === 0 && (
        <p className="no-tasks-tsk">
          No tasks assigned today 🎉
        </p>
      )}

      {tasks.map((task) => (
        <div
          className="task-card-tsk"
          key={task._id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "8px",
          }}
        >
          <h3 className="task-title-tsk">{task.taskName}</h3>

          <p className="task-desc-tsk">{task.description}</p>

          <p className="task-status-tsk">
            Status: <b>{task.status}</b>
          </p>

          {task.status === "pending" && (
            <button
              className="task-btn-tsk"
              onClick={() => markDone(task._id)}
            >
              Mark as Done
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default MyTasks;