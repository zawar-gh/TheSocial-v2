const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateAccessToken } = require('../middleware/auth');
const ctrl = require('../controllers/posts.controller');

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

router.post('/', authenticateAccessToken, upload.array('attachments', 5), ctrl.createPost);
router.get('/community/:id', authenticateAccessToken, ctrl.listByCommunity);

module.exports = router;


