const multer = require('multer');
const path = require('path');

// Use memory storage instead of disk to prevent sensitive files
// from persisting on the server filesystem
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only JPEG and PNG images are allowed!'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: function (req, file, cb) {
    // Sanitize filename before processing
    file.originalname = path.basename(file.originalname);
    checkFileType(file, cb);
  },
});

module.exports = upload;
