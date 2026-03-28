const multer = require('multer');
const path = require('path');

// Use memory storage instead of disk to prevent sensitive resume files
// from persisting on the server filesystem
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  const filetypes = /pdf|doc|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype) || file.originalname.endsWith('.docx') || file.originalname.endsWith('.doc');

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'));
  }
}

const resumeUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = resumeUpload;
