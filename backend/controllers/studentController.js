const Student = require('../models/Student');

exports.registerStudent = async (req, res) => {
  try {
    const { name, rollNo, faceDescriptor } = req.body;
    
    const newStudent = new Student({ name, rollNo, faceDescriptor });
    await newStudent.save();
    
    res.status(201).json({ message: "Student registered successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getStudentCount = async (req, res) => {
  try {
    const count = await Student.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};