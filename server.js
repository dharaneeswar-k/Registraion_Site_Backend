const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const registerRouter = require('./routes/register');
const paymentRouter = require('./routes/payment');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      /http:\/\/192\.168\.1\.8:\d+/,  // Local development IP
      /http:\/\/localhost:\d+/,       // Localhost ports
      'https://your-admin-domain.com'  // Production domain
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(pattern => {
      if (typeof pattern === 'string') {
        return origin === pattern;
      }
      return pattern.test(origin);
    })) {
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

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: 'majority'
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

// Admin Endpoint
app.get('/get-users', async (req, res) => {
  try {
    const users = await mongoose.model('Registration').find().lean();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('⚠️ Server Error:', err);
  
  const statusCode = err.message.includes('CORS') ? 403 : 500;
  const message = err.message.includes('CORS') 
    ? 'CORS Policy Violation' 
    : 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// Server Startup
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌿 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔄 CORS allowed for:`, corsOptions.origin.toString());
});
