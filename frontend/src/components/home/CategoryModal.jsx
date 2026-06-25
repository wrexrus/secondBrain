import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const extractYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return match ? match[1] : null;
};

const extractInstagramId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:instagram\.com\/reel\/|instagram\.com\/p\/|instagram\.com\/tv\/)([a-zA-Z0-9_-]+)/i);
  return match ? match[1] : null;
};

const CategoryModal = ({
  selectedCategory,
  isLoading,
  websites,
  activeSubCategory,
  setActiveSubCategory,
  handleDeleteWebsite,
  handleUpdateWebsite,
  closeExpansion,
  setNewWebsite,
  setIsCreatingCategory
}) => {
  const [expandedImage, setExpandedImage] = useState(null);
  const [editingSiteId, setEditingSiteId] = useState(null);
  const [viewingSite, setViewingSite] = useState(null);
  const [isEditingView, setIsEditingView] = useState(false);
  const [editFormData, setEditFormData] = useState({ url: '', content: '', category: '', subCategory: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const startEdit = (site) => {
    setEditingSiteId(site._id);
    setEditFormData({
      url: site.url || '',
      content: site.content || '',
      category: site.category || '',
      subCategory: site.subCategory || ''
    });
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    setIsUpdating(true);
    const success = await handleUpdateWebsite(id, editFormData);
    if (success) {
      if (isEditingView && viewingSite && viewingSite._id === id) {
        setViewingSite({ ...viewingSite, ...editFormData });
        setIsEditingView(false);
      }
      setEditingSiteId(null);
    }
    setIsUpdating(false);
  };

  const downloadImage = async (e, imagePath) => {
    e.stopPropagation();
    try {
      const response = await fetch(`http://localhost:5000${imagePath}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `synapse_image_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed', error);
      alert('Failed to download image.');
    }
  };

  return (
    <div className="expansion-view custom-scrollbar glass-panel" style={{ 
      position: 'fixed', 
      top: '2%', 
      left: '2%', 
      right: '2%',
      bottom: '2%',
      animation: 'slowZoomFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards', 
      padding: '3rem 2rem', 
      zIndex: 100,
      overflowY: (expandedImage || viewingSite) ? 'hidden' : 'auto',
      overflowX: 'hidden'
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
            className="btn-primary-outline"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New SubCategory
          </button>
          <button 
            onClick={closeExpansion} 
            className="btn-icon-danger"
            style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <div className="loader"></div>
        </div>
      ) : (
        <>
          {(() => {
            const subs = new Set();
            websites.forEach(s => { if (s.subCategory) subs.add(s.subCategory) });
            const subsArray = Array.from(subs);
            if (subsArray.length > 0) {
              return (
                <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <button
                    onClick={() => setActiveSubCategory("All")}
                    style={{
                      padding: '0.5rem 1.2rem',
                      borderRadius: '20px',
                      background: activeSubCategory === "All" ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      color: activeSubCategory === "All" ? '#000' : 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                      fontWeight: activeSubCategory === "All" ? 'bold' : 'normal'
                    }}
                  >
                    All
                  </button>
                  {subsArray.map(sub => (
                    <button
                      key={sub}
                      onClick={() => setActiveSubCategory(sub)}
                      style={{
                        padding: '0.5rem 1.2rem',
                        borderRadius: '20px',
                        background: activeSubCategory === sub ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: activeSubCategory === sub ? '#000' : 'var(--text-muted)',
                        border: 'none',
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
              <div 
                key={site._id} 
                className="card-item"
              >
                {editingSiteId === site._id ? (
                  <form onSubmit={(e) => handleEditSubmit(e, site._id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ color: 'var(--text-color)', margin: 0 }}>Edit Record</h4>
                      <button type="button" onClick={() => setEditingSiteId(null)} className="btn-icon-danger">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                    
                    <input 
                      type="text" 
                      value={editFormData.category} 
                      onChange={(e) => setEditFormData({...editFormData, category: e.target.value})} 
                      placeholder="Category"
                      className="feedback-input" 
                    />
                    
                    <input 
                      type="text" 
                      value={editFormData.subCategory} 
                      onChange={(e) => setEditFormData({...editFormData, subCategory: e.target.value})} 
                      placeholder="Sub-Category (Optional)"
                      className="feedback-input" 
                    />
                    
                    <input 
                      type="url" 
                      value={editFormData.url} 
                      onChange={(e) => setEditFormData({...editFormData, url: e.target.value})} 
                      placeholder="URL (Optional, https://...)"
                      className="feedback-input" 
                    />

                    <textarea 
                      value={editFormData.content} 
                      onChange={(e) => setEditFormData({...editFormData, content: e.target.value})} 
                      placeholder="Content (Optional)"
                      className="feedback-input" 
                      style={{ resize: 'vertical' }}
                      rows="3"
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                      <button type="button" onClick={() => setEditingSiteId(null)} className="btn" style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                        Cancel
                      </button>
                      <button type="submit" disabled={isUpdating} className="btn-primary-outline">
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
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
                        className="btn-icon-danger"
                        title="Delete"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                    
                    {site.imagePath && (
                      <div 
                        style={{ marginTop: '0.5rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', cursor: 'zoom-in', position: 'relative' }}
                        onClick={() => setExpandedImage(site.imagePath)}
                        onMouseEnter={(e) => {
                          const overlay = e.currentTarget.querySelector('.img-overlay');
                          if (overlay) overlay.style.opacity = '1';
                          const img = e.currentTarget.querySelector('img');
                          if (img) img.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                          const overlay = e.currentTarget.querySelector('.img-overlay');
                          if (overlay) overlay.style.opacity = '0';
                          const img = e.currentTarget.querySelector('img');
                          if (img) img.style.transform = 'scale(1)';
                        }}
                      >
                        <img 
                          src={`http://localhost:5000${site.imagePath}`} 
                          alt="Saved media" 
                          style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', background: '#000', display: 'block', transition: 'transform 0.4s ease' }} 
                        />
                        <div className="img-overlay" style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          background: 'rgba(0,0,0,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: 0, transition: 'opacity 0.2s ease',
                          pointerEvents: 'none'
                        }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                        </div>
                      </div>
                    )}

                    {site.type === 'video' && extractYouTubeId(site.url) && (
                      <div 
                        style={{ marginTop: '0.5rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative' }}
                        onClick={() => setViewingSite(site)}
                        onMouseEnter={(e) => {
                          const overlay = e.currentTarget.querySelector('.vid-overlay');
                          if (overlay) overlay.style.background = 'rgba(0,0,0,0.2)';
                          const playBtn = e.currentTarget.querySelector('.play-btn');
                          if (playBtn) playBtn.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          const overlay = e.currentTarget.querySelector('.vid-overlay');
                          if (overlay) overlay.style.background = 'rgba(0,0,0,0.4)';
                          const playBtn = e.currentTarget.querySelector('.play-btn');
                          if (playBtn) playBtn.style.transform = 'scale(1)';
                        }}
                      >
                        <img 
                          src={`https://img.youtube.com/vi/${extractYouTubeId(site.url)}/maxresdefault.jpg`} 
                          onError={(e) => {
                            if (e.target.src.includes('maxresdefault.jpg')) {
                              e.target.src = `https://img.youtube.com/vi/${extractYouTubeId(site.url)}/hqdefault.jpg`;
                            }
                          }}
                          alt="Video thumbnail" 
                          style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', background: '#000', display: 'block' }} 
                        />
                        <div className="vid-overlay" style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          background: 'rgba(0,0,0,0.4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background 0.2s ease'
                        }}>
                          <div className="play-btn" style={{
                            width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,0,0,0.8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'transform 0.2s ease', boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                          }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {site.type === 'video' && !extractYouTubeId(site.url) && extractInstagramId(site.url) && (
                      <div 
                        style={{ marginTop: '0.5rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => setViewingSite(site)}
                        onMouseEnter={(e) => {
                          const playBtn = e.currentTarget.querySelector('.play-btn');
                          if (playBtn) playBtn.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          const playBtn = e.currentTarget.querySelector('.play-btn');
                          if (playBtn) playBtn.style.transform = 'scale(1)';
                        }}
                      >
                        <div className="play-btn" style={{
                          width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'transform 0.2s ease', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                        }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        </div>
                      </div>
                    )}

                    {site.content && (
                      <p style={{ 
                        color: 'var(--text-color)', 
                        fontSize: '0.95rem',
                        background: 'rgba(0,0,0,0.2)',
                        padding: '1rem',
                        borderRadius: '8px',
                        borderLeft: '3px solid var(--secondary)',
                        maxHeight: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {site.content}
                      </p>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <button 
                          onClick={() => setViewingSite(site)}
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'white',
                            padding: '0.4rem 1rem',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                          View
                        </button>
                        <button 
                          onClick={() => startEdit(site)}
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(var(--primary-rgb), 0.5)',
                            color: 'var(--primary)',
                            padding: '0.4rem 1rem',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(var(--primary-rgb), 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          Edit
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
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
                        <div style={{ fontSize: '0.75rem', color: '#78716c' }}>
                          {new Date(site.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      </div>

      {/* LIGHTBOX OVERLAY */}
      {expandedImage && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(15px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setExpandedImage(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img 
              src={`http://localhost:5000${expandedImage}`} 
              alt="Expanded media" 
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} 
              onClick={(e) => e.stopPropagation()}
            />
            
            <button 
              onClick={(e) => downloadImage(e, expandedImage)}
              style={{
                position: 'absolute',
                bottom: '-50px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background 0.2s ease',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download
            </button>

            <button 
              onClick={() => setExpandedImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                padding: '0.5rem',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* VIEWING MODAL OVERLAY */}
      {viewingSite && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(15px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => { setViewingSite(null); setIsEditingView(false); setEditingSiteId(null); }}
        >
          <div 
            className="glass-panel custom-scrollbar" 
            style={{ 
              position: 'relative', 
              width: '90vw', 
              maxWidth: '800px', 
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '3rem',
              cursor: 'default' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {isEditingView ? (
              <form onSubmit={(e) => handleEditSubmit(e, viewingSite._id)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <input 
                  type="text" 
                  value={editFormData.subCategory} 
                  onChange={(e) => setEditFormData({...editFormData, subCategory: e.target.value})} 
                  placeholder="Sub-Category (Optional)"
                  className="feedback-input" 
                  style={{ fontSize: '1.2rem', padding: '1rem' }}
                />
                
                <input 
                  type="url" 
                  value={editFormData.url} 
                  onChange={(e) => setEditFormData({...editFormData, url: e.target.value})} 
                  placeholder="URL (Optional, https://...)"
                  className="feedback-input" 
                  style={{ fontSize: '1.2rem', padding: '1rem' }}
                />

                <textarea 
                  value={editFormData.content} 
                  onChange={(e) => setEditFormData({...editFormData, content: e.target.value})} 
                  placeholder="Content (Optional)"
                  className="feedback-input" 
                  style={{ resize: 'vertical', fontSize: '1.2rem', padding: '1rem' }}
                  rows="6"
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => { setIsEditingView(false); setEditingSiteId(null); }} className="btn" style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                    Cancel Edit
                  </button>
                  <button type="submit" disabled={isUpdating} className="btn-primary-outline" style={{ padding: '0.8rem 2rem' }}>
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {viewingSite.subCategory && (
                      <span style={{ 
                        fontSize: '0.8rem', 
                        background: 'rgba(var(--primary-rgb), 0.1)', 
                        color: 'var(--primary)', 
                        padding: '0.3rem 0.8rem', 
                        borderRadius: '12px',
                        border: '1px solid rgba(var(--primary-rgb), 0.2)',
                        fontWeight: '600',
                        width: 'fit-content'
                      }}>
                        {viewingSite.subCategory}
                      </span>
                    )}
                    <a href={viewingSite.url} target="_blank" rel="noopener noreferrer" style={{ 
                      color: 'var(--primary)', 
                      textDecoration: 'none', 
                      fontWeight: '700', 
                      fontSize: '1.6rem', 
                      wordBreak: 'break-all',
                      lineHeight: '1.4'
                    }}>
                      {viewingSite.url}
                    </a>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      onClick={() => {
                        startEdit(viewingSite);
                        setIsEditingView(true);
                      }}
                      className="btn-primary-outline"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      Edit
                    </button>
                    <button 
                      onClick={() => { setViewingSite(null); setIsEditingView(false); setEditingSiteId(null); }}
                      className="btn-icon-danger"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                </div>

                {viewingSite.type === 'video' && extractYouTubeId(viewingSite.url) && (
                  <div style={{ marginBottom: '2rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', aspectRatio: '16/9' }}>
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${extractYouTubeId(viewingSite.url)}?autoplay=1`} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      style={{ display: 'block' }}
                    ></iframe>
                  </div>
                )}

                {viewingSite.type === 'video' && !extractYouTubeId(viewingSite.url) && extractInstagramId(viewingSite.url) && (
                  <div style={{ 
                    marginBottom: '2rem', 
                    borderRadius: '16px', 
                    overflow: 'hidden', 
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', 
                    padding: '3rem 2rem',
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1.5rem',
                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)'
                  }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', textAlign: 'center' }}>
                      Instagram restricts embedding Reels directly.<br/>
                      Click below to watch it on the official app.
                    </div>
                    <a 
                      href={viewingSite.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        color: '#fff',
                        textDecoration: 'none',
                        padding: '0.8rem 2rem',
                        borderRadius: '30px',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        border: '1px solid rgba(255,255,255,0.3)',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Watch on Instagram
                    </a>
                  </div>
                )}

                {viewingSite.imagePath && (
                  <div style={{ marginBottom: '2rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img 
                      src={`http://localhost:5000${viewingSite.imagePath}`} 
                      alt="Saved media" 
                      style={{ width: '100%', objectFit: 'contain', background: '#000', display: 'block', maxHeight: '500px' }} 
                    />
                  </div>
                )}

                {viewingSite.content && (
                  <div style={{ 
                    color: 'var(--text-color)', 
                    fontSize: '1.1rem',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '2rem',
                    borderRadius: '16px',
                    borderLeft: '4px solid var(--secondary)',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {viewingSite.content}
                  </div>
                )}
                
                <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#78716c', textAlign: 'right' }}>
                  Saved on {new Date(viewingSite.createdAt).toLocaleDateString()} at {new Date(viewingSite.createdAt).toLocaleTimeString()}
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CategoryModal;
