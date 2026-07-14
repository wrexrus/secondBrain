import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Doodle from './pages/Doodle';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import { Toaster } from 'react-hot-toast';
import './assets/styles/index.css';
import { Analytics } from '@vercel/analytics/react';

export const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = atob(payloadBase64);
    const decoded = JSON.parse(decodedJson);
    const exp = decoded.exp;
    const currentTime = Math.floor(Date.now() / 1000);
    return exp > currentTime;
  } catch (error) {
    return false;
  }
};

const App = () => {

  useEffect(() => {
    // Sync token and user with extension on initial load if already logged in
    const token = localStorage.getItem("token");
    
    if (token && isTokenValid(token)) {
      const userStr = localStorage.getItem("user");
      window.postMessage({
        type: "FROM_WEBSITE",
        token: token,
        user: userStr ? JSON.parse(userStr) : null
      }, window.location.origin);
    } else {
      if (token) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      // Force sync a logout if the website has no token (e.g. token expired, cache cleared)
      window.postMessage({
        type: "FROM_WEBSITE_LOGOUT"
      }, "*");
    }
  }, []);

  return (
    <>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--surface-color)',
            color: 'var(--text-color)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Analytics />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doodle" element={<Doodle />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
};

export default App;
