const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

exports.markAttendance = async (req, res) => {
  try {
    const { descriptor } = req.body; // Array from frontend
    const students = await Student.find();

    let bestMatch = null;
    let threshold = 0.45; // Stricter threshold for better accuracy (0.6 is default)

    students.forEach((student) => {
      // Calculate Euclidean Distance between live face and DB face
      const distance = Math.sqrt(
        student.faceDescriptor.reduce((sum, val, i) => sum + Math.pow(val - descriptor[i], 2), 0)
      );

      if (distance < threshold) {
        threshold = distance;
        bestMatch = student;
      }
    });

    if (bestMatch) {
      const today = new Date().toISOString().split('T')[0];
      
      // Prevent double marking for the same day
      const alreadyMarked = await Attendance.findOne({ studentId: bestMatch._id, date: today });
      if (alreadyMarked) {
        return res.status(400).json({ message: `${bestMatch.name} already marked present.` });
      }

      const attendance = new Attendance({ studentId: bestMatch._id, date: today });
      await attendance.save();

      res.status(200).json({ message: `Welcome, ${bestMatch.name}!` });
    } else {
      res.status(404).json({ message: "Face not recognized. Try again." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};