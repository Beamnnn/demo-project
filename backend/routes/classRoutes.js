// backend/routes/classRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs'); // ✅ เพิ่ม bcrypt
const User = require('../models/User');
const Class = require('../models/Class');

const upload = multer({ storage: multer.memoryStorage() });

function cleanName(raw) {
  return raw
    .replace(/ผู้สอน/g, '')
    .replace(/อาจารย์/g, '')
    .replace(/ดร\./g, '')
    .replace(/ดร/g, '')
    .replace(/ศ\./g, '')
    .replace(/ศ/g, '')
    .trim();
}

router.post('/create', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: '❌ ไม่พบไฟล์แนบ' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const courseRow = rows.find(r => r?.[0]?.toString().includes('วิชา'));
    const teacherRow = rows.find(r => r?.[5]?.toString().includes('ผู้สอน'));

    if (!courseRow || !teacherRow) {
      return res.status(400).json({ message: '❌ ไม่พบข้อมูลวิชา หรือ อาจารย์ในไฟล์' });
    }

    const courseParts = courseRow[0].split(/\s+/);
    const courseCode = courseParts[1];
    const courseName = courseParts.slice(2).join(' ');
    const section = String(req.body.section || '1');

    const teacherRaw = teacherRow[5];
    const teacherName = cleanName(teacherRaw);

    let teacher = await User.findOne({ fullName: teacherName, role: 'teacher' });
    if (!teacher) {
      const hashed = await bcrypt.hash('teacher123', 10);
      teacher = await User.create({
        username: teacherName.replace(/\s/g, '').toLowerCase(),
        password: hashed,
        fullName: teacherName,
        email: teacherName.replace(/\s/g, '').toLowerCase() + '@kmutnb.ac.th',
        role: 'teacher'
      });
    }

    const students = [];
    const seen = new Set();

    for (let i = 9; i < rows.length; i++) {
      const row = rows[i];
      const studentId = String(row[1] || '').trim();
      const fullName = String(row[2] || '').trim();
      if (!studentId || !fullName || seen.has(studentId)) continue;
      seen.add(studentId);

      const email = `s${studentId}@kmutnb.ac.th`;
      let user = await User.findOne({ username: studentId });

      if (!user) {
        const hashed = await bcrypt.hash(studentId, 10); // ✅ แก้ตรงนี้
        user = await User.create({
          username: studentId,
          password: hashed,
          fullName,
          email,
          role: 'student'
        });
      } else {
        if (user.fullName !== fullName) {
          user.fullName = fullName;
          await user.save();
        }
      }

      students.push(user._id);
    }

    if (students.length === 0) {
      return res.status(400).json({ message: '❌ ไม่พบนักศึกษาในไฟล์' });
    }

    let classDoc = await Class.findOne({ courseCode, section });
    if (classDoc) {
      classDoc.courseName = courseName;
      classDoc.teacherId = teacher._id;
      classDoc.students = students;
      await classDoc.save();
    } else {
      classDoc = await Class.create({
        courseCode,
        courseName,
        section,
        teacherId: teacher._id,
        students
      });
    }

    res.json({ message: '✅ สร้างหรืออัปเดตคลาสแล้ว', class: classDoc });

  } catch (err) {
    console.error('❌ CREATE ERROR:', err);
    res.status(500).json({ message: '❌ ไม่สามารถสร้างคลาสได้', error: err.message });
  }
});

// ✅ GET
router.get('/', async (req, res) => {
  const classes = await Class.find()
    .populate('teacherId', 'fullName')
    .populate('students', 'fullName email username');
  res.json(classes);
});

// ✅ DELETE
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Class.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: '❌ ไม่พบคลาสนี้' });
    res.json({ message: '✅ ลบคลาสแล้ว' });
  } catch (err) {
    console.error('❌ DELETE ERROR:', err);
    res.status(500).json({ message: '❌ ลบไม่สำเร็จ' });
  }
});

module.exports = router;
