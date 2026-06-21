import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { isTokenValid } from '../App';
import UserProfile from '../components/layout/UserProfile';
import '../assets/styles/index.css';

// ==========================================
// Constants & Configuration
// ==========================================

const DUMMY_CATEGORIES = ["Ideas", "Inspiration", "Tech", "Design", "Fitness", "Recipes", "Books", "Travel"];

const BRAIN_NODES = [
  { id: 1, x: 200, y: 50, r: 8 },
  { id: 2, x: 120, y: 80, r: 6 },
  { id: 3, x: 280, y: 80, r: 6 },
  { id: 4, x: 70, y: 150, r: 5 },
  { id: 5, x: 160, y: 140, r: 7 },
  { id: 6, x: 240, y: 140, r: 7 },
  { id: 7, x: 330, y: 150, r: 5 },
  { id: 8, x: 90, y: 230, r: 6 },
  { id: 9, x: 170, y: 220, r: 8 },
  { id: 10, x: 230, y: 220, r: 8 },
  { id: 11, x: 310, y: 230, r: 6 },
  { id: 12, x: 140, y: 300, r: 5 },
  { id: 13, x: 260, y: 300, r: 5 },
  { id: 14, x: 200, y: 320, r: 7 },
  { id: 15, x: 200, y: 180, r: 10 }, // Central core node
];

const BRAIN_EDGES = [
  [1, 2], [1, 3], [1, 5], [1, 6],
  [2, 4], [2, 5], [3, 6], [3, 7],
  [4, 8], [4, 5], [5, 9], [5, 15],
  [6, 10], [6, 15], [7, 11], [7, 6],
  [8, 9], [8, 12], [9, 10], [9, 15], [9, 12],
  [10, 11], [10, 15], [10, 13], [11, 13],
  [12, 14], [13, 14], [12, 13], [15, 14]
];

// ==========================================
// Main Home Component
// ==========================================

