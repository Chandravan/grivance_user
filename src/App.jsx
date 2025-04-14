// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GrievanceForm from "./pages/GrievanceForm";
import GrievanceTracker from "./pages/GrievanceTracker";
import Navbar from "./pages/Navbar";

function App() {
  return (
    <Router>
    <Navbar /> 
      <Routes>
        <Route path="/" element={<GrievanceForm />} />
        <Route path="/track-grievance" element={<GrievanceTracker />} />
      </Routes>
    </Router>
  );
}

export default App;
