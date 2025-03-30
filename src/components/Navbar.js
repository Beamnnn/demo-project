import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const fullName = localStorage.getItem('fullName');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      <span className="navbar-brand mb-0 h5">FaceScanAttendance</span>
      <span className="text-white">{fullName} ({role})</span>
      <button className="btn btn-outline-light ms-3" onClick={handleLogout}>
        ออกจากระบบ
      </button>
    </nav>
  );
}
