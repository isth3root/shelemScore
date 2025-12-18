import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import GameDetail from './pages/GameDetail';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-linear-to-br from-blue-500 to-purple-600 text-white" dir="rtl">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<GameDetail />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
