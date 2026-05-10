require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { rabbitmq } = require('shared');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/courses', require('./routes/courseRoutes'));

const PORT = process.env.PORT || 5002;

app.listen(PORT, async () => {
  console.log(`Course Service running on port ${PORT}`);
  try {
    await rabbitmq.connectRabbitMQ(process.env.RABBITMQ_URL || 'amqp://localhost');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ on startup', error);
  }
});
