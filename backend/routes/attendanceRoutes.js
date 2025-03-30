const express = require('express');
const router = express.Router();
const FaceScanLog = require('../models/FaceScanLog');

// ✅ ประวัติการสแกนทั้งหมด
router.get('/history', async (req, res) => {
  try {
    const history = await FaceScanLog.find()
      .populate('studentId', 'fullName username')
      .populate('classId', 'courseName courseCode');
    res.json(history);
  } catch (err) {
    console.error('❌ ดึงประวัติการสแกนล้มเหลว:', err);
    res.status(500).json({ message: '❌ ไม่สามารถโหลดข้อมูลได้' });
  }
});

module.exports = router;
