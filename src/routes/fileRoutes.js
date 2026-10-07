const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const config = require('../config');

// Ensure upload directory
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = crypto.randomBytes(12).toString('hex');
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit (R-04)
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Faqat PDF, JPG va PNG formatidagi fayllar qabul qilinadi (R-04)'));
    }
  }
});

/**
 * POST /api/files
 * Dalil faylini yuklash
 */
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Fayl tanlanmagan' });
  }

  res.json({
    success: true,
    file_id: req.file.filename,
    original_name: req.file.originalname,
    size: req.file.size,
    url: `/api/files/${req.file.filename}`
  });
});

/**
 * GET /api/files/:filename
 * Faylni ko'rish / yuklab olish
 */
router.get('/:filename', (req, res) => {
  const filePath = path.join(config.uploadDir, path.basename(req.params.filename));
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Fayl topilmadi' });
  }
  res.sendFile(filePath);
});

module.exports = router;
