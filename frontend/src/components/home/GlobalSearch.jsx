import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../../config/api';

const HighlightText = ({ text, highlight }) => {
  if (!text) return null;
  if (!highlight.trim()) return <span>{text}</span>;
  
  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(\\b${escapeRegExp(highlight)})`, 'gi');
  const parts = text.toString().split(regex);
  const matchRegex = new RegExp(`^${escapeRegExp(highlight)}$`, 'i');
  
  return (
    <span>
      {parts.map((part, i) => 
        matchRegex.test(part) ? (
          <span key={i} style={{ background: 'rgba(var(--primary-rgb), 0.5)', color: '#fff', borderRadius: '4px', padding: '0 2px' }}>{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const GlobalSearch = ({ isOpen, onClose, token, categories, onCategoryClick, mode = 'global' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setQuery('');
        setResults([]);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsRendered(true);
      // Small delay to allow the DOM to mount before triggering transition
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (mode === 'categories') return; // Don't search backend in categories mode
    
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length > 0) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query, mode]);

  // Keyboard listener for ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const performSearch = async (searchQuery) => {
    setIsSearching(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/websites/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(res.data);
    } catch (error) {
      console.error("Search error", error);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isRendered) return null;

  // Filter local categories that match query
  const matchedCategories = query.trim() === '' ? categories : categories.filter(c => c.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="search-modal-overlay" style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(10px)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '10vh',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div style={{ 
        width: '90%', 
        maxWidth: '700px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2rem',
        opacity: isVisible ? 1 : 0,
        transform: `translateY(${isVisible ? '0' : '-20px'}) scale(${isVisible ? '1' : '0.98'})`,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', top: '50%', left: '1.5rem', transform: 'translateY(-50%)', color: 'var(--primary)', display: 'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input 
            autoFocus
            type="text"
            placeholder={mode === 'categories' ? "Search all categories..." : "Search Categories, Links, or Notes..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '1.5rem 1.5rem 1.5rem 4rem',
              fontSize: '1.2rem',
              background: 'rgba(28,25,23,0.9)',
              border: '2px solid rgba(var(--primary-rgb), 0.5)',
              borderRadius: '24px',
              color: '#fff',
              outline: 'none',
              boxShadow: '0 10px 40px rgba(var(--primary-rgb), 0.15)',
              fontFamily: 'Outfit, sans-serif'
            }}
          />
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '50%', right: '1.5rem', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', padding: '0.5rem' }}
          >
            ESC to Close
          </button>
        </div>

        {/* Results Container */}
        <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto', maxHeight: '65vh', paddingRight: '1rem' }}>

          {mode === 'categories' && (
            <div>
              <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase' }}>All Categories</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                {matchedCategories.map((cat, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      onClose();
                      onCategoryClick(cat);
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease',
                      fontFamily: 'Outfit, sans-serif'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(var(--primary-rgb), 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    <HighlightText text={cat} highlight={query} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Links/Notes Section */}
          {mode === 'global' && query.trim().length > 0 && (
            <div>
              <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                {isSearching ? 'Searching...' : `Found ${results.length} Links & Notes`}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {results.map((res) => (
                  <div 
                    key={res._id} 
                    onClick={() => {
                      onClose();
                      onCategoryClick(res.category);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      padding: '1.2rem',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '16px',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(var(--primary-rgb), 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#fff', fontWeight: 'bold' }}>
                        <HighlightText text={res.category} highlight={query} /> {res.subCategory && <span style={{ color: 'var(--primary)', fontWeight: 'normal' }}> ❯ <HighlightText text={res.subCategory} highlight={query} /></span>}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(res.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {res.content && <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}><HighlightText text={res.content} highlight={query} /></p>}
                    
                    {res.url && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.8rem 1rem', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', wordBreak: 'break-all', paddingRight: '1rem' }}><HighlightText text={res.url} highlight={query} /></span>
                        <a 
                          href={res.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            background: '#fff',
                            color: '#000',
                            padding: '0.4rem 1rem',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            textDecoration: 'none',
                            fontWeight: '600',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Open Link
                        </a>
                      </div>
                    )}
                  </div>
                ))}
                {results.length === 0 && !isSearching && (
                  <p style={{ color: 'var(--text-muted)' }}>No websites or notes found for this query.</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
