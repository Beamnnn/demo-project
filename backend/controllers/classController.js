const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const path = require('path');
const User = require('../models/User');
const Class = require('../models/Class');

exports.createClassWithUpload = async (req, res) => {
  try {
    const { courseName, courseCode, section, teacherId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: '❌ กรุณาแนบไฟล์ .csv หรือ .xlsx' });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const results = [];

    if (ext === '.csv') {
      await new Promise((resolve, reject) => {
        fs.createReadStream(file.path)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
      });
    } else if (ext === '.xlsx') {
      const workbook = xlsx.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      // ✅ เริ่มอ่านจากแถวที่ 7 (index 6)
      const jsonData = xlsx.utils.sheet_to_json(sheet, { range: 6 });
      results.push(...jsonData);
    } else {
      return res.status(400).json({ message: '❌ รองรับเฉพาะไฟล์ .csv หรือ .xlsx เท่านั้น' });
    }

    const classDoc = new Class({
      courseName,
      courseCode,
      section,
      teacherId,
      students: []
    });

    for (const student of results) {
      const { student_id, fullName, email } = student;
      if (!student_id || !fullName || !email) continue;

      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          username: student_id,
          password: student_id,
          fullName,
          email,
          role: 'student'
        });
      }

      if (!classDoc.students.includes(user._id)) {
        classDoc.students.push(user._id);
      }
    }

    await classDoc.save();
    fs.unlinkSync(file.path);

    res.json({ message: '✅ คลาสและนักศึกษาถูกสร้างแล้ว', class: classDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ สร้างคลาสไม่สำเร็จ', error: err.message });
  }
};
