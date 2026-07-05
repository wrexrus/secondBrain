const DeleteConfirmModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  categoryName 
}) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
      borderRadius: '24px'
    }}>
      <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)', maxWidth: '400px', textAlign: 'center' }}>
        <h3 style={{ color: '#ef4444',marginBottom: '1rem', fontSize: '1.5rem', fontFamily: 'Comfortaa, cursive' }}>Delete Category?</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.5' }}>
          Are you sure you want to permanently delete the entire <strong>"{categoryName}"</strong> category and all its contents? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center'}}>
          <button onClick={onClose} className="btn-outline" style={{ padding: '5px', borderRadius: '10px' }}>Cancel</button>
          <button onClick={onConfirm} className="btn-primary" style={{ background: '#ef4444',padding: '5px', borderRadius: '10px' }}>Yes, Delete All</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
