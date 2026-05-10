const Progress = require('../models/Progress');
const axios = require('axios');

// @desc    Complete a lesson
// @route   POST /api/progress/complete-lesson
// @access  Private (Student)
const completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    const userId = req.user.id;

    // Fetch course from course-service to get total lessons
    // Course service must be running and accessible via COURSE_SERVICE_URL
    const courseUrl = process.env.COURSE_SERVICE_URL || 'http://course-service:5002';
    
    let totalLessons = 0;
    try {
      const response = await axios.get(`${courseUrl}/api/courses/${courseId}`);
      if (response.data && response.data.lessons) {
        totalLessons = response.data.lessons.length;
      }
    } catch (err) {
      console.error('Failed to fetch course details', err.message);
      return res.status(404).json({ message: 'Course not found in Course Service' });
    }

    let progress = await Progress.findOne({ userId, courseId });

    if (!progress) {
      progress = new Progress({
        userId,
        courseId,
        completedLessons: []
      });
    }

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    // Calculate percentage
    if (totalLessons > 0) {
      progress.progressPercentage = Math.round((progress.completedLessons.length / totalLessons) * 100);
    } else {
      progress.progressPercentage = 100; // If no lessons, it's 100% complete
    }

    progress.updatedAt = Date.now();
    await progress.save();

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get progress for a course
// @route   GET /api/progress/:courseId
// @access  Private
const getProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      userId: req.user.id,
      courseId: req.params.courseId
    });

    if (!progress) {
      return res.json({ progressPercentage: 0, completedLessons: [] });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all progress for a user
// @route   GET /api/progress/my-progress
// @access  Private
const getMyProgress = async (req, res) => {
  try {
    const progressList = await Progress.find({ userId: req.user.id });
    res.json(progressList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  completeLesson,
  getProgress,
  getMyProgress
};
