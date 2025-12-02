import React from 'react';
import { motion } from 'framer-motion';

const GlobalTVSection: React.FC = () => {
  const countries = ['UK', 'USA', 'FRA', 'DEU', 'ESP', 'ITA', 'TUR', 'POL', 'NLD', 'PRT', 'BRA', 'IND'];

  return (
    <section id="global-tv" className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          
          <div>
            <span style={{ color: 'var(--accent-red)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem' }}>
              Global Access
            </span>
            <h2 style={{ fontSize: '3rem', marginTop: '0.5rem' }}>Your Home Channels. Wherever You Live.</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
              Miss the news from back home? Want to watch your local football league? Our IPTV-style service brings you live television from over 25 countries.
            </p>
            
            <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', listStyle: 'none' }}>
              {['25+ Countries', 'Premium Sports', 'Live News', 'Movies on Demand', 'Multi-language EPG', '4K Quality'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--accent-red)' }}>•</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Decorative Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '1rem', 
            opacity: 0.5 
          }}>
            {countries.map((code, i) => (
              <motion.div
                key={code}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                style={{ 
                  aspectRatio: '1', 
                  backgroundColor: '#1a1a1a', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  color: '#555'
                }}
              >
                {code}
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default GlobalTVSection;
