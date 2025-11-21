import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import App from './App';
import Status from './Status';
import NGOLogin from './NGOLogin';
import NGODashboard from './NGODashboard';

function Main() {
  const [ngoUser, setNgoUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('ngo_user');
    if (storedUser) {
      try {
        setNgoUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('ngo_user');
      }
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setNgoUser(user);
    navigate('/ngo/dashboard');
  };

  const handleLogout = () => {
    setNgoUser(null);
    navigate('/ngo/login');
  };

  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/status" element={<Status />} />

      <Route
        path="/ngo/login"
        element={
          ngoUser ? (
            <Navigate to="/ngo/dashboard" replace />
          ) : (
            <NGOLogin onLoginSuccess={handleLoginSuccess} />
          )
        }
      />

      <Route
        path="/ngo/dashboard"
        element={
          ngoUser ? (
            <NGODashboard user={ngoUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/ngo/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default Main;
