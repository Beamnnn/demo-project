const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'ไม่พบผู้ใช้' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });

  const token = jwt.sign({ id: user._id, role: user.role }, 'secretkey', { expiresIn: '2h' });

  res.json({
    token,
    role: user.role,
    fullName: user.fullName,
    _id: user._id // ✅ เพิ่มตรงนี้
  });
};
