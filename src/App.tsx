import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HostConfigPage from './pages/HostConfigPage';
import LoginPage from './pages/Auth';
import MeetingRoom from './pages/MeetingRoom';
import ProtectedRoute from './utils/ProtectedComponent';

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<ProtectedRoute element={<HomePage />} />} />
        <Route path="/host-config" element={<ProtectedRoute element={<HostConfigPage />} />} />
        <Route path="/meeting-room" element={<MeetingRoom />} />
      </Routes>
    </Router>
  );
}

export default App;