const Home = () => {
  const [isActive, setIsActive] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Feedback Form State
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });
  const [feedbackStatus, setFeedbackStatus] = useState('');

  // Manual Creation State
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newWebsite, setNewWebsite] = useState({ category: '', url: '', content: '' });
  const [websiteSuggestions, setWebsiteSuggestions] = useState([]);

  const navigate = useNavigate();

  // Read auth state from local storage
  const token = localStorage.getItem("token");
  const isAuthenticated = token && isTokenValid(token);  

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    } else {
      setCategories(DUMMY_CATEGORIES);
    }

    const handleMessage = (event) => {
      // Check if message is from our content script telling us to refresh categories
      if (event.data && event.data.type === "REFRESH_CATEGORIES") {
        fetchCategories();
      }
    };
    
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isAuthenticated]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/websites/categories", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const fetchWebsitesByCategory = async (categoryName) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/websites/${categoryName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWebsites(res.data);
    } catch (error) {
      console.error("Error fetching websites", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWebsite = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/websites/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove from local state immediately
      setWebsites(prev => prev.filter(site => site._id !== id));
      
      // If that was the last website in the category, we should refresh the categories
      if (websites.length === 1) {
        fetchCategories();
        closeExpansion();
      }
    } catch (error) {
      console.error("Error deleting website", error);
    }
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    fetchWebsitesByCategory(categoryName);
  };

  const closeExpansion = () => {
    setSelectedCategory(null);
    setWebsites([]);
  };

  const handleBrainClick = () => {
    setIsActive(!isActive);
  };

  const handleNewCategoryClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert("LogIn to create new Category!");
      return;
    }
    setIsCreatingCategory(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/websites/save', newWebsite, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsCreatingCategory(false);
      setNewWebsite({ category: '', url: '', content: '' });
      fetchCategories(); 
    } catch (err) {
      alert("Error saving category.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryInputChange = (e) => {
    const val = e.target.value;
    
    let formattedVal = val;
    if (val.length > 0) {
      formattedVal = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
    }
    
    setNewWebsite({ ...newWebsite, category: formattedVal });

    if (val.length > 0) {
      const matches = categories.filter(c => c.toLowerCase().startsWith(val.toLowerCase()));
      setWebsiteSuggestions(matches);
    } else {
      setWebsiteSuggestions([]);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackStatus('Submitting...');
    try {
      await axios.post('http://localhost:5000/api/feedback/submit', feedback);
      setFeedbackStatus('Success! Thank you for the suggestion.');
      setFeedback({ name: '', email: '', message: '' });
      setTimeout(() => setFeedbackStatus(''), 3000);
    } catch (err) {
      setFeedbackStatus('Error submitting feedback. Please try again.');
      setTimeout(() => setFeedbackStatus(''), 3000);
    }
  };

  const getIndicatorText = () => {
    if (!isAuthenticated) {
      return isActive ? "LOG IN TO AWAKEN" : "CLICK TO INITIALIZE";
    }
    return isActive ? "ACTIVE" : "CLICK TO INITIALIZE";
  };

  return (
    <>
      <header className="header" style={{ position: 'absolute', top: 0, width: '100%', zIndex: 50 }}>
        <h1 className="title">Synapse</h1>
        <div className="auth-container">
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

      {/* SECTION 1: The Hero (Brain) */}
      <section className="hero-section">
        <div className="brain-wrapper">
          
          {selectedCategory && (
            /* Expansion Modal Overlay */
            <div className="expansion-view" style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              animation: 'fadeIn 0.3s ease-out', 
              width: '90vw', 
              maxWidth: '600px', 
              background: 'rgba(28, 25, 23, 0.95)', 
              backdropFilter: 'blur(16px)',
              padding: '2.5rem', 
              borderRadius: '24px', 
              border: '1px solid rgba(var(--primary-rgb), 0.3)', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 60px rgba(var(--primary-rgb), 0.15)',
              zIndex: 100 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <h2 style={{ color: 'var(--text-color)', textTransform: 'capitalize', fontSize: '2.2rem', fontFamily: 'Comfortaa, cursive', fontWeight: '700' }}>
                  {selectedCategory}
                </h2>
                <button 
                  className="modal-close" 
                  onClick={closeExpansion}
                  style={{ position: 'relative', top: '0', right: '0' }}
                >×</button>
              </div>
              
              {isLoading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading records...</p>
              ) : websites.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No websites saved in this category yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem', maxHeight: '50vh', overflowY: 'auto', paddingRight: '1rem' }}>
                  {websites.map(site => (
                    <div key={site._id} style={{ 
                      padding: '1.5rem', 
                      background: 'rgba(255,255,255,0.03)', 
                      borderRadius: '16px', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.8rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.borderColor = 'rgba(var(--primary-rgb), 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <a href={site.url} target="_blank" rel="noopener noreferrer" style={{ 
                          color: 'var(--primary)', 
                          textDecoration: 'none', 
                          fontWeight: '600', 
                          fontSize: '1.1rem', 
                          wordBreak: 'break-all',
                          lineHeight: '1.4'
                        }}>
                          {site.url}
                        </a>
                        <button 
                          onClick={() => handleDeleteWebsite(site._id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.4rem',
                            borderRadius: '8px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#ef4444';
                            e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-muted)';
                            e.currentTarget.style.background = 'transparent';
                          }}
                          title="Delete"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                      
                      {site.content && (
                        <p style={{ 
                          color: 'var(--text-color)', 
                          fontSize: '0.95rem',
                          background: 'rgba(0,0,0,0.2)',
                          padding: '1rem',
                          borderRadius: '8px',
                          borderLeft: '3px solid var(--secondary)'
                        }}>
                          {site.content}
                        </p>
                      )}
                      
                      <div style={{ fontSize: '0.75rem', color: '#78716c', marginTop: '0.5rem' }}>
                        Saved on {new Date(site.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isCreatingCategory && (
            <div className="expansion-view" style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              animation: 'fadeIn 0.3s ease-out', 
              width: '90vw', 
              maxWidth: '500px', 
              background: 'rgba(28, 25, 23, 0.95)', 
              backdropFilter: 'blur(16px)',
              padding: '2.5rem', 
              borderRadius: '24px', 
              border: '1px solid rgba(var(--primary-rgb), 0.3)', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 60px rgba(var(--primary-rgb), 0.15)',
              zIndex: 100 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <h2 style={{ color: 'var(--text-color)', fontSize: '1.8rem', fontFamily: 'Comfortaa, cursive', fontWeight: '700' }}>
                  New Category
                </h2>
                <button 
                  className="modal-close" 
                  onClick={() => setIsCreatingCategory(false)}
                  style={{ position: 'relative', top: '0', right: '0' }}
                >×</button>
              </div>

              <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Category (Name)" 
                    className="feedback-input" 
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={newWebsite.category}
                    onChange={handleCategoryInputChange}
                    required
                  />
                  {websiteSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'rgba(41, 37, 36, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      marginTop: '0.3rem',
                      maxHeight: '150px',
                      overflowY: 'auto',
                      zIndex: 10
                    }}>
                      {websiteSuggestions.map((sug, idx) => (
                        <div 
                          key={idx}
                          style={{ padding: '0.8rem 1rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                          onClick={() => {
                            setNewWebsite({ ...newWebsite, category: sug });
                            setWebsiteSuggestions([]);
                          }}
                          onMouseEnter={(e) => e.target.style.background = 'rgba(var(--primary-rgb), 0.2)'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          {sug}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <input 
                  type="url" 
                  placeholder="URL (Optional, https://...)" 
                  className="feedback-input" 
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  value={newWebsite.url}
                  onChange={(e) => setNewWebsite({ ...newWebsite, url: e.target.value })}
                />
                
                <textarea 
                  placeholder="Content (Optional)" 
                  className="feedback-input" 
                  style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                  rows="3"
                  value={newWebsite.content}
                  onChange={(e) => setNewWebsite({ ...newWebsite, content: e.target.value })}
                ></textarea>

                <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Record'}
                </button>
              </form>
            </div>
          )}
            
            {/* Outer Ring */}
            <div className={`categories-ring ${isActive ? 'visible' : ''}`}>
              <svg className="ring-svg" viewBox="0 0 800 800">
                <ellipse cx="400" cy="400" rx="360" ry="260" className="category-circle-line" />
              </svg>
            
              {/* Dynamic Categories Rendered Around the Ring */}
              {categories.map((catName, i) => {
                const rx = 360;
                const ry = 260;
                const angle = -90 + (i * (360 / Math.max(categories.length, 1)));
                const rad = (angle * Math.PI) / 180;
                const x = Math.cos(rad) * rx;
                const y = Math.sin(rad) * ry;

                return (
                  <div 
                    key={`category-${i}`} 
                    className="category-item"
                    onClick={() => isAuthenticated ? handleCategoryClick(catName) : alert("Sign up to view inside this category!")}
                    style={{
                      '--x': `${x}px`,
                      '--y': `${y}px`,
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                    }}
                  >
                    <span style={{ fontWeight: '500' }}>{catName}</span>
                  </div>
                );
              })}
            </div>

          <div className="brain-glow"></div>
          
          <div 
            className={`brain-container ${isActive ? 'active' : ''}`} 
            onClick={handleBrainClick}
            aria-label={isActive ? "Deactivate Synapse" : "Activate Synapse"}
            role="button"
            tabIndex={0}
          >
            <svg className="brain-svg" viewBox="0 0 400 400">
              {/* Draw Connections */}
              {BRAIN_EDGES.map((edge, index) => {
                const n1 = BRAIN_NODES.find(n => n.id === edge[0]);
                const n2 = BRAIN_NODES.find(n => n.id === edge[1]);
                if (!n1 || !n2) return null;

                return (
                  <line
                    key={`edge-${index}`}
                    x1={n1.x}
                    y1={n1.x === 200 && n1.id === 15 && isActive ? n1.y + 10 : n1.y}
                    x2={n2.x}
                    y2={n2.y}
                    className="connection"
                    style={{ strokeDasharray: isActive ? '5,5' : '1000' }}
                  />
                );
              })}
              
              {/* Draw Nodes */}
              {BRAIN_NODES.map((node) => (
                <circle
                  key={`node-${node.id}`}
                  cx={node.x}
                  cy={node.id === 15 && isActive ? node.y + 10 : node.y}
                  r={isActive ? node.r * 1.15 : node.r}
                  className={`node ${node.id === 15 ? 'node-pulse' : ''}`}
                />
              ))}
            </svg>
            
            {isActive && (
              <div 
                style={{
                  position: 'absolute',
                  top: '32%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  pointerEvents: 'auto',
                  zIndex: 30
                }}
              >
                <button 
                  className="new-category-btn" 
                  onClick={handleNewCategoryClick}
                  style={{ 
                    padding: '0.6rem 1.4rem', 
                    fontSize: '0.9rem', 
                    fontWeight: '700',
                    background: 'var(--primary)',
                    border: '2px solid var(--primary)',
                    color: '#fff',
                    borderRadius: '30px',
                    boxShadow: '0 0 20px rgba(var(--primary-rgb), 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Outfit, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'orange';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(var(--primary-rgb), 0.8)';
                    e.currentTarget.style.transform = 'scale(1.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--primary)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(var(--primary-rgb), 0.5)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  + New Category
                </button>
              </div>
            )}
            
            <div className={`click-indicator ${isActive ? 'active' : ''}`}>
              <span style={{ opacity: 0.8, letterSpacing: '2px', fontSize: '0.85rem' }}>
                {getIndicatorText()}
              </span>
            </div>
          </div>
        </div>

        {/* Floating Doodle Button (Moved inside Hero Section) */}
        <button className="doodle-btn" aria-label="Open Doodle Mode" onClick={() => navigate('/doodle')}>
          ✏️ Doodle
        </button>

        {/* Bouncing Scroll Indicator */}
        <div style={{ position: 'absolute', bottom: '40px', animation: 'bounce 2s infinite', opacity: 0.5 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </section>

      {/* SECTION 2: Tutorial */}
      <section className="section-container" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <h2 className="section-title">How Synapse Works</h2>
        <div className="tutorial-grid">
          <div className="tutorial-steps">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Install the Extension</h3>
              <p style={{ color: 'var(--text-muted)' }}>Get the Synapse Chrome extension to start saving instantly from any tab.</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Save & Tag</h3>
              <p style={{ color: 'var(--text-muted)' }}>Click the extension, choose an intelligent category, and hit save. It's that fast.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Watch it Grow</h3>
              <p style={{ color: 'var(--text-muted)' }}>Open your dashboard and watch your glowing brain expand with your knowledge.</p>
            </div>
          </div>
          <div className="tutorial-video">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--primary)', opacity: 0.5 }}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <p style={{ position: 'absolute', bottom: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Video Tutorial Placeholder</p>
          </div>
        </div>
      </section>

      {/* SECTION 3: Features */}
      <section className="section-container">
        <h2 className="section-title">Why use Synapse?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Lightning Fast</h3>
            <p style={{ color: 'var(--text-muted)' }}>Save websites in less than a second without ever switching tabs.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3 className="feature-title">Visual Knowledge</h3>
            <p style={{ color: 'var(--text-muted)' }}>Stop reading boring lists. Experience your saved data as an interactive neural network.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">Smart Tags</h3>
            <p style={{ color: 'var(--text-muted)' }}>Intelligent autocomplete ensures you never misplace or duplicate a category again.</p>
          </div>
        </div>
      </section>

      {/* SECTION 4: Feedback Form */}
      <section className="section-container" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <h2 className="section-title" style={{ marginBottom: '1rem' }}>Drop a Suggestion</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '3rem' }}>Have an idea to make Synapse better? Let us know!</p>
        
        <div className="feedback-container">
          <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
            <input 
              type="text" 
              className="feedback-input" 
              placeholder="Your Name" 
              required 
              value={feedback.name}
              onChange={(e) => setFeedback({...feedback, name: e.target.value})}
            />
            <input 
              type="email" 
              className="feedback-input" 
              placeholder="Your Email" 
              required 
              value={feedback.email}
              onChange={(e) => setFeedback({...feedback, email: e.target.value})}
            />
            <textarea 
              className="feedback-input" 
              placeholder="Your suggestion..." 
              rows="4" 
              required
              value={feedback.message}
              onChange={(e) => setFeedback({...feedback, message: e.target.value})}
              style={{ resize: 'vertical' }}
            ></textarea>
            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '1rem' }}>
              Send Suggestion
            </button>
            {feedbackStatus && (
              <p style={{ textAlign: 'center', color: feedbackStatus.includes('Error') ? '#ef4444' : '#4ade80', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                {feedbackStatus}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div>
          <h2 style={{ fontFamily: 'Comfortaa, cursive', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Synapse</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your digital second brain.</p>
        </div>
        <div className="footer-links">
          <a href="#">Twitter</a>
          <a href="#">Discord</a>
          <a href="#">Privacy Policy</a>
        </div>
      </footer>
    </>
  );
};

export default Home;
