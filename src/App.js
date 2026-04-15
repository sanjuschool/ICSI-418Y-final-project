import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import CampusMapSimpleUI from './CampusMapSimpleUI';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route shows Login */}
        <Route path="/" element={<Login />} />
        
        {/* Success route shows Map */}
        <Route path="/map" element={<CampusMapSimpleUI />} />
      </Routes>
    </Router>
  );
}

export default App;