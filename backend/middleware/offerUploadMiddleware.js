const multer = require('multer');
const path = require('path');

// Use memory storage to prevent sensitive files from persisting unnecessarily
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /pdf|jpe?g|png/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only PDF and Images are allowed for offer letters!'));
  }
}

const offerUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Sanitize filename
    file.originalname = path.basename(file.originalname);
    checkFileType(file, cb);
  },
});

module.exports = offerUpload;
