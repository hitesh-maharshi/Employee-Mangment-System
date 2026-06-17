import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useState, useEffect } from "react";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserAndData();
  }, []);

  const getUserAndData = async () => {
    const { data, error } = await supabase.getDashboard();

    if (error || !data) {
      setLoading(false);
      return;
    }

    setUser({
      name: data.name,
      email: data.email,
      role: data.role,
    });
    setTotalProjects(data.totalProjects || 0);
    setTotalHours(data.totalHours || 0);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (!user) {
    return <h2>Unable to load dashboard data</h2>;
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetch('https://employee-mangment-system-1.onrender.com/api/v1/users/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      navigate("/");
    }
  };

  return (
    <div className="dashboard-dsb">
      <Sidebar />

      <div className="content-dsb">
        <button
          onClick={handleLogout}
          className="logout-btn-dsb"
        >
          Logout 🚪
        </button>

        <h1>Welcome, {user.name || user.email} 👋</h1>

        <div className="cards-dsb">
          <div className="card-dsb blue-dsb">
            <h3>{totalProjects}</h3>
            <p>Total Projects</p>
          </div>

          <div className="card-dsb green-dsb">
            <h3>{totalHours} hrs</h3>
            <p>Total Work Time</p>
          </div>

          <div className="card-dsb purple-dsb">
            <h3>{totalProjects * 10}%</h3>
            <p>Performance</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
