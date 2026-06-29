import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div>
        <h2 style={{ fontFamily: 'Comfortaa, cursive', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Synapse</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your digital second brain.</p>
      </div>
      <div className="footer-links">
        <a target='_blank' href="https://www.linkedin.com/in/rushabhmw/">LinkedIn</a>
        <a target='_blank' href="mailto:rushabhwagh125@gmail.com">Mail</a>
        <a href="#">Go to Top</a>
      </div>
    </footer>
  );
};

export default Footer;
