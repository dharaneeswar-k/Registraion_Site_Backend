const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const registerRouter = require('./routes/register');
const paymentRouter = require('./routes/payment');

const app = express();

// Improved CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // List of allowed origins
    const allowedOrigins = [
      'http://192.168.1.8:61060',    // Local development
      'http://localhost:*',          // Any localhost port
      'https://your-admin-domain.com' // Your production admin panel domain
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => origin.match(new RegExp(allowed.replace('*', '.*'))))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Pre-flight requests handling
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection with retry logic
const connectWithRetry = () => {
  console.log('MONGODB_URI:', process.env.MONGODB_URI);
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

// Routes
app.use('/api/registrations', registerRouter);
app.use('/api/upload', paymentRouter);

// Enhanced get-users route with error handling
app.get('/get-users', async (req, res) => {
  try {
    const users = await mongoose.model('Registration').find().lean();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      message: err.message 
    });
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  
  // Handle CORS errors
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS Policy',
      message: err.message
    });
  }

  // Generic error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Server configuration
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
