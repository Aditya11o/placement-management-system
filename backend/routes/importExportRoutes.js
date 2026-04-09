const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, admin } = require('../middleware/authMiddleware');
const { 
  importStudents, 
  exportStudents, 
  exportPlacements 
} = require('../controllers/importExportController');

// Multer configuration for CSV (in-memory)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

router.use(protect);
router.use(admin);

router.post('/import/students', upload.single('file'), importStudents);
router.get('/export/students', exportStudents);
router.get('/export/placements', exportPlacements);

module.exports = router;
