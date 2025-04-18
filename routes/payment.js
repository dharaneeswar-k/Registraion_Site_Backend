const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Registration = require('../models/Registration');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpg, .jpeg, and .png files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/', upload.single('screenshot'), async (req, res) => {
  try {
    if (!req.body.email || !req.file) {
      return res.status(400).json({ error: 'Missing required fields (email or screenshot)' });
    }

    const updatedUser = await Registration.findOneAndUpdate(
      { email: req.body.email.toLowerCase().trim() },
      {
        paymentScreenshot: `/uploads/${req.file.filename}`,
        status: 'completed'
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`✅ Payment uploaded for ${req.body.email}`);

    res.json({
      success: true,
      message: "Payment proof uploaded successfully.",
      whatsappLink: "https://chat.whatsapp.com/YOUR_GROUP_LINK"
    });

  } catch (error) {
    console.error('❌ Payment upload error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to process payment' });
  }
});

module.exports = router;
