import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/index.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload(); // Quickest way to reset the app state for now
  };

  const getInitials = (name) => {
    if (!name) return 'US';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="user-profile-container">
      <div className="user-info">
        <div className="user-avatar">
          <span>{getInitials(user?.name)}</span>
        </div>
        <span className="user-name">{user?.name || 'User'}</span>
      </div>
      <button className="btn btn-outline btn-logout" onClick={handleLogout}>
        {/* <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg> */}
        Logout
      </button>
    </div>
  );
};

export default UserProfile;
