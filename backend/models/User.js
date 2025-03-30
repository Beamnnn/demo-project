const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' }
}, { timestamps: true }); // ← เพิ่ม timestamp

module.exports = mongoose.model('User', userSchema);
