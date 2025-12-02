import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Wifi, Monitor } from 'lucide-react';

const StreamingSection: React.FC = () => {
  return (
    <section id="streaming" className="section">
      <div className="container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: 'var(--accent-red)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem' }}>
              The Aggregator
            </span>
            <h2 style={{ fontSize: '3rem', marginTop: '0.5rem' }}>All Your Streaming. One Hub.</h2>
            <p style={{ maxWidth: '700px', margin: '1rem auto', color: 'var(--text-secondary)' }}>
              Stop paying for 10 different subscriptions. Our custom software aggregates content from all major platforms plus the latest cinema releases into a single, beautiful interface.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            marginTop: '2rem'
          }}>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              style={{ borderLeft: '2px solid var(--accent-red)', paddingLeft: '2rem' }}
            >
              <h3 style={{ fontSize: '1.5rem' }}>Option A: Remote Install</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Already have a Fire Stick or Android TV? We connect remotely and install our software suite in about 20 minutes. No shipping required.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              style={{ borderLeft: '2px solid white', paddingLeft: '2rem' }}
            >
              <h3 style={{ fontSize: '1.5rem' }}>Option B: Pre-Loaded Device</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Don't have a device? We ship a brand new 4K Fire Stick, pre-configured and ready to plug and play. Just connect to WiFi.
              </p>
            </motion.div>
          </div>

          {/* Mini Timeline */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginTop: '3rem', borderTop: '1px solid #222', paddingTop: '3rem' }}>
             {[
               { icon: <Monitor />, title: 'Choose Plan', desc: 'Select your package' },
               { icon: <Wifi />, title: 'Connect', desc: 'Remote or Shipped' },
               { icon: <PlayCircle />, title: 'Watch', desc: 'Unlimited Content' }
             ].map((item, index) => (
               <div key={index} style={{ flex: 1, minWidth: '200px', textAlign: 'center' }}>
                  <div style={{ color: index === 1 ? 'var(--accent-red)' : 'white', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                    {React.cloneElement(item.icon as React.ReactElement<any>, { size: 32 })}
                  </div>
                  <h4 style={{ fontSize: '1.2rem' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.9rem', color: '#777' }}>{item.desc}</p>
               </div>
             ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default StreamingSection;