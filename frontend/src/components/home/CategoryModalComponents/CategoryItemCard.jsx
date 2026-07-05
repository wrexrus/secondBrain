import EditWebsiteForm from './EditWebsiteForm';
import { Trash2, Play } from 'lucide-react';

const extractYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?/\s]{11})/i);
  return match ? match[1] : null;
};

const extractInstagramId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:instagram\.com\/reel\/|instagram\.com\/p\/|instagram\.com\/tv\/)([a-zA-Z0-9_-]+)/i);
  return match ? match[1] : null;
};

const CategoryItemCard = ({
  site,
  activeSubCategory,
  editingSiteId,
  editFormData,
  setEditFormData,
  handleEditImageChange,
  handleEditSubmit,
  setEditingSiteId,
  isUpdating,
  handleDeleteWebsite,
  setViewingSite,
  startEdit,
  setIsEditingView
}) => {
  if (editingSiteId === site._id) {
    return (
      <div className="card-item">
        <EditWebsiteForm 
          site={site}
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          handleEditImageChange={handleEditImageChange}
          handleEditSubmit={handleEditSubmit}
          setEditingSiteId={setEditingSiteId}
          isUpdating={isUpdating}
        />
      </div>
    );
  }

  return (
    <div className="card-item">
      <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {site.type !== 'website' && (
              <span style={{ background: 'var(--primary)', color: '#000', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700' }}>
                {site.type.toUpperCase()}
              </span>
            )}
            {site.subCategory && activeSubCategory === "All" && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                {site.subCategory}
              </span>
            )}
          </div>
          
          <div className="card-actions">
            <button 
              onClick={() => handleDeleteWebsite(site._id)}
              className="btn-icon-danger"
              title="Delete Record"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {site.url && (
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
        )}

        {site.type === 'video' && extractYouTubeId(site.url) && (
          <div style={{ marginTop: '0.5rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative' }} onClick={() => setViewingSite(site)}>
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
                <Play fill="#fff" stroke="none" size={24} style={{ marginLeft: '4px' }} />
              </div>
            </div>
          </div>
        )}

        {site.type === 'video' && !extractYouTubeId(site.url) && extractInstagramId(site.url) && (
          <div 
            onClick={() => setViewingSite(site)}
            style={{ 
              marginTop: '0.5rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <div className="play-btn" style={{
              width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.2s ease', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </div>
          </div>
        )}

        {site.imagePath && (
          <div style={{ marginTop: '0.5rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', cursor: 'zoom-in', position: 'relative' }} onClick={() => setViewingSite(site)}>
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
            WebkitBoxOrient: 'vertical',
            margin: 0
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
              onClick={() => {
                startEdit(site);
                setIsEditingView(false); // standard edit mode
              }}
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
            <div style={{ fontSize: '0.75rem', color: '#78716c' }}>
              {new Date(site.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryItemCard;
