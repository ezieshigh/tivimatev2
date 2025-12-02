import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, Turtle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformanceMode } from '../context/PerformanceModeContext';

interface NavbarProps {
  cartItemCount?: number;
}

const Navbar: React.FC<NavbarProps> = ({ cartItemCount = 0 }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { staticModeEnabled, toggleStaticMode } = usePerformanceMode();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'Services', href: '#services' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Packages', href: '#plans' },
    { name: 'FAQ', href: '#faq' },
  ];

  const handleScrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 'var(--nav-height)',
        display: 'flex',
        alignItems: 'center',
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
        backgroundColor: isScrolled ? 'rgba(5, 5, 5, 0.9)' : 'transparent',
        backdropFilter: isScrolled && !staticModeEnabled ? 'blur(10px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.1)' : 'none'
      }}
    >
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <a onClick={() => handleScrollTo('#hero')} style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'white', letterSpacing: '-1px' }}>
          TV <span style={{ color: 'var(--accent-red)' }}>PLUG</span>
        </a>

        {/* Desktop Menu */}
        <div className="desktop-menu" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              onClick={() => handleScrollTo(link.href)}
              style={{ 
                color: 'white', 
                textTransform: 'uppercase', 
                fontSize: '0.8rem', 
                letterSpacing: '1px',
                fontWeight: 600,
                opacity: 0.8,
                transition: 'opacity 0.2s',
                fontFamily: 'var(--font-body)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
            >
              {link.name}
            </a>
          ))}
          
          <button 
            onClick={() => handleScrollTo('#checkout')}
            style={{ position: 'relative', color: 'white', padding: '8px' }}
          >
             <ShoppingCart size={24} />
             {cartItemCount > 0 && (
               <motion.span 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 className="cart-badge"
                 style={{
                   position: 'absolute',
                   top: '0',
                   right: '-5px',
                   background: 'var(--accent-red)',
                   color: 'white',
                   fontSize: '0.7rem',
                   width: '18px',
                   height: '18px',
                   borderRadius: '50%',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   fontWeight: 'bold'
                 }}
               >
                 {cartItemCount}
               </motion.span>
             )}
          </button>
          <button
            onClick={toggleStaticMode}
            title={staticModeEnabled ? 'Static mode: ON' : 'Static mode: OFF'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'white',
              padding: '8px 10px',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.06)',
              fontSize: '0.8rem'
            }}
          >
            {staticModeEnabled ? <Turtle size={18} /> : <Zap size={18} />}
            <span style={{ opacity: 0.85 }}>{staticModeEnabled ? 'Static' : 'Dynamic'}</span>
          </button>
        </div>

        {/* Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="mobile-toggle">
           <button
            onClick={toggleStaticMode}
            title={staticModeEnabled ? 'Static mode: ON' : 'Static mode: OFF'}
            style={{
              color: 'white',
              padding: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.06)'
            }}
          >
            {staticModeEnabled ? <Turtle size={20} /> : <Zap size={20} />}
          </button>
           <button 
            onClick={() => handleScrollTo('#checkout')}
            style={{ position: 'relative', color: 'white', padding: '8px' }}
          >
             <ShoppingCart size={24} />
             {cartItemCount > 0 && (
               <span 
                 style={{
                   position: 'absolute',
                   top: '0',
                   right: '-5px',
                   background: 'var(--accent-red)',
                   color: 'white',
                   fontSize: '0.7rem',
                   width: '18px',
                   height: '18px',
                   borderRadius: '50%',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   fontWeight: 'bold'
                 }}
               >
                 {cartItemCount}
               </span>
             )}
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: 'white' }}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Styles Injection for simplicity */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
        @media (min-width: 769px) {
           .mobile-toggle { display: none !important; }
        }
      `}</style>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'absolute',
              top: 'var(--nav-height)',
              left: 0,
              right: 0,
              backgroundColor: '#0a0a0a',
              borderBottom: '1px solid #333',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                onClick={() => handleScrollTo(link.href)}
                style={{ color: 'white', fontSize: '1.2rem', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', fontWeight: 700 }}
              >
                {link.name}
              </a>
            ))}
            <button 
              className="btn btn-primary"
              onClick={() => handleScrollTo('#checkout')}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              Go to Checkout ({cartItemCount})
            </button>
            <button
              onClick={() => { toggleStaticMode(); setMobileMenuOpen(false); }}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 6,
                color: 'white',
                background: 'rgba(255,255,255,0.06)',
                textTransform: 'uppercase',
                fontWeight: 700
              }}
            >
              {staticModeEnabled ? 'Disable Static Mode' : 'Enable Static Mode'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;