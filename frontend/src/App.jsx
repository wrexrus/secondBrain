import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Doodle from './pages/Doodle';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import './assets/styles/index.css';

const App = () => {

  useEffect(() => {
    // Sync token and user with extension on initial load if already logged in
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token) {
      window.postMessage({
        type: "FROM_WEBSITE",
        token: token,
        user: userStr ? JSON.parse(userStr) : null
      }, "*");
    } else {
      // Force sync a logout if the website has no token (e.g. token expired, cache cleared)
      window.postMessage({
        type: "FROM_WEBSITE_LOGOUT"
      }, "*");
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/doodle" element={<Doodle />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
};

export default App;
