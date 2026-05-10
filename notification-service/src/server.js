require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { rabbitmq } = require('shared');
const Notification = require('./models/Notification');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/notifications', require('./routes/notificationRoutes'));

const PORT = process.env.PORT || 5004;

app.listen(PORT, async () => {
  console.log(`Notification Service running on port ${PORT}`);
  
  try {
    await rabbitmq.connectRabbitMQ(process.env.RABBITMQ_URL || 'amqp://localhost');
    
    // Subscribe to events
    rabbitmq.subscribeEvent('course_events', 'notification_queue', 'course.enrolled', async (eventData) => {
      console.log('Received course.enrolled event:', eventData);
      try {
        await Notification.create({
          userId: eventData.userId,
          message: `You successfully enrolled in the course: ${eventData.courseTitle}`
        });
      } catch (err) {
        console.error('Error creating notification:', err);
      }
    });

  } catch (error) {
    console.error('Failed to connect to RabbitMQ on startup', error);
  }
});
