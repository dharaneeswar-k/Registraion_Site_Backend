const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const registerRouter = require('./routes/register');
const paymentRouter = require('./routes/payment');

const app = express();

console.log('MONGODB_URI:', process.env.MONGODB_URI);

const MONGODB_URI = process.env.MONGODB_URI;

// CORS configuration
app.use(cors({
  origin: '*', // Allows all origins. For production, replace '*' with your frontend URL (e.g., 'http://your-frontend-url.com')
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1);
});

// Routers
app.use('/api/registrations', registerRouter);
app.use('/api/upload', paymentRouter);

// Route to fetch all users (for the admin panel)
app.get('/get-users', async (req, res) => {
  try {
    const users = await mongoose.model('Registration').find(); // Adjust the model name if necessary
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Start the server
const PORT = process.env.PORT || 5001; // Default to port 5001, but allow setting via environment variable
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
