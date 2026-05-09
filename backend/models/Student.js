const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  rollNo: { type: String, unique: true },
  descriptor: [Number],
});

module.exports = mongoose.model('Student', studentSchema);