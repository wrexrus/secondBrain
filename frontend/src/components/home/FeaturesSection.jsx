import React from 'react';
import { CloudLightning,Brain,Tags} from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section className="section-container">
      <h2 className="section-title">Why use Synapse?</h2>
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon"><CloudLightning size={60} /></div>
          <h3 className="feature-title">Lightning Fast</h3>
          <p style={{ color: 'var(--text-muted)' }}>Save websites in less than a second without ever switching tabs.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><Brain size={60} /></div>
          <h3 className="feature-title">Visual Knowledge</h3>
          <p style={{ color: 'var(--text-muted)' }}>Stop reading boring lists. Experience your saved data as an interactive neural network.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><Tags size={60} /></div>
          <h3 className="feature-title">Smart Tags</h3>
          <p style={{ color: 'var(--text-muted)' }}>Intelligent autocomplete ensures you never misplace or duplicate a category again.</p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
