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
    const allowedOrigins = [
      /http:\/\/192\.168\.1\.8:\d+/,  // Local development IP
      /http:\/\/localhost:\d+/,       // Localhost ports
      'https://your-admin-domain.com' // Production domain
    ];
    
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(pattern => 
      typeof pattern === 'string' ? 
        origin === pattern : 
        pattern.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error(`Origin '${origin}' not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection with retry
const connectWithRetry = () => {
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

// Get users endpoint
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

// Error handling
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(500).json({
    error: err.message.includes('CORS') ? 'CORS Policy Error' : 'Server Error',
    message: process.env.NODE_ENV === 'production' ? 
      'Contact administrator' : err.message
  });
});

// Server start
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌿 Environment: ${process.env.NODE_ENV || 'development'}`);
});
