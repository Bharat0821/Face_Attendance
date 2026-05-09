import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Attendance from './pages/Attendance';
import Login from './pages/Login';
import StudentDashboard from './pages/studentDashboard';

function App() {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Initializing AI Models...");
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    const initApp = async () => {
      const savedTeacher = sessionStorage.getItem('teacher');
      if (savedTeacher) {
        setTeacher(JSON.parse(savedTeacher));
      }

      const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
      try {
        setLoadingMessage("Loading Face Recognition Models...");
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
        ]);
        
        console.log("✅ Models Loaded Successfully");
        setModelsLoaded(true);
      } catch (err) {
        console.error("AI Load Error:", err);
        setLoadingMessage("Failed to load AI models. Please check internet.");
      }
    };
    initApp();
  }, []);

  // Jab tak models load nahi hote, sirf loading screen dikhao
  if (!modelsLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-lg font-bold">{loadingMessage}</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50">
        {/* Navbar always shows */}
        <Navbar teacher={teacher} setTeacher={setTeacher} />
        
        <div className="flex flex-1">
          {/* Sidebar only shows when teacher is logged in */}
          {teacher && <Sidebar />}
          
          <main className={`flex-1 p-6 ${!teacher ? 'w-full' : ''}`}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login setTeacher={setTeacher} />} />
              <Route path="/" element={<Attendance />} />
              <Route path='/student-dashboard' element={<StudentDashboard />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={teacher ? <Dashboard /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/register" 
                element={teacher ? <Register /> : <Navigate to="/login" />} 
              />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;