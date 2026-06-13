import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../index.css';

const Signup = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate submission and redirect home
    navigate('/');
  };

  return (
    <div className="auth-page-container">
      <div className="modal-content auth-card">
        <button className="modal-close" onClick={() => navigate('/')}>&times;</button>
        <h2 className="modal-header">Create Account</h2>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" placeholder="Your name" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" required />
          </div>
          
          <button type="submit" className="auth-submit-btn">
            Sign Up
          </button>
        </form>

        <div className="auth-toggle">
          Already have an account?
          <Link to="/login">
            <span>Log in</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
