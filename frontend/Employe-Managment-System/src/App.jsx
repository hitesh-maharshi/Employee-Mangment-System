import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import EmployeeDashboard from './components/EmployeeDashboard';
import AdminDashboard from './components/AdminDashboard';
import { api } from './api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user session exists in localStorage
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleSignOut = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="loader" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {!user ? (
        <Auth onAuthSuccess={handleAuthSuccess} />
      ) : user.role === 'admin' ? (
        <AdminDashboard user={user} onSignOut={handleSignOut} />
      ) : (
        <EmployeeDashboard user={user} onSignOut={handleSignOut} />
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#080c14',
  },
};

export default App;
