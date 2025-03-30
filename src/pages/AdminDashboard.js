import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClassCreateModal from '../components/ClassCreateModal';
import ClassList from '../components/ClassList';
import RequestTable from '../components/RequestTable';
import FaceScanHistory from '../components/FaceScanHistory';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const fullName = localStorage.getItem('fullName');
  const role = localStorage.getItem('role');
  const [reload, setReload] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleCreated = () => {
    setReload(prev => !prev);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length > 1) {
        axios.get(`http://localhost:5000/api/search/users?q=${searchTerm}`)
          .then(res => setSearchResults(res.data))
          .catch(() => setSearchResults([]));
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <>
      <nav className="navbar navbar-dark bg-dark px-3">
        <span className="navbar-brand mb-0 h5">FaceScanAttendance</span>
        <span className="text-white">{fullName} ({role})</span>
        <button className="btn btn-outline-light ms-3" onClick={handleLogout}>
          ออกจากระบบ
        </button>
      </nav>

      <div className="container py-4">
        <h4>👑 Admin Dashboard</h4>

        <ClassCreateModal onCreated={handleCreated} />

        <input
          type="text"
          className="form-control my-3"
          placeholder="🔍 ค้นหาชื่อ, วิชา, อาจารย์..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        {searchResults.length > 0 && (
          <ul className="list-group mb-3">
            {searchResults.map((user, idx) => (
              <li key={idx} className="list-group-item">
                {user.username} - {user.fullName} ({user.role})
              </li>
            ))}
          </ul>
        )}

        <ClassList key={reload} />
        <RequestTable />
        <FaceScanHistory />
      </div>
    </>
  );
}
