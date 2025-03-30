// backend/models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  timestamp: { type: Date, default: Date.now },
  dateOnly: { type: String, required: true }, // YYYY-MM-DD
  location: String,
  method: { type: String, enum: ['manual', 'gps', 'face'], default: 'manual' }
});

// ✅ ป้องกันเช็คชื่อซ้ำในวันเดียวกัน
attendanceSchema.index({ student: 1, classId: 1, dateOnly: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
