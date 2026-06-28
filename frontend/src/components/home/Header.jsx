import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import UserProfile from '../layout/UserProfile'; // Assuming UserProfile is in layout based on previous knowledge or I will fix it if wrong

const Header = ({ isAuthenticated, setSearchMode, setIsGlobalSearchOpen }) => {
  const navigate = useNavigate();

  return (
    <header className="header" style={{ position: 'absolute', top: 0, width: '100%', zIndex: 50 }}>
      <h1 className="title">Synapse</h1>
      <div className="auth-container" style={{ alignItems: 'center' }}>
        <button 
          onClick={() => {
            if (isAuthenticated) {
              setSearchMode('global');
              setIsGlobalSearchOpen(true);
            }
            else toast.error("Log in to use Global Search!");
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-color)',
            cursor: 'pointer',
            padding: '0.5rem',
            transition: 'color 0.2s',
            marginRight: '1rem',
            display: 'flex',
            alignItems: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-color)'}
          title="Global Search (Cmd/Ctrl + K)"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        {isAuthenticated ? (
          <UserProfile />
        ) : (
          <>
            <button className="btn btn-outline" onClick={() => navigate('/login')}>Log in</button>
            <button className="btn btn-primary" onClick={() => navigate('/signup')}>Sign up</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
