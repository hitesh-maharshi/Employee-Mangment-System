import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./layout/Layout"; // 🔥 NEW

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateUser from "./pages/CreateUser";
import Projects from "./pages/Projects";
import TimeLog from "./pages/TimeLog";
import LoginInfo from "./pages/LoginInfo";
import AdminDashboard from "./pages/AdminDashboard";
import AddReport from "./pages/AddReport";
import MyTasks from "./pages/MyTasks";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


import axios from "axios";

// 🔐 Global Axios Interceptor to catch expired JWT tokens
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // The JWT token has expired or is invalid
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("currentUser");
      
      // Redirect to login page to end session completely
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔐 Login Page */}
        <Route path="/" element={<Login />} />

        {/* 🔥 ALL PAGES WITH SIDEBAR */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/timelog" element={<TimeLog />} />
          <Route path="/create-user" element={<CreateUser />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/login-info" element={<LoginInfo />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/add-report" element={<AddReport />} />
          <Route path="/my-tasks" element={<MyTasks />} />
        </Route>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;