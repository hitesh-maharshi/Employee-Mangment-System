import Sidebar from "../components/Sidebar";
import TimerBanner from "../components/TimerBanner";
import { Outlet } from "react-router-dom";
import { TimerProvider } from "../context/TimerContext";
import "../styles/Dashboard.css";

function Layout() {
  return (
    <TimerProvider>
      <div className="dashboard">
        <Sidebar />

        <div className="content">
          <TimerBanner />
          <Outlet />
        </div>
      </div>
    </TimerProvider>
  );
}

export default Layout;