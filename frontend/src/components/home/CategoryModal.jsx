import React from 'react';

const CategoryModal = ({
  selectedCategory,
  isLoading,
  websites,
  activeSubCategory,
  setActiveSubCategory,
  handleDeleteWebsite,
  closeExpansion,
  setNewWebsite,
  setIsCreatingCategory
}) => {
  return (
    <div className="expansion-view custom-scrollbar" style={{ 
      position: 'fixed', 
      top: '2%', 
      left: '2%', 
      right: '2%',
      bottom: '2%',
      animation: 'slowZoomFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards', 
      background: 'rgba(28, 25, 23, 0.97)', 
      backdropFilter: 'blur(30px)',
      padding: '3rem 2rem', 
      zIndex: 100,
      overflowY: 'auto',
      overflowX: 'hidden',
      borderRadius: '24px',
      border: '1px solid rgba(var(--primary-rgb), 0.3)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 100px rgba(var(--primary-rgb), 0.15)'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <h2 style={{ color: 'var(--text-color)', textTransform: 'capitalize', fontSize: '2.2rem', fontFamily: 'Comfortaa, cursive', fontWeight: '700' }}>
          {selectedCategory}
        </h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => {
              setNewWebsite({ category: selectedCategory, subCategory: '', url: '', content: '' });
              setIsCreatingCategory(true);
            }}
            style={{
              background: 'rgba(var(--primary-rgb), 0.2)',
              border: '1px solid var(--primary)',
              color: 'var(--primary)',
              padding: '0.6rem 1.2rem',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(var(--primary-rgb), 0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(var(--primary-rgb), 0.2)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New
          </button>
          <button 
            className="modal-close" 
            onClick={closeExpansion}
            style={{ position: 'relative', top: '0', right: '0' }}
          >×</button>
        </div>
      </div>
      
      {isLoading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading records...</p>
      ) : websites.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No websites saved in this category yet.</p>
      ) : (
        <>
          {/* Sub-Category Filter Pills */}
          {(() => {
            const uniqueSubs = Array.from(new Set(websites.map(w => w.subCategory).filter(Boolean)));
            if (uniqueSubs.length > 0) {
              const allTabs = ["All", ...uniqueSubs];
              return (
                <div className="custom-scrollbar" style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  {allTabs.map(sub => (
                    <button
                      key={sub}
                      onClick={() => setActiveSubCategory(sub)}
                      style={{
                        background: activeSubCategory === sub ? 'rgba(var(--primary-rgb), 0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${activeSubCategory === sub ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                        color: activeSubCategory === sub ? 'var(--primary)' : '#fff',
                        padding: '0.5rem 1.2rem',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                        fontWeight: activeSubCategory === sub ? 'bold' : 'normal'
                      }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              );
            }
            return null;
          })()}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem', paddingBottom: '4rem' }}>
            {websites.filter(site => activeSubCategory === "All" || site.subCategory === activeSubCategory).map(site => (
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
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#78716c' }}>
                  Saved on {new Date(site.createdAt).toLocaleDateString()}
                </div>
                {site.subCategory && activeSubCategory === "All" && (
                  <div style={{ 
                    fontSize: '0.75rem', 
                    background: 'rgba(var(--primary-rgb), 0.1)', 
                    color: 'var(--primary)', 
                    padding: '0.3rem 0.8rem', 
                    borderRadius: '12px',
                    border: '1px solid rgba(var(--primary-rgb), 0.2)',
                    fontWeight: '600'
                  }}>
                    {site.subCategory}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        </>
      )}
      </div>
    </div>
  );
};

export default CategoryModal;
