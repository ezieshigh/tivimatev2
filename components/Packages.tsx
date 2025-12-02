import React from 'react';
import { Check } from 'lucide-react';

const PackageCard: React.FC<{
  title: string;
  price: string;
  features: string[];
  isPopular?: boolean;
}> = ({ title, price, features, isPopular }) => {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ 
      position: 'relative',
      padding: '2.5rem', 
      backgroundColor: 'var(--bg-card)', 
      border: isPopular ? '1px solid var(--accent-red)' : '1px solid var(--border-color)',
      display: 'flex', 
      flexDirection: 'column'
    }}>
      {isPopular && (
        <span style={{ 
          position: 'absolute', 
          top: '-12px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          backgroundColor: 'var(--accent-red)', 
          color: 'white', 
          padding: '4px 12px', 
          fontSize: '0.75rem', 
          fontWeight: 'bold',
          letterSpacing: '1px'
        }}>
          MOST POPULAR
        </span>
      )}
      <h3 style={{ fontSize: '1.5rem', textAlign: 'center' }}>{title}</h3>
      <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
        <span style={{ fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)' }}>{price}</span>
      </div>
      <ul style={{ listStyle: 'none', marginBottom: '2rem', flex: 1 }}>
        {features.map((feat, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '1rem', color: '#ccc', fontSize: '0.9rem' }}>
            <Check size={16} color="var(--accent-red)" style={{ marginTop: '4px', flexShrink: 0 }} />
            {feat}
          </li>
        ))}
      </ul>
      <button 
        onClick={scrollToContact}
        className={isPopular ? 'btn btn-primary' : 'btn btn-secondary'} 
        style={{ width: '100%' }}
      >
        Book Consultation
      </button>
    </div>
  );
};

const Packages: React.FC = () => {
  return (
    <section id="packages" className="section">
      <div className="container">
        
        {/* Streaming Plans */}
        <div style={{ marginBottom: '6rem' }}>
          <h2 className="section-title">Streaming Hub Plans</h2>
          <p className="section-subtitle">Unlock unlimited entertainment.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <PackageCard 
              title="Remote Setup" 
              price="£XX" 
              features={[
                "Remote installation",
                "Uses your Fire Stick/TV",
                "Full App Suite",
                "1 Year Support"
              ]} 
            />
            <PackageCard 
              title="Device Shipped" 
              price="£XX" 
              features={[
                "Includes 4K Fire Stick",
                "Pre-configured",
                "Plug & Play",
                "1 Year Support"
              ]} 
              isPopular 
            />
            <PackageCard 
              title="Lifetime" 
              price="£XX" 
              features={[
                "Includes 4K Fire Stick",
                "Priority Installation",
                "5 Years Support",
                "Remote Fix Guarantee"
              ]} 
            />
          </div>
        </div>

        {/* Global TV Plans */}
        <div>
          <h2 className="section-title">Global TV Plans</h2>
          <p className="section-subtitle">Live channels from home.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <PackageCard 
              title="Standard" 
              price="£XX/mo" 
              features={[
                "1 Country Choice",
                "Basic Channels",
                "SD/HD Quality",
                "1 Device"
              ]} 
            />
            <PackageCard 
              title="Premium" 
              price="£XX/mo" 
              features={[
                "All 25+ Countries",
                "Sports & Movies Packages",
                "Full HD / 4K",
                "2 Devices"
              ]} 
              isPopular 
            />
            <PackageCard 
              title="Family" 
              price="£XX/mo" 
              features={[
                "All Countries + VOD",
                "All Premium Channels",
                "4K Priority",
                "4 Devices"
              ]} 
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default Packages;
