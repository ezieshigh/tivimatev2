import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{ backgroundColor: '#000', padding: '3rem 0', borderTop: '1px solid #222' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>TV PLUG</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Cinematic Streaming & Global TV Solutions. Designed for the world.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.8rem', color: '#555' }}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <span>© {new Date().getFullYear()} TV PLUG</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
