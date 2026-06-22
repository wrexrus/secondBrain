import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div>
        <h2 style={{ fontFamily: 'Comfortaa, cursive', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Synapse</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your digital second brain.</p>
      </div>
      <div className="footer-links">
        <a href="#">Twitter</a>
        <a href="#">Discord</a>
        <a href="#">Privacy Policy</a>
      </div>
    </footer>
  );
};

export default Footer;
