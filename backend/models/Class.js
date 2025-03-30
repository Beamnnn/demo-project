const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  courseName: String,
  courseCode: String,
  section: String,
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  attendanceTable: {
    type: Map, // ✅ เก็บวันที่ → รายชื่อนักศึกษาที่มา
    of: [mongoose.Schema.Types.ObjectId],
    default: {}
  }
}, {
  timestamps: true // ✅ เพิ่ม createdAt, updatedAt
});

module.exports = mongoose.model('Class', classSchema);
