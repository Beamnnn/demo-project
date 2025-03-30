const express = require('express');
const router = express.Router();
const multer = require('multer');
const parseCSV = require('../utils/parseCSV');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('csv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: '❌ No file uploaded' });

    const rows = await parseCSV(req.file.path);
    const inserted = [];

    for (const row of rows) {
      const { username, password, fullName } = row;
      if (!username || !password || !fullName) continue;

      const exists = await User.findOne({ username });
      if (exists) continue;

      const hashed = await bcrypt.hash(password, 10);
      const user = new User({ username, password: hashed, fullName, role: 'student' });
      await user.save();
      inserted.push(username);
    }

    return res.json({ message: '✅ Students created', count: inserted.length, inserted });
  } catch (err) {
    console.error('❌ Upload student error:', err);
    res.status(500).json({ message: '❌ Failed to upload students' });
  }
});

module.exports = router;
