const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Registration = require('../models/Registration');

// Utility function
const errorResponse = (res, status, message, details = {}) => {
  return res.status(status).json({
    success: false,
    error: message,
    ...details
  });
};

// Upload setup
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  allowedTypes.includes(file.mimetype) 
    ? cb(null, true)
    : cb(new Error('Invalid file type. Only JPG/JPEG/PNG allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Error handler for Multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return errorResponse(res, 413, err.code === 'LIMIT_FILE_SIZE' 
      ? 'File size exceeds 5MB limit'
      : 'File upload error');
  }
  next(err);
};

router.post('/', 
  upload.single('screenshot'),
  handleUploadError,
  async (req, res) => {
    try {
      // Validate input
      if (!req.file) {
        return errorResponse(res, 400, 'No file uploaded');
      }

      const email = req.body.email?.toLowerCase()?.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return errorResponse(res, 400, 'Valid email required');
      }

      // Check user exists
      const user = await Registration.findOne({ email });
      if (!user) {
        fs.unlinkSync(req.file.path); // Cleanup uploaded file
        return errorResponse(res, 404, 'Email not registered');
      }

      // Update user
      const updatedUser = await Registration.findOneAndUpdate(
        { email },
        {
          paymentScreenshot: `/uploads/${req.file.filename}`,
          status: 'completed'
        },
        { new: true, runValidators: true }
      ).select('-__v');

      res.json({
        success: true,
        message: "Payment proof uploaded successfully",
        data: {
          email: updatedUser.email,
          status: updatedUser.status,
          screenshot: updatedUser.paymentScreenshot
        },
        whatsappLink: "https://chat.whatsapp.com/YOUR_GROUP_LINK"
      });

    } catch (error) {
      // Cleanup file on error
      if (req.file?.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('⚠️ File cleanup failed:', err);
        });
      }

      console.error(`❌ Payment Error [${new Date().toISOString()}]:`, error);

      if (error.name === 'ValidationError') {
        return errorResponse(res, 400, 'Validation failed', {
          details: Object.values(error.errors).map(err => err.message)
        });
      }

      errorResponse(res, 500, 'Payment processing failed', {
        systemError: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

module.exports = router;
