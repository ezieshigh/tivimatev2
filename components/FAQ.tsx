import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%', 
          padding: '1.5rem 0', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          color: 'white',
          fontSize: '1.1rem',
          textAlign: 'left'
        }}
      >
        <span style={{ paddingRight: '1rem' }}>{question}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ paddingBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ: React.FC = () => {
  const faqs = [
    { q: "Is this legal?", a: "We provide software installation services and aggregation tools. We do not host any content ourselves. It is the user's responsibility to ensure they have the rights to view specific content in their region." },
    { q: "Do I need a Smart TV?", a: "Not necessarily. Our service works best on an Amazon Fire Stick, which can be plugged into any TV with an HDMI port. It also works on many Android Smart TVs." },
    { q: "Can I use this outside the UK?", a: "Yes! Our 'Global TV Anywhere' service is specifically designed for international use, perfect for travelers and expats." },
    { q: "What internet speed do I need?", a: "We recommend a stable connection of at least 15Mbps for HD streaming, and 25Mbps+ for 4K content." },
    { q: "What if I'm not tech-savvy?", a: "No problem. Our technicians handle the installation completely. Once set up, the interface is as easy to use as Netflix." },
    { q: "Do you offer refunds?", a: "We offer a satisfaction guarantee. If we cannot get the service working on your device during installation, you don't pay." }
  ];

  return (
    <section id="faq" className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <h2 className="section-title">Common Questions</h2>
        <div style={{ marginTop: '3rem' }}>
          {faqs.map((f, i) => (
            <FAQItem key={i} question={f.q} answer={f.a} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
