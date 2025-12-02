import React from 'react';
import { motion } from 'framer-motion';

const HowItWorks: React.FC = () => {
  const steps = [
    { num: '01', title: 'Consultation', desc: 'Book a free chat. We check your device compatibility and internet speed.' },
    { num: '02', title: 'Install', desc: 'We remotely connect to your TV or ship you a pre-loaded device.' },
    { num: '03', title: 'Setup', desc: 'A technician guides you through the final activation (approx 20 mins).' },
    { num: '04', title: 'Enjoy', desc: 'Access unlimited content and global channels instantly.' }
  ];

  return (
    <section id="how-it-works" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <h2 className="section-title">How It Works</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '2rem', 
          marginTop: '4rem' 
        }}>
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              style={{ position: 'relative', padding: '1rem' }}
            >
              <span style={{ 
                fontSize: '4rem', 
                fontFamily: 'var(--font-heading)', 
                color: 'rgba(255,255,255,0.05)', 
                position: 'absolute', 
                top: '-2rem', 
                left: '0',
                zIndex: 0
              }}>
                {step.num}
              </span>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
