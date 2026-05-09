const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  date: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendance', attendanceSchema);