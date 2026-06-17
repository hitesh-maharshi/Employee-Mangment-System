import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", data.user.email)
      .single();

    if (userError || !userRow) {
      alert("User record not found in users table");
      return;
    }

    // ✅ ADD THIS (LOGIN LOG INSERT)
    await supabase.from("loginLogs").insert([
      {
        email: data.user.email,
        login: new Date(),
        logout: null,
      },
    ]);

    localStorage.setItem("currentUser", JSON.stringify(userRow));

    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2 className="login-title">Welcome Back 👋</h2>

        <p className="login-subtitle">
          Login to your EMS Dashboard
        </p>

        <form onSubmit={(e) => e.preventDefault()}>
          <input
            className="login-input"
            type="email"
            placeholder="Enter Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-wrapper">
            <input
              className="login-input"
              type={show ? "text" : "password"}
              placeholder="Enter Password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <span
              className="toggle-password"
              onClick={() => setShow(!show)}
            >
              {show ? "🙈" : "👁"}
            </span>
          </div>

          <button
            className="login-btn"
            onClick={handleLogin}
            type="button"
          >
            Login
          </button>
          <p
            className="forgot-password"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;