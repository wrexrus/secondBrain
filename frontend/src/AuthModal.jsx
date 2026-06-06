import React, { useState, useEffect } from 'react';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'

  // Update mode if it changes from props when opened
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate submission
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2 className="modal-header">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label>Name</label>
              <input type="text" placeholder="Your name" required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" required />
          </div>
          
          <button type="submit" className="auth-submit-btn">
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-toggle">
          {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
          <span onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
