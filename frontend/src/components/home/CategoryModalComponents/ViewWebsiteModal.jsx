import { createPortal } from 'react-dom';
import { X, Edit2, Download } from 'lucide-react';
import EditWebsiteForm from './EditWebsiteForm';
import BASE_URL from '../../../config/api';

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

const ViewWebsiteModal = ({ 
  viewingSite, 
  setViewingSite,
  startEdit,
  downloadImage,
  isEditingView,
  setIsEditingView,
  editFormData,
  setEditFormData,
  handleEditImageChange,
  handleEditSubmit,
  isUpdating

}) => {
  if (!viewingSite) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(15px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
      onClick={() => setViewingSite(null)}
    >
      <div 
        style={{
          background: 'var(--bg-card)',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.1)',
          overflowY: 'auto',
          animation: 'slowZoomFade 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          position: 'relative'
        }}
        className="custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => {
            setViewingSite(null);
            setIsEditingView(false);
          }}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          <X size={20} />
        </button>

        <div style={{ padding: '3rem' }}>
          {isEditingView ? (
            <div style={{ marginBottom: '2rem' }}>
              <EditWebsiteForm 
                site={viewingSite}
                editFormData={editFormData}
                setEditFormData={setEditFormData}
                handleEditImageChange={handleEditImageChange}
                handleEditSubmit={handleEditSubmit}
                setEditingSiteId={() => setIsEditingView(false)}
                isUpdating={isUpdating}
              />
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem' }}>
                    {viewingSite.type !== 'website' && (
                      <span style={{ background: 'var(--primary)', color: '#000', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
                        {viewingSite.type.toUpperCase()}
                      </span>
                    )}
                    <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500' }}>
                      {viewingSite.category}
                    </span>
                  </div>
                  {viewingSite.subCategory && (
                    <span style={{ display: 'inline-block', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      {viewingSite.subCategory}
                    </span>
                  )}
                  <a href={viewingSite.url} target="_blank" rel="noopener noreferrer" style={{ 
                    color: 'var(--primary)', 
                    textDecoration: 'none', 
                    fontWeight: '700', 
                    fontSize: '1.6rem', 
                    wordBreak: 'break-all',
                    lineHeight: '1.4',
                    display: 'block'
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
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Edit2 size={16} />
                    Edit
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
            <div style={{ marginBottom: '2rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
              <img 
                src={viewingSite.imagePath.startsWith('http') ? viewingSite.imagePath : `${BASE_URL}${viewingSite.imagePath}`} 
                alt="Saved media" 
                style={{ width: '100%', objectFit: 'contain', background: '#000', display: 'block', maxHeight: '500px' }} 
              />
              <button 
                onClick={(e) => downloadImage(e, viewingSite.imagePath)}
                className="btn-primary"
                style={{ position: 'absolute', top: '10px', right: '10px', padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
              >
                <Download size={14} />
                Download
              </button>
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
      </div>
    </div>,
    document.body
  );
};

export default ViewWebsiteModal;
