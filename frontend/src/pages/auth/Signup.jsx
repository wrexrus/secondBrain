import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../assets/styles/index.css';
import axios from "axios";
import BASE_URL from "../../config/api";


const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' }); // Clear old messages
    
    // --- Regex Validations ---
    // Name: Must contain at least one letter (cannot be purely numbers/symbols)
    if (!/[a-zA-Z]/.test(name)) {
      setMessage({ text: "Name must contain at least one letter.", type: "error" });
      return;
    }

    // Email: Standard email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ text: "Please enter a valid email address.", type: "error" });
      return;
    }

    // Password: At least 8 characters, must contain at least one letter and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setMessage({ text: "Password must be at least 8 characters long and contain a mix of letters and numbers.", type: "error" });
      return;
    }
    // -------------------------

    try {
        const response = await axios.post(
            `${BASE_URL}/api/auth/signup`,
            {
                name,
                email,
                password
            }
        );

        console.log(response.data);
        setMessage({ text: "Account created successfully! Redirecting...", type: "success" });
        
        // Wait a brief moment so the user can read the success message
        setTimeout(() => {
          // Some backends return token on signup, if not we navigate to login
          if(response.data.token) {
            localStorage.setItem("token", response.data.token);
            
            // for extension msg  
            window.postMessage(
                {
                    type: "FROM_WEBSITE",
                    token: response.data.token,
                    user: response.data.user
                },
                "*"
            );

            if (response.data.user) {
              localStorage.setItem("user", JSON.stringify(response.data.user));
            }
            navigate('/');
          } else {
            navigate('/login');
          }
        }, 1500);

    } catch (error) {
        console.log(error.response?.data || error.message);
        const errorText = error.response?.data?.message || "Error creating account";
        setMessage({ text: errorText, type: "error" });
    }
  };

  return (
    <div className="auth-page-container">
      <div className="modal-content auth-card">
        <button className="modal-close" onClick={() => navigate('/')}>&times;</button>
        <h2 className="modal-header">Create Account</h2>
        
        {message.text && (
          <div className={`auth-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" placeholder="Your name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
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
