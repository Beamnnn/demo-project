// backend/models/Enroll.js
const mongoose = require('mongoose');
const enrollSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  reason: String,
  approved: { type: Boolean, default: false },
});
module.exports = mongoose.model('Enroll', enrollSchema);
