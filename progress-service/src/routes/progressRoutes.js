const express = require('express');
const router = express.Router();
const {
  completeLesson,
  getProgress,
  getMyProgress
} = require('../controllers/progressController');
const { auth } = require('shared');
const { protect } = auth;

router.post('/complete-lesson', protect, completeLesson);
router.get('/my-progress', protect, getMyProgress);
router.get('/:courseId', protect, getProgress);

module.exports = router;
