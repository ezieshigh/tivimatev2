
import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { Plan } from '../data/plans';

interface PlanCardProps {
  plan: Plan;
  onClick: (plan: Plan) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onClick }) => {
  // Helper to display a "From" price
  const getDisplayPrice = () => {
    if (plan.monthlyPrice) return `£${plan.monthlyPrice}`;
    if (plan.monthlyPriceStandardCountry) return `From £${plan.monthlyPriceStandardCountry}`;
    if (plan.yearlyPrice && !plan.monthlyPrice) return `£${plan.yearlyPrice}/yr`;
    return 'View Details';
  };

  return (
    <motion.div
      layoutId={`card-${plan.id}`}
      onClick={() => onClick(plan)}
      whileHover={{ y: -5, borderColor: 'rgba(255,255,255,0.3)' }}
      className="group relative cursor-pointer"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%'
      }}
    >
      {plan.badge && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          background: 'var(--accent-red)',
          color: 'white',
          fontSize: '0.7rem',
          fontWeight: 'bold',
          padding: '4px 12px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          zIndex: 2
        }}>
          {plan.badge.replace('-', ' ')}
        </div>
      )}

      <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <motion.h3 layoutId={`title-${plan.id}`} style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          {plan.name}
        </motion.h3>
        
        <motion.p layoutId={`tagline-${plan.id}`} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', minHeight: '40px' }}>
          {plan.tagline}
        </motion.p>

        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Starting at</span>
          <span style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold' }}>
            {getDisplayPrice()}
          </span>
          {plan.monthlyPrice || plan.monthlyPriceStandardCountry ? <span style={{ color: '#666' }}> / month</span> : null}
        </div>

        <ul style={{ listStyle: 'none', marginBottom: '2rem', flex: 1 }}>
          {plan.features.slice(0, 4).map((feat, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '0.8rem', color: '#ccc', fontSize: '0.9rem' }}>
              <Check size={16} color="var(--accent-red)" style={{ marginTop: '4px', flexShrink: 0 }} />
              {feat}
            </li>
          ))}
          {plan.features.length > 4 && (
            <li style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', paddingLeft: '26px' }}>+ more...</li>
          )}
        </ul>

        <motion.button
          whileHover={{ x: 5 }}
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          View Details <ChevronRight size={16} color="var(--accent-red)" />
        </motion.button>
      </div>
      
      {/* Decorative hover effect */}
      <div 
        className="absolute bottom-0 left-0 h-[2px] w-0 bg-[var(--accent-red)] transition-all duration-300 group-hover:w-full" 
      />
    </motion.div>
  );
};

export default PlanCard;
