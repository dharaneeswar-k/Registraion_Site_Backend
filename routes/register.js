const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, qualification, school_college_name } = req.body;
    const missingFields = [];

    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!phone) missingFields.push('phone');
    if (!qualification) missingFields.push('qualification');
    if (!school_college_name) missingFields.push('school_college_name');

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields,
        receivedData: req.body
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        receivedEmail: email
      });
    }

    const newRegistration = new Registration({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      qualification,
      school_college_name: school_college_name.trim()
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
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Email already registered',
        duplicateEmail: error.keyValue.email
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    console.error('⛔ Registration Error:', error.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const registrations = await Registration.find();
    res.status(200).json({
      success: true,
      data: registrations
    });
  } catch (error) {
    console.error('⛔ Error fetching registrations:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

module.exports = router;
