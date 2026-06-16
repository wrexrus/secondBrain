import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserProfile from '../components/layout/UserProfile';
import '../assets/styles/index.css';

// ==========================================
// Constants & Configuration
// ==========================================

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
  const navigate = useNavigate();

  // Read auth state from local storage
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token; 

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
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

  return (
    <>
      <header className="header">
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

      <main className="main-container">
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

          {/* Outer Ring */}
          <div className={`categories-ring ${isActive ? 'visible' : ''}`}>
            <svg className="ring-svg" viewBox="0 0 800 800">
              <ellipse cx="400" cy="400" rx="360" ry="260" className="category-circle-line" />
            </svg>
            
            {/* Dynamic Categories Rendered Around the Ring */}
            {categories.map((catName, i) => {
              const rx = 360;
              const ry = 260;
              // Start at -90 (top) and spread evenly around the 360 degrees
              const angle = -90 + (i * (360 / Math.max(categories.length, 1)));
              const rad = (angle * Math.PI) / 180;
              const x = Math.cos(rad) * rx;
              const y = Math.sin(rad) * ry;

              return (
                <div 
                  key={`category-${i}`} 
                  className="category-item"
                  onClick={() => handleCategoryClick(catName)}
                  style={{
                    '--x': `${x}px`,
                    '--y': `${y}px`,
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                  }}
                >
                  <span style={{ textTransform: 'capitalize' }}>{catName}</span>
                </div>
              );
            })}
            
            {/* Top Action Elements */}
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, calc(-50% - 300px))',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.6rem',
                pointerEvents: 'auto',
                zIndex: 10
              }}
            >
              <button 
                className="btn btn-primary" 
                style={{ 
                  padding: '0.4rem 1.2rem', 
                  fontSize: '0.9rem', 
                  boxShadow: '0 0 15px rgba(var(--primary-rgb), 0.6)' 
                }}
              >
                New Category
              </button>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>
                Add with Extension
              </div>
            </div>
          </div>

          {/* Inner Element: The Brain */}
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
            
            <div className={`click-indicator ${isActive ? 'active' : ''}`}>
              {isActive ? "SYSTEM ACTIVE" : "CLICK TO INITIALIZE"}
            </div>
          </div>
          
        </div>
      </main>

      {/* Floating Doodle Button uses router to navigate to /doodle */}
      <button className="doodle-btn" aria-label="Open Doodle Mode" onClick={() => navigate('/doodle')}>
        ✏️ Doodle
      </button>
    </>
  );
};

export default Home;
