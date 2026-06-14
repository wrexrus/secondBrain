import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Doodle from './pages/Doodle';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import './assets/styles/index.css';

const App = () => {
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
