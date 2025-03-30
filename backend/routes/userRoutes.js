// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/teachers', async (req, res) => {
  const teachers = await User.find({ role: 'teacher' }).select('fullName _id');
  res.json(teachers);
});

// ✅ Search users (by name, username, email) + optional role
router.get('/search/users', async (req, res) => {
  const { q = '', role } = req.query;
  if (!q.trim()) return res.json([]);

  const keyword = new RegExp(q.trim(), 'i');
  const filter = {
    $or: [
      { fullName: keyword },
      { username: keyword },
      { email: keyword }
    ]
  };

  if (role) {
    filter.role = role;
  }

  const users = await User.find(filter).limit(10).select('username fullName role');
  res.json(users);
});


module.exports = router;
