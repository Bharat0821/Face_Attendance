import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import API from '../api/axiosInstance'; 
import { Camera, Check, AlertCircle, Loader2 } from 'lucide-react';

const Register = () => {
  const webcamRef = useRef(null);

  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Loading models...");
  const [modelsReady, setModelsReady] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        setStatus("Ready to register 👤");
        setModelsReady(true);
      } catch (err) {
        console.error("Model loading error:", err);
        setStatus("Failed to load models");
      }
    };

    loadModels();
  }, []);

  const handleRegister = async () => {
    if (!name || !rollNo) {
      setErrorMessage("Please enter name and roll number");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setStatus("Detecting face...");

    try {
      const video = webcamRef.current.video;

      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      // ✅ Critical check
      if (!detection || !detection.descriptor || detection.descriptor.length !== 128) {
        setErrorMessage("Face not detected properly. Try again.");
        setStatus("Ready to register 👤");
        setLoading(false);
        return;
      }

      const descriptorArray = Array.from(detection.descriptor);

      // ✅ Send to backend using API instance
      await API.post('/students/register', {
        name,
        rollNo,
        descriptor: descriptorArray
      });

      setSuccessMessage("✅ Registration Successful!");
      setStatus("Ready for next student");

      // Clear form
      setName("");
      setRollNo("");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);

    } catch (err) {
      console.error("Registration error:", err);
      setErrorMessage(err.response?.data?.error || "❌ Registration failed");
      setStatus("Ready to register 👤");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
          <Camera className="text-indigo-600" size={28} />
          New Enrollment
        </h2>
        <p className="text-center text-sm text-slate-500 mt-2">{status}</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700">
          <Check size={18} />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700">
          <AlertCircle size={18} />
          <span className="font-medium text-sm">{errorMessage}</span>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <input
          className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Student Name"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={loading}
        />

        <input
          className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Roll Number"
          value={rollNo}
          onChange={e => setRollNo(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="rounded-2xl overflow-hidden mb-6 border-4 border-slate-100 bg-slate-900">
        <Webcam 
          ref={webcamRef} 
          screenshotFormat="image/jpeg"
          width={400}
          height={300}
        />
      </div>

      <button
        onClick={handleRegister}
        disabled={loading || !modelsReady}
        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
          ${loading || !modelsReady
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
          }`}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Processing AI...
          </>
        ) : (
          <>
            <Camera size={20} />
            Register Face
          </>
        )}
      </button>
    </div>
  );
};

export default Register;