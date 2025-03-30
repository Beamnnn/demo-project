// =========================
// 📦 Import Dependencies
// =========================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

// =========================
// 📂 Import Models & Routes
// =========================
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const userRoutes = require('./routes/userRoutes');
const enrollRoutes = require('./routes/enrollRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const searchRoutes = require('./routes/searchRoutes'); // ✅ ย้ายมาบน
const uploadStudentRoutes = require('./routes/uploadStudents'); // ✅ เพิ่มบรรทัดนี้

// =========================
// 🚀 App Config
// =========================
const app = express();
const PORT = 5000;

// =========================
// 🔧 Middleware
// =========================
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/api/students', uploadStudentRoutes); // ✅ และบรรทัดนี้ย้ายมาหลังจากประกาศ app แล้ว

// =========================
// 📁 File Upload Config (.csv, .xlsx)
// =========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// =========================
// ⬆️ Upload Route
// =========================
app.post('/api/classes/upload', upload.single('csv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: '❌ No file uploaded' });

    const ext = path.extname(req.file.originalname);
    let rows = [];

    if (ext === '.csv') {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', async () => await handleStudentInsert(rows, res));

    } else if (ext === '.xlsx') {
      const workbook = xlsx.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = xlsx.utils.sheet_to_json(sheet);
      await handleStudentInsert(rows, res);

    } else {
      return res.status(400).json({ message: '❌ Unsupported file type' });
    }

  } catch (err) {
    console.error('❌ Upload Error:', err);
    res.status(500).json({ message: '❌ Upload failed' });
  }
});

// =========================
// 🔁 Helper: Insert Students
// =========================
async function handleStudentInsert(rows, res) {
  const created = [];

  for (const s of rows) {
    if (!s.username || !s.password || !s.fullName) continue;

    const exists = await User.findOne({ username: s.username });
    if (exists) continue;

    const hashedPassword = await bcrypt.hash(s.password, 10);
    const newStudent = new User({
      username: s.username,
      password: hashedPassword,
      fullName: s.fullName,
      role: 'student'
    });

    await newStudent.save();
    created.push(newStudent.username);
  }

  return res.json({ message: '✅ Students inserted', count: created.length, inserted: created });
}

// =========================
// 📡 API Routes
// =========================
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/users', userRoutes);
app.use('/api/enroll', enrollRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/search', searchRoutes); // ✅ ถูกตำแหน่งแล้ว

// =========================
// 🧪 Health Check
// =========================
app.get('/', (req, res) => res.send('✅ FaceScanAttendance API is running'));

// =========================
// 🗄️ Connect MongoDB
// =========================
mongoose.connect('mongodb://127.0.0.1:27017/facescan', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => console.log(`🚀 Server running at: http://localhost:${PORT}`));
})
.catch(err => console.error('❌ MongoDB Error:', err));
