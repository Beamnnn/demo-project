// backend/routes/enrollRoutes.js
const express = require('express');
const router = express.Router();
const Enroll = require('../models/Enroll');

// GET คำร้องทั้งหมด
router.get('/requests', async (req, res) => {
  try {
    const requests = await Enroll.find().populate('student classId');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: '❌ Error loading requests' });
  }
});

// POST ส่งคำร้องใหม่
router.post('/request', async (req, res) => {
  try {
    const { student, classId, reason } = req.body;
    const newReq = new Enroll({ student, classId, reason });
    await newReq.save();
    res.json({ message: '✅ Request sent' });
  } catch (err) {
    res.status(500).json({ message: '❌ Failed to create request' });
  }
});

module.exports = router;
