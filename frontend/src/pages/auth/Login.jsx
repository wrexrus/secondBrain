import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../assets/styles/index.css';
import axios from "axios";
import BASE_URL from "../../config/api";
import { isTokenValid } from '../../App';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && isTokenValid(token)) {
      // User requested: "it shows a message of 'Session in use' and fallbacks to logged in account of extension"
      setMessage({ text: "Session in use. Syncing with extension...", type: "success" });
      const userStr = localStorage.getItem("user");
      
      // Force sync to extension
      window.postMessage(
          {
              type: "FROM_WEBSITE",
              token: token,
              user: userStr ? JSON.parse(userStr) : null
          },
          window.location.origin
      );

      setTimeout(() => {
        navigate('/');
      }, 1500);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/login`,
        {
          email,
          password
        }
      );
      
      localStorage.setItem("token", response.data.token);

      // for extension msg  
      window.postMessage(
          {
              type: "FROM_WEBSITE",
              token: response.data.token,
              user: response.data.user
          },
          window.location.origin
      );

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      console.log(response.data);
      setMessage({ text: "Logged in successfully! Redirecting...", type: "success" });
      
      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (error) {
      console.log(error.response?.data || error.message);
      const errorText = error.response?.data?.message || "Invalid credentials";
      setMessage({ text: errorText, type: "error" });
    }
  };
  
  return (
    <div className="auth-page-container">
      <div className="modal-content auth-card">
        <button className="modal-close" onClick={() => navigate('/')}>&times;</button>
        <h2 className="modal-header">Welcome Back</h2>

        {message.text && (
          <div className={`auth-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
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
