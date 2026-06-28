import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/index.css';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    window.postMessage({ type: "FROM_WEBSITE_LOGOUT" }, window.location.origin);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload(); 
  };

  const getInitials = (name) => {
    if (!name) return 'US';
    return name.substring(0, 2).toUpperCase();
  };

  const getFirstName = (name) => {
    if (!name) return 'User';
    return name.split(' ')[0];
  };

  return (
    <div 
      className="user-profile-container" 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div 
        className="user-info" 
        style={{ 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.8rem',
          background: isOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
          padding: '0.4rem 1rem 0.4rem 0.4rem',
          borderRadius: '30px',
          transition: 'background 0.2s'
        }}
      >
        <div className="user-avatar" style={{
          width: '35px', height: '35px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: '700', fontSize: '0.9rem'
        }}>
          <span>{getInitials(user?.name)}</span>
        </div>
        <span className="user-name" style={{ fontWeight: '500', color: 'var(--text-color)' }}>
          {getFirstName(user?.name)}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isOpen && (
        <div 
          className="profile-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            right: '0',
            width: '220px',
            background: 'var(--surface-color)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            padding: '1rem',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem', marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div className="user-avatar" style={{
              width: '50px', height: '50px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: '700', fontSize: '1.2rem'
            }}>
              <span>{getInitials(user?.name)}</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-color)', fontSize: '1rem' }}>{user?.name || 'User'}</p>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user?.email || 'user@synapse.com'}</p>
            </div>
          </div>
          

          <button 
            onClick={handleLogout}
            style={{
              background: 'transparent', border: 'none', color: '#ef4444', textAlign: 'left', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
