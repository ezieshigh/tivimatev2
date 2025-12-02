import React, { useState, useEffect } from 'react';
import Intro from '../components/Intro';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ServicesOverview from '../components/ServicesOverview';
import StreamingSection from '../components/StreamingSection';
import GlobalTVSection from '../components/GlobalTVSection';
import WhyChooseUs from '../components/WhyChooseUs';
import PlansSection from '../components/PlansSection';
import HowItWorks from '../components/HowItWorks';
import FAQ from '../components/FAQ';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import CyberBackground from '../components/CyberBackground';
import { CartItem } from '../types';
import { MotionConfig } from 'framer-motion';
import { usePerformanceMode } from '../context/PerformanceModeContext';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const { staticModeEnabled } = usePerformanceMode();

  useEffect(() => {
    // Intro duration before showing main content
    if (staticModeEnabled) {
      setShowIntro(false);
      return;
    }
    const timer = setTimeout(() => setShowIntro(false), 2200);
    return () => clearTimeout(timer);
  }, [staticModeEnabled]);

  const addToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  return (
    <MotionConfig reducedMotion={staticModeEnabled ? 'always' : 'user'}>
      <>
        {showIntro ? (
          <Intro onComplete={() => setShowIntro(false)} />
        ) : (
          <div className="app-container">
            {!staticModeEnabled && <CyberBackground />}
            <Navbar cartItemCount={cart.length} />
            <main>
              <Hero />
              <ServicesOverview />
              <StreamingSection />
              <GlobalTVSection />
              <WhyChooseUs />
              <PlansSection addToCart={addToCart} />
              <HowItWorks />
              <FAQ />
              <ContactSection cart={cart} removeFromCart={removeFromCart} />
            </main>
            <Footer />
          </div>
        )}
      </>
    </MotionConfig>
  );
};

export default App;
