import { useEffect, useRef } from 'react';

const EditWebsiteForm = ({
  site,
  editFormData,
  setEditFormData,
  handleEditImageChange,
  handleEditSubmit,
  setEditingSiteId,
  isUpdating
}) => {
  const formRef = useRef(null);

  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <form ref={formRef} onSubmit={(e) => handleEditSubmit(e, site._id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ color: 'var(--text-color)', margin: 0 }}>Edit Record</h4>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '500' }}>
          Update Image (Optional)
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
          <label className="btn btn-outline" style={{ cursor: 'pointer', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: 0, width: '100%', boxSizing: 'border-box', fontSize: '0.9rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            Upload New Image
            <input type="file" accept="image/*" onChange={handleEditImageChange} style={{ display: 'none' }} />
          </label>
          {editFormData.imagePreview && (
            <div style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }}>
              <img src={editFormData.imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
        <button 
          type="button" 
          onClick={() => setEditingSiteId(null)} 
          style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          Cancel Changes
        </button>
        <button type="submit" className="btn-primary" style={{ flex: 1, padding: '8px' }} disabled={isUpdating}>
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default EditWebsiteForm;
