const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Class = require('../models/Class');

// ✅ ค้นหานักศึกษา หรือ อาจารย์
router.get('/users', async (req, res) => {
  const { q, role } = req.query;
  const query = {
    $and: [
      role ? { role } : {},
      {
        $or: [
          { fullName: { $regex: q, $options: 'i' } },
          { username: { $regex: q, $options: 'i' } }
        ]
      }
    ]
  };
  const users = await User.find(query).limit(10);
  res.json(users);
});

// ✅ ค้นหาคลาส
router.get('/classes', async (req, res) => {
  const { q } = req.query;
  const regex = new RegExp(q, 'i');
  const classes = await Class.find({
    $or: [
      { courseName: regex },
      { courseCode: regex },
      { section: regex }
    ]
  }).populate('teacherId', 'fullName');
  res.json(classes);
});

module.exports = router;
