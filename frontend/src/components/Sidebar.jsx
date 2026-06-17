import { Link, useLocation } from "react-router-dom";
import { FaHome, FaProjectDiagram, FaClock, FaUser, FaChartBar, FaTasks } from "react-icons/fa";
import { FaColonSign, FaCrown } from "react-icons/fa6";
import "../styles/Sidebar.css";

function Sidebar() {
  const location = useLocation(); // 🔥 DIRECT YAHI USE KAR
  const currentPath = location.pathname;

  const user = JSON.parse(localStorage.getItem("currentUser") || "null");

  const getClass = (path) => {
    if (currentPath === path || currentPath.startsWith(path + "/")) {
      return "link-sdb active-sdb";
    }
    return "link-sdb";
  };

  return (
    <div className="sidebar-sdb">
      <h2 className="logo-sdb">CODINWALK</h2>

      <Link to="/dashboard" className={getClass("/dashboard")}>
        <FaHome /> Dashboard
      </Link>

      <Link to="/projects" className={getClass("/projects")}>
        <FaProjectDiagram /> Projects
      </Link>

      <Link to="/timelog" className={getClass("/timelog")}>
        <FaClock /> Time Log
      </Link>

      <Link to="/login-info" className={getClass("/login-info")}>
        <FaColonSign /> Login Info
      </Link>

      {user?.role === "admin" && (
        <Link to="/admin" className={getClass("/admin")}>
          <FaCrown /> Admin Panel
        </Link>
      )}

      {user?.role === "admin" && (
        <Link to="/create-user" className={getClass("/create-user")}>
          <FaUser /> Create User
        </Link>
        
      )}
      <Link to="/add-report" className={getClass("/add-report")}> <FaChartBar/>Add Report</Link>
      <Link to="/my-tasks" className={getClass("/my-tasks")}> <FaTasks/> My Tasks</Link>
    </div>
  );
}

export default Sidebar;