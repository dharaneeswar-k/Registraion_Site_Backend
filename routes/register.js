const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, qualification, schoolOrCollegeName } = req.body;

    // Trim and validate all inputs
    const nameTrimmed = name ? name.trim() : '';
    const emailTrimmed = email ? email.trim() : '';
    const phoneTrimmed = phone ? phone.trim() : '';
    const qualificationTrimmed = qualification ? qualification.trim() : '';
    const schoolOrCollegeNameTrimmed = schoolOrCollegeName ? schoolOrCollegeName.trim() : '';

    // Check for empty fields after trimming
    const missingFields = [];
    if (!nameTrimmed) missingFields.push('name');
    if (!emailTrimmed) missingFields.push('email');
    if (!phoneTrimmed) missingFields.push('phone');
    if (!qualificationTrimmed) missingFields.push('qualification');
    if (!schoolOrCollegeNameTrimmed) missingFields.push('schoolOrCollegeName');

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields,
        receivedData: req.body
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      return res.status(400).json({
        error: 'Invalid email format',
        receivedEmail: emailTrimmed
      });
    }

    // Create and save registration
    const newRegistration = new Registration({
      name: nameTrimmed,
      email: emailTrimmed.toLowerCase(),
      phone: phoneTrimmed,
      qualification: qualificationTrimmed,
      schoolOrCollegeName: schoolOrCollegeNameTrimmed
    });

    const savedRegistration = await newRegistration.save();

    // Success response
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
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Email already registered',
        duplicateEmail: error.keyValue.email
      });
    }

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      console.error('Validation Error:', error.errors);
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    // Generic server error
    console.error('⛔ Registration Error:', error.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ registeredAt: -1 });
    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    console.error('⛔ Error fetching registrations:', error);
    res.status(500).json({
      error: 'Failed to fetch registrations',
      details: error.message
    });
  }
});

module.exports = router;
