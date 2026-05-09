import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { CheckCircle, Fingerprint, AlertCircle, Loader2 } from 'lucide-react';
import API from '../api/axiosInstance'; // ✅ Correct path

const Attendance = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const [status, setStatus] = useState("Initializing...");
  const [matchedStudent, setMatchedStudent] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAlreadyPresent, setIsAlreadyPresent] = useState(false); 
  const [studentsData, setStudentsData] = useState([]);

  const lastMarkedRef = useRef(0);

  useEffect(() => {
    loadModels().then(() => {
      startVideo();
      loadStudents();
    });

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  const loadModels = async () => {
    try {
      const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setStatus("Models loaded ✅");
    } catch (err) {
      setStatus("Model loading failed ❌");
    }
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => { videoRef.current.srcObject = stream; })
      .catch(() => setStatus("Camera access denied ❌"));
  };

  const loadStudents = async () => {
    try {
      setStatus("Loading students...");
      const res = await API.get('/students'); // ✅ Use API instance
      
      const formatted = res.data.map(student => {
        if (!student.descriptor || student.descriptor.length === 0) return null;
        return {
          id: student._id,
          name: student.name,
          descriptor: new faceapi.LabeledFaceDescriptors(
            student.name,
            [new Float32Array(student.descriptor)]
          )
        };
      }).filter(Boolean);

      setStudentsData(formatted);
      setStatus("System ready 👀");
    } catch (error) {
      console.error("Failed to load students:", error);
      setStatus("Failed to load students ❌");
    }
  };

  const handleVideoPlay = () => {
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || isProcessing || studentsData.length === 0) return;

      const displaySize = { width: 640, height: 480 };
      faceapi.matchDimensions(canvasRef.current, displaySize);

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.4 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, 640, 480);

      if (detection) {
        const resized = faceapi.resizeResults(detection, displaySize);
        faceapi.draw.drawDetections(canvasRef.current, resized);

        const now = Date.now();
        if (now - lastMarkedRef.current > 5000) {
          await matchAndMark(detection.descriptor);
        }
      }
    }, 600);
  };

  const matchAndMark = async (descriptor) => {
    setIsProcessing(true);
    setStatus("Scanning Face...");

    try {
      const matcher = new faceapi.FaceMatcher(studentsData.map(s => s.descriptor), 0.5);
      const result = matcher.findBestMatch(descriptor);

      if (result.label !== "unknown") {
        const matched = studentsData.find(s => s.name === result.label);
        lastMarkedRef.current = Date.now();

        try {
          await API.post('/attendance', { studentId: matched.id }); // ✅ Use API instance
          
          setMatchedStudent(matched.name);
          setIsAlreadyPresent(false);
          setStatus("✅ Attendance Recorded");

        } catch (err) {
          if (err.response && (err.response.status === 409 || err.response.status === 400)) {
            setMatchedStudent(matched.name);
            setIsAlreadyPresent(true);
            setStatus(`⚠️ ${matched.name} is already present`);
          } else {
            setStatus("❌ Server error");
          }
        }

        setTimeout(() => {
          setMatchedStudent(null);
          setIsAlreadyPresent(false);
          setStatus("Ready for next student 👀");
          setIsProcessing(false);
        }, 3000);

      } else {
        setStatus("❌ Face not recognized");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Processing error:", error);
      setStatus("❌ Processing error");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
          <Fingerprint className="text-indigo-600" size={36} />
          Mark Attendance with Face Recognition
        </h1>
        <p className={`mt-2 font-bold px-4 py-1 rounded-full inline-block ${isProcessing ? 'bg-indigo-100 text-indigo-700 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
          {status}
        </p>
      </div>

      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-slate-900 group">
        <video ref={videoRef} onPlay={handleVideoPlay} autoPlay muted width="640" height="480" />
        <canvas ref={canvasRef} className="absolute top-0 left-0" />

        {isProcessing && !matchedStudent && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="text-white animate-spin" size={60} />
          </div>
        )}

        {matchedStudent && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center text-white backdrop-blur-md transition-all
            ${isAlreadyPresent ? 'bg-amber-500/90' : 'bg-emerald-500/90'}`}>
            {isAlreadyPresent ? <AlertCircle size={100} /> : <CheckCircle size={100} className="animate-bounce" />}
            <h2 className="text-5xl font-black mt-4">{matchedStudent}</h2>
            <p className="mt-2 text-xl font-bold uppercase tracking-[0.2em]">
              {isAlreadyPresent ? "Already Marked Today" : "Attendance Recorded"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;