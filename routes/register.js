const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');

// Utility function for error responses
const errorResponse = (res, status, message, details = {}) => {
  return res.status(status).json({
    success: false,
    error: message,
    ...details
  });
};

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, gender, age } = req.body;
    
    // Validate required fields
    const missingFields = [];
    const requiredFields = { name, email, phone, gender, age };
    Object.entries(requiredFields).forEach(([field, value]) => {
      if (!value || (typeof value === 'string' && !value.trim())) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return errorResponse(res, 400, 'Missing required fields', {
        missingFields,
        received: req.body
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 400, 'Invalid email format', {
        receivedEmail: email
      });
    }

    // Validate age
    if (isNaN(age) {
      return errorResponse(res, 400, 'Age must be a number');
    }
    if (age < 1 || age > 120) {
      return errorResponse(res, 400, 'Age must be between 1 and 120');
    }

    // Create registration
    const newRegistration = new Registration({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      gender,
      age: Number(age)
    });

    const savedRegistration = await newRegistration.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        id: savedRegistration._id,
        email: savedRegistration.email,
        registeredAt: savedRegistration.registeredAt
      }
    });

  } catch (error) {
    console.error(`⛔ Registration Error [${new Date().toISOString()}]:`, error);

    if (error.code === 11000) {
      return errorResponse(res, 409, 'Email already registered', {
        duplicateEmail: error.keyValue.email
      });
    }

    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, 'Validation failed', {
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    errorResponse(res, 500, 'Registration failed', {
      systemError: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/all', async (req, res) => {
  try {
    const registrations = await Registration.find().select('-__v').lean();
    
    if (!registrations.length) {
      return errorResponse(res, 404, 'No registrations found');
    }

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations.map(reg => ({
        ...reg,
        registeredAt: new Date(reg.registeredAt).toISOString()
      }))
    });

  } catch (error) {
    console.error(`⛔ Registration Fetch Error [${new Date().toISOString()}]:`, error);
    errorResponse(res, 500, 'Failed to fetch registrations', {
      systemError: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
