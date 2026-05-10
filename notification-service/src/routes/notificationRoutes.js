const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead
} = require('../controllers/notificationController');
const { auth } = require('shared');
const { protect } = auth;

router.get('/', protect, getNotifications);
router.patch('/:id/read', protect, markAsRead);

module.exports = router;
