const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  }
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title']
  },
  description: {
    type: String,
    required: [true, 'Please add a course description']
  },
  instructorId: {
    type: String, // from Auth service
    required: true
  },
  instructorName: {
    type: String,
    required: true
  },
  lessons: [lessonSchema],
  enrolledStudents: [{
    type: String // user IDs from Auth service
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', courseSchema);
