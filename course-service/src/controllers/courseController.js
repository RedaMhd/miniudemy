const Course = require('../models/Course');
const { rabbitmq } = require('shared');

// @desc    Create a course
// @route   POST /api/courses
// @access  Private (Instructor)
const createCourse = async (req, res) => {
  try {
    const { title, description, lessons, instructorName } = req.body;

    const course = await Course.create({
      title,
      description,
      instructorId: req.user.id,
      // Prefer name from JWT (new tokens); fall back to body field for old sessions, or default string
      instructorName: req.user.name || instructorName || 'Unknown Instructor',
      lessons: lessons || []
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.enrolledStudents.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    course.enrolledStudents.push(req.user.id);
    await course.save();

    // Publish RabbitMQ event
    const eventPayload = {
      event: 'course.enrolled',
      userId: req.user.id,
      courseId: course._id,
      courseTitle: course.title
    };

    try {
      await rabbitmq.publishEvent('course_events', 'course.enrolled', eventPayload);
    } catch (rabbitError) {
      console.error('Failed to publish RabbitMQ event:', rabbitError.message);
      // We don't fail the enrollment if RabbitMQ is down, but we log it
    }

    res.json({ message: 'Successfully enrolled', course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  enrollCourse
};
