const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateAccessToken } = require('../middleware/auth');
const ctrl = require('../controllers/profile.controller');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_'));
  }
});

const upload = multer({ storage });

const router = express.Router();

router.get('/', authenticateAccessToken, ctrl.getCurrentProfile);
router.put('/update', authenticateAccessToken, upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 }
]), ctrl.updateProfile);
router.get('/:username', authenticateAccessToken, ctrl.getByUsername);

module.exports = router;


