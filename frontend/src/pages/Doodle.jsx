import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';

export default function Doodle() {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 1000
      }}>
        <button 
          onClick={() => navigate('/')}
          className="btn btn-outline"
          style={{ 
            background: 'var(--surface-color)', 
            padding: '0.5rem 1rem',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            marginTop: '24px'
          }}
        >
          ← Back to Synapse Core
        </button>
      </div>
      
      <div style={{ flex: 1 }}>
        {/* tldraw provides out of the box drawing, text, images, eraser, clear, etc. */}
        <Tldraw />
      </div>
    </div>
  );
}
