import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import CampusMapSimpleUI from './CampusMapSimpleUI';

function App() {
 return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Login />} />
        
        
        <Route path="/map" element={<CampusMapSimpleUI />} />
      </Routes>
    </Router>
  );
}

export default App;
