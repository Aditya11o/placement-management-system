const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { cloudinary, uploadToCloudinary } = require('../utils/cloudinary');
const router = express.Router();



// @desc    Upload file to Cloudinary (streamed from memory, never touches disk)
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400);
      return res.json({ message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'pms',
      resource_type: 'auto',
    }, 'standard');

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

module.exports = router;
