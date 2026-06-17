import "../styles/LoginInfo.css";
import { useState, useEffect } from "react";

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

function LoginInfo() {
  const [logs, setLogs] = useState([]);
  const [user, setUser] = useState(null);

  // ✅ Loader State
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserAndLogs();
  }, []);

  const formatDateTime = (d) => {
    return d
      ? new Date(d).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "Active";
  };

  const getUserAndLogs = async () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) {
        setLoading(false);
        return;
      }
      setUser(JSON.parse(userStr));

      const res = await apiCall("/users/logHistory");
      const data = res.data || [];
      
      // Sort logs descending (newest first)
      const sortedData = data.sort((a, b) => new Date(b.login) - new Date(a.login));
      setLogs(sortedData);
    } catch (err) {
      console.error("Failed to fetch login history:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Loader UI
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="login-info-container-lgi">
      <h2>Login History</h2>

      {logs.map((log, i) => (
        <div className="login-card-lgi" key={i}>
          <p>
            <strong>Login:</strong> {formatDateTime(log.login)}
          </p>

          <p>
            <strong>Logout:</strong>{" "}
            {log.logOut ? formatDateTime(log.logOut) : "Active"}
          </p>
        </div>
      ))}
    </div>
  );
}

export default LoginInfo;