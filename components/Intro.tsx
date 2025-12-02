import React from 'react';
import { motion } from 'framer-motion';

interface IntroProps {
  onComplete: () => void;
}

const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: 2, times: [0, 0.9, 1] }}
      onAnimationComplete={onComplete}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            height: '2px',
            background: '#ff1a1a',
            position: 'absolute',
            top: '50%',
            left: 0,
            transform: 'translateY(-50%)',
            boxShadow: '0 0 10px #ff1a1a'
          }}
        />
        <motion.h1
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            color: '#fff',
            fontFamily: "var(--font-heading)",
            fontSize: '4rem',
            fontWeight: 800,
            letterSpacing: '-2px',
            textTransform: 'uppercase',
            position: 'relative',
            zIndex: 10
          }}
        >
          TV PLUG
        </motion.h1>
      </div>
    </motion.div>
  );
};

export default Intro;