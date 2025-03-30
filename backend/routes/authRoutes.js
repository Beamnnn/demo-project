// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();

const { login } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// ✅ ดึงข้อมูล user ที่ login อยู่ (JWT middleware ต้องทำงาน)
router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

// ✅ login ด้วย username/password
router.post('/login', login);

module.exports = router;
