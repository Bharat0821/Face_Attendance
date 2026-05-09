const router = require('express').Router();
const { markAttendance } = require('../controllers/attendanceController');

router.post('/mark', markAttendance);

module.exports = router;