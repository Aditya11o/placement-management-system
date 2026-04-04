const multer = require('multer');
const path = require('path');

// Use memory storage instead of disk to prevent sensitive resume files
// from persisting on the server filesystem
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /pdf/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = file.mimetype === 'application/pdf';

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only PDF files are allowed!'));
  }
}

const resumeUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Sanitize filename before processing
    file.originalname = path.basename(file.originalname);
    checkFileType(file, cb);
  },
});

module.exports = resumeUpload;
