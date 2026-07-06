import React, { useEffect } from 'react';

const CreateLinkModal = ({
  setIsCreatingCategory,
  newWebsite,
  setNewWebsite,
  handleCreateSubmit,
  isLoading,
  selectedCategory,
  handleCategoryInputChange,
  websiteSuggestions,
  setWebsiteSuggestions,
  handleSubCategoryInputChange,
  subCategorySuggestions,
  setSubCategorySuggestions,
  imagePreview,
  setImagePreview,
  setImageBase64
}) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setImageBase64(null);
    }
  };
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(10px)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div className="expansion-view glass-panel" style={{ 
        position: 'relative', 
        animation: 'fadeIn 0.3s ease-out', 
        width: '90vw', 
        maxWidth: '500px', 
        padding: '2.5rem'
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <h2 style={{ color: 'var(--text-color)', fontSize: '1.8rem', fontFamily: 'Comfortaa, cursive', fontWeight: '700' }}>
          New Category 
        </h2>
        <button 
          className="modal-close" 
          onClick={() => {
            setIsCreatingCategory(false);
            setNewWebsite({ category: '', subCategory: '', url: '', content: '' });
            setImagePreview(null);
            setImageBase64(null);
          }}
          style={{ position: 'relative', top: '0', right: '0' }}
        >×</button>
      </div>
      
      <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ position: 'relative', zIndex: 20 }}>
          <input 
            type="text" 
            placeholder="Category Name" 
            className="feedback-input" 
            style={{ width: '100%', boxSizing: 'border-box' }}
            value={newWebsite.category}
            onChange={handleCategoryInputChange}
            disabled={!!selectedCategory}
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
              zIndex: 100
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

        <div style={{ position: 'relative', zIndex: 10 }}>
          <input 
            type="text" 
            placeholder="Sub-Category (Optional)" 
            className="feedback-input" 
            style={{ width: '100%', boxSizing: 'border-box' }}
            value={newWebsite.subCategory}
            onChange={handleSubCategoryInputChange}
          />
          {subCategorySuggestions.length > 0 && (
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
              {subCategorySuggestions.map((sug, idx) => (
                <div 
                  key={idx}
                  style={{ padding: '0.8rem 1rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  onClick={() => {
                    setNewWebsite({ ...newWebsite, subCategory: sug });
                    setSubCategorySuggestions([]);
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>
            Attach Image (Optional)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
            <label className="btn btn-outline" style={{ cursor: 'pointer', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: 0, width: '100%', boxSizing: 'border-box' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              Upload Image
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
            {imagePreview && (
              <div style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  type="button"
                  onClick={() => { setImagePreview(null); setImageBase64(null); }}
                  style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', cursor: 'pointer', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Record'}
        </button>
      </form>
      </div>
    </div>
  );
};

export default CreateLinkModal;
