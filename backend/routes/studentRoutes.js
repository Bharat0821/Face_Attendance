const router = require('express').Router();
const { registerStudent, getStudentCount } = require('../controllers/studentController');

router.post('/register', registerStudent);
router.get('/count', getStudentCount);

module.exports = router;