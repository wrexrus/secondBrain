import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../index.css';

const Login = () => {
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
        <h2 className="modal-header">Welcome Back</h2>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" required />
          </div>
          
          <button type="submit" className="auth-submit-btn">
            Log In
          </button>
        </form>

        <div className="auth-toggle">
          Don't have an account?
          <Link to="/signup">
            <span>Sign up</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
