// backend/scripts/addUsers.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

mongoose.connect('mongodb://127.0.0.1:27017/facescan');

// backend/scripts/addUsers.js
const users = [
  {
    username: 'admin',
    password: '1234',
    role: 'admin',
    fullName: 'Admin User',
    email: 'admin@example.com'
  },
  {
    username: 'mock1',
    password: '1234',
    role: 'teacher',
    fullName: 'อาจารย์ Mock',
    email: 'teacher1@example.com'
  },
  {
    username: 'mock1student',
    password: 'mock1',
    role: 'student',
    fullName: 'นักศึกษา Mock',
    email: 'student1@example.com'
  }
];



async function seed() {
  for (let user of users) {
    const exists = await User.findOne({ username: user.username });
    if (!exists) {
      user.password = await bcrypt.hash(user.password, 10);
      await User.create(user);
      console.log('✅ Added:', user.username);
    } else {
      console.log('⚠️ Already exists:', user.username);
    }
  }
  process.exit();
}

seed();
