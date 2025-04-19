// routes/registration.js
const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');

// POST: Create a new registration
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, qualification, schoolOrCollegeName, paymentScreenshot } = req.body;

    const newRegistration = new Registration({
      name,
      email,
      phone,
      qualification,
      schoolOrCollegeName,
      paymentScreenshot
    });

    const savedRegistration = await newRegistration.save();

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        id: savedRegistration._id,
        email: savedRegistration.email,
        status: savedRegistration.status,
        registeredAt: savedRegistration.registeredAt
      }
    });
  } catch (error) {
    console.error('⛔ Registration Error:', error);

    // Duplicate email error
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Email already registered',
        duplicateEmail: error.keyValue.email
      });
    }

    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const details = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation failed',
        details
      });
    }

    // Generic server error
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// GET: Fetch all registrations
router.get('/all', async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ registeredAt: -1 });
    return res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    console.error('⛔ Error fetching registrations:', error);
    return res.status(500).json({
      error: 'Failed to fetch registrations',
      details: error.message
    });
  }
});

module.exports = router;
