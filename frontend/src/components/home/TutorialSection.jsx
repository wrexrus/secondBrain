import React from 'react';

const TutorialSection = () => {
  return (
    <section className="section-container" style={{ background: 'rgba(0,0,0,0.2)' }}>
      <h2 className="section-title">How Synapse Works</h2>
      <div className="tutorial-grid">
        <div className="tutorial-steps">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Install the Extension</h3>
            <p style={{ color: 'var(--text-muted)' }}>Get the Synapse Chrome extension to start saving instantly from any tab.</p>
          </div>
          <div className="step-card">
            <div className="step-number">02</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Save & Tag</h3>
            <p style={{ color: 'var(--text-muted)' }}>Click the extension, choose an intelligent category, and hit save. It's that fast.</p>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Watch it Grow</h3>
            <p style={{ color: 'var(--text-muted)' }}>Open your dashboard and watch your glowing brain expand with your knowledge.</p>
          </div>
        </div>
        <div className="tutorial-video">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--primary)', opacity: 0.5 }}>
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default TutorialSection;
