
// backend/models/EnrollRequest.js
const mongoose = require('mongoose');

const enrollRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subjectCode: String,
  section: String,
  status: { type: String, default: 'pending' }, // pending / approved / rejected
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EnrollRequest', enrollRequestSchema);
