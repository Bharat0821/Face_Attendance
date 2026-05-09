require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://face-detection-attendance-egim.onrender.com',
  process.env.FRONTEND_URL || ''
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Models
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://nikitakinha2002:Nikita@cluster.sxsrrbt.mongodb.net/?appName=Cluster')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

app.post('/api/teacher/login', (req, res) => {
  const { teacherId, name } = req.body;
  if (teacherId === "ADMIN123" && name.toLowerCase() === "nikita") {
    return res.json({
      success: true,
      teacher: { name: "Nikita", teacherId: "ADMIN123" }
    });
  }
  res.status(401).json({ success: false, message: "Invalid credentials" });
});

app.get('/api/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const totalStudents = await Student.countDocuments();
    const presentToday = await Attendance.countDocuments({ date: today });
    const recentAttendance = await Attendance.find({ date: today })
      .populate('studentId', 'name rollNo')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ totalStudents, presentToday, recentAttendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/student-dashboard', async (req, res) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const allStudents = await Student.find({}, 'name rollNo');
    const monthlyHistory = await Attendance.find({
      date: { $gte: startOfMonth }
    }).populate('studentId', 'name rollNo');
    res.json({ allStudents, monthlyHistory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find({}, 'name rollNo descriptor');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

app.post('/api/students/register', async (req, res) => {
  try {
    const { name, rollNo, descriptor } = req.body;
    if (!descriptor || descriptor.length === 0) {
      return res.status(400).json({ error: "Invalid face descriptor" });
    }
    const existing = await Student.findOne({ rollNo });
    if (existing) {
      return res.status(400).json({ error: "Student already exists" });
    }
    const newStudent = new Student({
      name,
      rollNo,
      descriptor: Array.from(descriptor)
    });
    await newStudent.save();
    res.json({ success: true, message: "Student Registered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const { studentId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const alreadyMarked = await Attendance.findOne({ studentId, date: today });
    if (alreadyMarked) {
      return res.status(409).json({ message: "Already marked today" });
    }
    const attendance = new Attendance({ studentId, date: today });
    await attendance.save();
    res.json({ success: true, message: "Attendance marked" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clear', async (req, res) => {
  try {
    await Student.deleteMany({});
    await Attendance.deleteMany({});
    res.json({ success: true, message: "All records deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});