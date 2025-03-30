// src/pages/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value.trimStart() });
  };

  const handleLogin = async () => {
    setError('');
    if (!form.username || !form.password) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      const { token, role, fullName } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('fullName', fullName);

      if (role === 'admin') navigate('/admin-dashboard');
      else if (role === 'teacher') navigate('/teacher-dashboard');
      else if (role === 'student') navigate('/student-dashboard');
      else setError('ไม่รู้จักสิทธิ์การใช้งาน');
    } catch (err) {
      setError('เข้าสู่ระบบล้มเหลว');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3 className="mb-3 text-center">เข้าสู่ระบบ</h3>
      <input
        className="form-control mb-2"
        name="username"
        placeholder="ชื่อผู้ใช้"
        value={form.username}
        onChange={handleChange}
      />
      <input
        className="form-control mb-2"
        name="password"
        placeholder="รหัสผ่าน"
        type="password"
        value={form.password}
        onChange={handleChange}
      />
      <button className="btn btn-primary w-100" onClick={handleLogin}>เข้าสู่ระบบ</button>
      {error && <div className="text-danger mt-3 text-center">{error}</div>}
    </div>
  );
}
