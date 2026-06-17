import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";

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

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const res = await apiCall("/users/forgot-password", "POST", { email });
      alert(res.message || "OTP sent to your email");
      navigate("/reset-password", { state: { email } });
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-box">
        <h2 className="forgot-title">Forgot Password 🔐</h2>
        <p className="forgot-subtitle">
          Enter your email to receive reset link
        </p>
        <input
          className="forgot-input"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="forgot-btn"
          onClick={handleReset}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        <p className="back-login" onClick={() => navigate("/")}>
          Back to Login
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;