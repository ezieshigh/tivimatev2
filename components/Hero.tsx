
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const Hero: React.FC = () => {
  const scrollTo = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="hero" 
      style={{ 
        position: 'relative', 
        height: '100vh', 
        minHeight: '600px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'transparent'
      }}
    >

      <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 style={{ 
            fontSize: 'clamp(3.5rem, 8vw, 7rem)', 
            lineHeight: 0.9, 
            marginBottom: '1.5rem',
            letterSpacing: '-0.04em',
            fontWeight: 800
          }}>
            STREAM EVERYTHING.<br />
            <span className="text-accent">WATCH FROM ANYWHERE.</span>
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(1rem, 2vw, 1.25rem)', 
            color: 'var(--text-secondary)', 
            maxWidth: '600px', 
            margin: '0 auto 2.5rem auto',
            fontWeight: 300
          }}>
            The ultimate cinematic hub for global TV and premium streaming. 
            Remote installation in 20 minutes on your existing devices.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => scrollTo('#plans')} className="btn btn-primary">
              Get Started
            </button>
            <button onClick={() => scrollTo('#plans')} className="btn btn-secondary">
              View Packages
            </button>
          </div>

          <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#555', letterSpacing: '2px', fontWeight: 600, textTransform: 'uppercase' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--accent-red)', borderRadius: '50%', marginRight: '8px' }}></span>
            Serving viewers across the UK & Europe
          </p>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', opacity: 0.5 }}
      >
        <ChevronRight style={{ transform: 'rotate(90deg)' }} />
      </motion.div>
    </section>
  );
};

export default Hero;