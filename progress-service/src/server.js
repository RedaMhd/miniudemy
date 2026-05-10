require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/progress', require('./routes/progressRoutes'));

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => console.log(`Progress Service running on port ${PORT}`));
