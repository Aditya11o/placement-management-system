const multer = require('multer');
const path = require('path');

// Use memory storage instead of disk to prevent sensitive files
// from persisting on the server filesystem
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  const filetypes = /pdf|doc|docx|jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: PDF, DOC, and Images (JPG/PNG) only!');
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;
