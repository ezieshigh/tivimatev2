import React from 'react';
import { Wallet, Zap, ShieldCheck, Wrench } from 'lucide-react';

const WhyChooseUs: React.FC = () => {
  const features = [
    { 
      icon: <Wallet />, 
      title: 'Save Monthly', 
      desc: 'Cut the cord on expensive cable and multiple subscriptions. One setup, zero recurring headaches.' 
    },
    { 
      icon: <Zap />, 
      title: '20 Min Setup', 
      desc: 'Our streamlined installation process gets you up and running faster than a pizza delivery.' 
    },
    { 
      icon: <Wrench />, 
      title: 'Remote Support', 
      desc: 'Issues? We can diagnose and fix most problems remotely without stepping foot in your home.' 
    },
    { 
      icon: <ShieldCheck />, 
      title: 'Reliable Service', 
      desc: 'We offer maintenance packages from 1 to 5 years to ensure your streams stay stable.' 
    }
  ];

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Why TV PLUG?</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2rem',
          marginTop: '3rem'
        }}>
          {features.map((feature, idx) => (
            <div key={idx} style={{ 
              padding: '2rem', 
              backgroundColor: 'rgba(255,255,255,0.02)', 
              border: '1px solid rgba(255,255,255,0.05)',
              textAlign: 'center'
            }}>
              <div style={{ 
                display: 'inline-flex', 
                padding: '1rem', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255,26,26,0.1)', 
                color: 'var(--accent-red)',
                marginBottom: '1.5rem'
              }}>
                {React.cloneElement(feature.icon as React.ReactElement<any>, { size: 24 })}
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;