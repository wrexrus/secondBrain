import React, { useState } from 'react';

const TutorialSection = () => {
  const [expandedStep, setExpandedStep] = useState(null);

  const toggleStep = (step) => {
    if (expandedStep === step) {
      setExpandedStep(null);
    } else {
      setExpandedStep(step);
    }
  };

  return (
    <section className="section-container" style={{ background: 'rgba(0,0,0,0.2)' }}>
      <h2 className="section-title">How Synapse Works</h2>
      <div className="tutorial-grid">
        <div className="tutorial-steps">
          
          {/* STEP 1 */}
          <div 
            className="step-card" 
            onClick={() => toggleStep(1)}
            style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
          >
            <div className="step-number">01</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Install the Extension
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" style={{ transform: expandedStep === 1 ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </h3>
            
            {expandedStep !== 1 ? (
              <p style={{ color: 'var(--text-muted)' }}>Get the Synapse Chrome extension to start saving instantly from any tab.</p>
            ) : (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', animation: 'fadeIn 0.5s ease forwards' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                  <div style={{ background: 'rgba(var(--primary-rgb), 0.2)', color: 'var(--primary)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold', flexShrink: 0 }}>1</div>
                  <div>
                    <p style={{ color: 'var(--text-color)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Download and extract the zip file</p>
                    <a href="/synapse-extension.zip" download className="btn btn-outline" onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', padding: '0.3rem 0.8rem', fontSize: '0.8rem', textDecoration: 'none' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.4rem' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      Download Extension
                    </a>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                  <div style={{ background: 'rgba(var(--primary-rgb), 0.2)', color: 'var(--primary)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold', flexShrink: 0 }}>2</div>
                  <p style={{ color: 'var(--text-color)', fontSize: '0.95rem' }}>Open <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>chrome://extensions</code> and turn on <b>Developer mode</b>.</p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                  <div style={{ background: 'rgba(var(--primary-rgb), 0.2)', color: 'var(--primary)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold', flexShrink: 0 }}>3</div>
                  <p style={{ color: 'var(--text-color)', fontSize: '0.95rem' }}>Click <b>"Load unpacked"</b> and select the extracted folder.</p>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2 */}
          <div 
            className="step-card"
            onClick={() => toggleStep(2)}
            style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
          >
            <div className="step-number">02</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Save & Tag
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" style={{ transform: expandedStep === 2 ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </h3>

            {expandedStep !== 2 ? (
              <p style={{ color: 'var(--text-muted)' }}>Click the extension, choose an intelligent category, and hit save. It's that fast.</p>
            ) : (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', animation: 'fadeIn 0.5s ease forwards' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                  <div style={{ background: 'rgba(var(--secondary-rgb), 0.2)', color: 'var(--secondary)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold', flexShrink: 0 }}>✓</div>
                  <p style={{ color: 'var(--text-color)', fontSize: '0.95rem' }}><b>Manually store categories</b> and links directly through the web app dashboard.</p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                  <div style={{ background: 'rgba(var(--primary-rgb), 0.2)', color: 'var(--primary)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold', flexShrink: 0 }}>✓</div>
                  <p style={{ color: 'var(--text-color)', fontSize: '0.95rem' }}><b>Or use the extension</b> to automatically capture and organize tabs without leaving your page.</p>
                </div>
              </div>
            )}
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
