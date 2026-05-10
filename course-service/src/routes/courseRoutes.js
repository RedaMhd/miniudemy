const express = require('express');
const router = express.Router();
const {
  createCourse,
  getCourses,
  getCourseById,
  enrollCourse
} = require('../controllers/courseController');
const { auth } = require('shared');
const { protect, authorize } = auth;

router.route('/')
  .get(getCourses)
  .post(protect, authorize('instructor'), createCourse);

router.route('/:id')
  .get(getCourseById);

router.route('/:id/enroll')
  .post(protect, authorize('student'), enrollCourse);

module.exports = router;
