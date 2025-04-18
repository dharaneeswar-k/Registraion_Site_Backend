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
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
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

// Start the server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
