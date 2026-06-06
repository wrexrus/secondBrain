import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Doodle from './pages/Doodle';
import './index.css';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/doodle" element={<Doodle />} />
    </Routes>
  );
};

export default App;
