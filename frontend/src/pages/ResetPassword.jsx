import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/ResetPassword.css";

const API_BASE_URL = 'https://employee-mangment-system-1.onrender.com/api/v1';

async function apiCall(endpoint, method = 'POST', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || `API Error: ${response.status}`);
  return json;
}

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleUpdate = async () => {
    if (!email || !otp || !password) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await apiCall("/users/reset-password", "POST", { email, otp, newPassword: password });
      alert(res.message || "Password updated successfully");
      navigate("/");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-wrapper">
      <div className="rp-card">
        <h2 className="rp-title">Set New Password</h2>
        <input
          className="rp-input"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: '15px' }}
        />
        <input
          className="rp-input"
          type="text"
          placeholder="Enter OTP from Email"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          style={{ marginBottom: '15px' }}
        />
        <input
          className="rp-input"
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: '20px' }}
        />
        <button className="rp-btn" onClick={handleUpdate} disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;