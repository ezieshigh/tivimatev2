
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PLANS, Plan, PlanCategory } from '../data/plans';
import PlanCard from './PlanCard';
import PlanModal from './PlanModal';
import { CartItem } from '../types';

interface PlansSectionProps {
  addToCart: (item: CartItem) => void;
}

const PlansSection: React.FC<PlansSectionProps> = ({ addToCart }) => {
  const [activeCategory, setActiveCategory] = useState<PlanCategory>('streaming');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const categories: { id: PlanCategory; label: string }[] = [
    { id: 'streaming', label: 'Streaming Hub' },
    { id: 'tv', label: 'Global TV' },
    { id: 'bundle', label: 'Bundles' },
  ];

  const filteredPlans = PLANS.filter(p => p.category === activeCategory);

  return (
    <section id="plans" className="section" style={{ minHeight: '80vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Animation */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {/* Base Dark Gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, #0f0505 0%, #000000 100%)' }} />
        
        {/* Primary Animated Red Glow */}
        <motion.div
          animate={{
            opacity: [0.15, 0.25, 0.15],
            scale: [1, 1.2, 1],
            x: ['-10%', '10%', '-10%'],
            y: ['-5%', '5%', '-5%'],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: '10%',
            left: '20%',
            width: '60vw',
            height: '60vw',
            background: 'radial-gradient(circle, rgba(255, 26, 26, 0.15) 0%, transparent 60%)',
            filter: 'blur(80px)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />

        {/* Secondary Subtle Glow */}
        <motion.div
          animate={{
            opacity: [0.1, 0.2, 0.1],
            scale: [1.1, 0.9, 1.1],
            x: ['5%', '-5%', '5%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          style={{
            position: 'absolute',
            bottom: '0%',
            right: '10%',
            width: '50vw',
            height: '50vw',
            background: 'radial-gradient(circle, rgba(100, 20, 20, 0.1) 0%, transparent 60%)',
            filter: 'blur(100px)',
            borderRadius: '50%',
            transform: 'translate(50%, 50%)'
          }}
        />

        {/* Tech Grid Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
          opacity: 0.4
        }} />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <h2 className="section-title">Packages & Pricing</h2>
        <p className="section-subtitle">Flexible plans designed for high-end viewing.</p>

        {/* Category Filter */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '10px 24px',
                borderRadius: '30px',
                border: activeCategory === cat.id ? '1px solid var(--accent-red)' : '1px solid #333',
                backgroundColor: activeCategory === cat.id ? 'var(--accent-red)' : 'transparent',
                color: 'white',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.3s',
                boxShadow: activeCategory === cat.id ? '0 0 15px rgba(255, 26, 26, 0.4)' : 'none'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Plans Grid */}
        <motion.div 
          layout
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '2rem' 
          }}
        >
          <AnimatePresence mode="popLayout">
            {filteredPlans.map(plan => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                onClick={setSelectedPlan} 
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <PlanModal 
            plan={selectedPlan} 
            onClose={() => setSelectedPlan(null)} 
            addToCart={addToCart}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default PlansSection;
