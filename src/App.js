import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import CampusMapSimpleUI from './CampusMapSimpleUI';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page is Login */}
        <Route path="/" element={<Login />} />
        
        {/* Signup page */}
        <Route path="/signup" element={<Signup />} />
        
        {/* Main Application page */}
        <Route path="/map" element={<CampusMapSimpleUI />} />

        {/* Catch-all: redirect any typos back to Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;