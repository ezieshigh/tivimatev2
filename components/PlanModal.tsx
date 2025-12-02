
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Server, Globe, ShoppingCart, ChevronDown } from 'lucide-react';
import { Plan, COUNTRIES, Country } from '../data/plans';
import { CartItem } from '../types';

interface PlanModalProps {
  plan: Plan;
  onClose: () => void;
  addToCart: (item: CartItem) => void;
}

type Tab = 'overview' | 'pricing' | 'countries' | 'install';

const PlanModal: React.FC<PlanModalProps> = ({ plan, onClose, addToCart }) => {
  const [activeTab, setActiveTab] = useState<Tab>('pricing');
  const [selectedCountryId, setSelectedCountryId] = useState<string>(COUNTRIES[0].id);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'pricing', label: 'Pricing' },
    ...(plan.category !== 'streaming' ? [{ id: 'countries' as Tab, label: 'Countries' }] : []),
    { id: 'install', label: 'Process' }
  ];

  // Logic to determine if user MUST pick a single country
  const requiresCountrySelection = plan.id === 'tv-single' || plan.id === 'bundle-home';

  // Calculate current price based on selection
  const pricing = useMemo(() => {
    let monthly = plan.monthlyPrice || 0;
    let yearly = plan.yearlyPrice || 0;
    
    if (requiresCountrySelection) {
      const country = COUNTRIES.find(c => c.id === selectedCountryId);
      if (country) {
        if (country.tier === 'premium') {
          monthly = plan.monthlyPricePremiumCountry || 0;
          yearly = plan.yearlyPricePremiumCountry || 0;
        } else {
          monthly = plan.monthlyPriceStandardCountry || 0;
          yearly = plan.yearlyPriceStandardCountry || 0;
        }
      }
    }
    return { monthly, yearly };
  }, [plan, selectedCountryId, requiresCountrySelection]);

  const handleAddToCart = () => {
    let variantName = '';
    if (requiresCountrySelection) {
      const c = COUNTRIES.find(cnt => cnt.id === selectedCountryId);
      variantName = c ? `${c.flag} ${c.name}` : '';
    }

    // Default to monthly for this demo, or could add toggle
    // For 'cinema-yearly' plan, it's strictly yearly.
    const isYearlyPlan = plan.id.includes('yearly') || plan.id.includes('world') && !plan.monthlyPrice; // rough logic
    
    // Better logic: use yearly price if ONLY yearly price exists, otherwise default monthly
    const finalPrice = (plan.yearlyPrice && !plan.monthlyPrice) ? (pricing.yearly || plan.yearlyPrice) : (pricing.monthly || 0);
    const period = (plan.yearlyPrice && !plan.monthlyPrice) ? 'year' : 'month';

    const newItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      planId: plan.id,
      name: plan.name,
      variantName: variantName,
      setupFee: plan.setupFee,
      recurringPrice: finalPrice || 0,
      period: period,
      category: plan.category
    };

    addToCart(newItem);
    onClose();
    
    // Scroll to Checkout
    setTimeout(() => {
        document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000
        }}
      />
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, pointerEvents: 'none' }}>
        <motion.div
          layoutId={`card-${plan.id}`}
          className="glitch-border scanline matrix-bg"
          style={{
            width: '90%',
            maxWidth: '900px',
            maxHeight: '90vh',
            backgroundColor: '#0a0a0a',
            overflow: 'hidden',
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 0 50px rgba(0,0,0,0.8)'
          }}
        >
          {/* Header */}
          <div style={{ padding: '2rem', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <motion.h2 layoutId={`title-${plan.id}`} style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'white' }}>{plan.name}</motion.h2>
              <motion.p layoutId={`tagline-${plan.id}`} style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{plan.tagline}</motion.p>
            </div>
            <button onClick={onClose} style={{ color: 'white', padding: '8px' }}>
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #222', overflowX: 'auto' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '1rem 2rem',
                  color: activeTab === tab.id ? 'var(--accent-red)' : '#888',
                  borderBottom: activeTab === tab.id ? '2px solid var(--accent-red)' : '2px solid transparent',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="custom-scrollbar" style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'white' }}>Included in Plan</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  {plan.features.map((feat, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', alignItems: 'center' }}>
                      <Check color="var(--accent-red)" size={20} />
                      <span style={{ color: '#ddd' }}>{feat}</span>
                    </div>
                  ))}
                </div>
                
                {plan.category === 'streaming' && (
                  <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #333', background: 'rgba(255,26,26,0.05)' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Server size={20} color="var(--accent-red)" /> Privacy Add-on</h4>
                    <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                      Recommended: We can enable our privacy-first VPN during setup for +£6.50/mo. You can request this in the checkout notes.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* PRICING TAB */}
            {activeTab === 'pricing' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                
                {requiresCountrySelection && (
                  <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--accent-red)', background: 'rgba(255,26,26,0.05)' }}>
                    <label style={{ display: 'block', color: 'var(--accent-red)', fontWeight: 'bold', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                      Required: Select Your Country
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        value={selectedCountryId}
                        onChange={(e) => setSelectedCountryId(e.target.value)}
                        className="form-select"
                        style={{ appearance: 'none', background: '#000', color: 'white', border: '1px solid #444' }}
                      >
                        {COUNTRIES.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.flag} {c.name} — {c.tier === 'premium' ? 'Premium Tier' : 'Standard Tier'}
                          </option>
                        ))}
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666' }} size={16} />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '8px' }}>
                      Pricing varies based on country tier.
                    </p>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                  {/* Setup Fee */}
                  <div style={{ background: '#111', padding: '1.5rem', border: '1px solid #333' }}>
                    <div style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '0.5rem' }}>One-time Setup</div>
                    <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>£{plan.setupFee}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>Device prep & install.</div>
                  </div>

                  {/* Monthly Pricing */}
                  <div style={{ background: '#111', padding: '1.5rem', border: '1px solid #333' }}>
                    <div style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Subscription</div>
                    <div style={{ marginBottom: '1rem' }}>
                      {pricing.monthly > 0 ? (
                        <>
                          <span style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>£{pricing.monthly}</span>
                          <span style={{color:'#666'}}>/ month</span>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>£{pricing.yearly}</span>
                          <span style={{color:'#666'}}>/ year</span>
                        </>
                      )}
                    </div>
                    {pricing.monthly > 0 && pricing.yearly > 0 && (
                      <div style={{ fontSize: '0.85rem', color: '#888' }}>
                         Or £{pricing.yearly}/year (Save ~20%)
                      </div>
                    )}
                  </div>

                   {/* Devices */}
                   <div style={{ background: '#111', padding: '1.5rem', border: '1px solid #333' }}>
                    <div style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Devices</div>
                    <div style={{ fontSize: '1.5rem', color: 'white' }}>{plan.devicesIncluded} Included</div>
                    {plan.canAddDevices ? (
                      <p style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '0.5rem' }}>
                        +£{plan.addDevicePriceMonthly || 4}/mo per extra device.
                      </p>
                    ) : (
                      <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>Single device plan.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* COUNTRIES TAB */}
            {activeTab === 'countries' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {COUNTRIES.map(c => (
                    <div key={c.id} style={{ 
                      padding: '12px', 
                      background: c.tier === 'premium' ? 'linear-gradient(45deg, #222, #111)' : '#111', 
                      border: c.tier === 'premium' ? '1px solid #444' : '1px solid #222',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{c.flag}</span>
                        <span style={{ fontSize: '0.9rem', color: c.tier === 'premium' ? 'white' : '#aaa' }}>{c.name}</span>
                      </div>
                      {c.tier === 'premium' && (
                        <span style={{ fontSize: '0.6rem', padding: '2px 6px', background: 'var(--accent-red)', color: 'white', borderRadius: '2px' }}>PREMIUM</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* INSTALL TAB */}
            {activeTab === 'install' && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                 <p style={{color: '#aaa', marginBottom: '1rem'}}>Standard procedure for all new orders:</p>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { step: '1', title: 'Place Order', text: 'Add to cart and submit your details below.' },
                      { step: '2', title: 'Device Check', text: 'We contact you to verify your device (Fire Stick, Smart TV) or ship one.' },
                      { step: '3', title: 'Activation', text: 'We remotely install the software. Takes ~20-30 mins.' },
                      { step: '4', title: 'Payment', text: 'Payment is finalized only after successful setup.' }
                    ].map(s => (
                      <div key={s.step} style={{ padding: '1rem', borderLeft: '2px solid var(--accent-red)', background: '#111' }}>
                        <strong style={{color:'white'}}>Step {s.step}: {s.title}</strong>
                        <p style={{fontSize: '0.9rem', color:'#888', margin:0}}>{s.text}</p>
                      </div>
                    ))}
                 </div>
               </motion.div>
            )}

          </div>

          {/* Footer Action */}
          <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #222', background: '#050505', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '2rem' }}>
            <div style={{ textAlign: 'right' }}>
               <div style={{ color: '#888', fontSize: '0.8rem' }}>Estimated Total</div>
               <div style={{ fontSize: '1.5rem', color: 'white', fontFamily: 'var(--font-heading)' }}>
                 £{(pricing.monthly || pricing.yearly) + plan.setupFee}
               </div>
               <div style={{ fontSize: '0.7rem', color: '#666' }}>Due Today (Includes Setup)</div>
            </div>
            <button 
              onClick={handleAddToCart}
              className="btn btn-primary" 
              style={{ fontSize: '1.1rem', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default PlanModal;
