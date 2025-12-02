import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VenomOverlayProps {
  isActive: boolean;
  mode: 'enter' | 'exit';
  origin: { x: number; y: number } | null;
  onComplete?: () => void;
  children?: React.ReactNode;
}

const VenomOverlay: React.FC<VenomOverlayProps> = ({
  isActive,
  mode,
  origin,
  onComplete,
  children
}) => {
  const [phase, setPhase] = useState<'idle' | 'glitch' | 'spread' | 'reveal' | 'exit'>('idle');
  const [showContent, setShowContent] = useState(false);

  // Calculate the maximum radius needed to cover viewport from origin
  const getMaxRadius = () => {
    if (!origin) return 1500;
    const maxX = Math.max(origin.x, window.innerWidth - origin.x);
    const maxY = Math.max(origin.y, window.innerHeight - origin.y);
    return Math.sqrt(maxX * maxX + maxY * maxY) * 1.2;
  };

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      setShowContent(false);
      return;
    }

    if (mode === 'enter') {
      // Phase 1: Glitch flicker (0-300ms)
      setPhase('glitch');
      const glitchTimer = setTimeout(() => {
        // Phase 2: Virus spread (300-700ms)
        setPhase('spread');
      }, 300);

      const spreadTimer = setTimeout(() => {
        // Phase 3: Content reveal (700-1000ms)
        setPhase('reveal');
        setShowContent(true);
      }, 700);

      const completeTimer = setTimeout(() => {
        onComplete?.();
      }, 1000);

      return () => {
        clearTimeout(glitchTimer);
        clearTimeout(spreadTimer);
        clearTimeout(completeTimer);
      };
    } else if (mode === 'exit') {
      setPhase('exit');
      setShowContent(false);
      
      const exitTimer = setTimeout(() => {
        setPhase('idle');
        onComplete?.();
      }, 600);

      return () => clearTimeout(exitTimer);
    }
  }, [isActive, mode, onComplete]);

  const originX = origin?.x ?? window.innerWidth / 2;
  const originY = origin?.y ?? window.innerHeight / 2;
  const maxRadius = getMaxRadius();

  // Clip-path circle animation variants
  const maskVariants = {
    hidden: {
      clipPath: `circle(0px at ${originX}px ${originY}px)`,
    },
    spread: {
      clipPath: `circle(${maxRadius}px at ${originX}px ${originY}px)`,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1], // Custom easeOutExpo
      }
    },
    exit: {
      clipPath: `circle(0px at ${originX}px ${originY}px)`,
      transition: {
        duration: 0.5,
        ease: [0.7, 0, 0.84, 0], // Custom easeInExpo
      }
    }
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      }
    }
  };

  if (!isActive && phase === 'idle') return null;

  return (
    <div className="venom-overlay-root">
      {/* Glitch flicker effect - full screen subtle flash */}
      <AnimatePresence>
        {phase === 'glitch' && (
          <motion.div
            className="venom-glitch-flicker"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0, 0.2, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, times: [0, 0.2, 0.4, 0.6, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Venom mask with pixel texture */}
      <AnimatePresence>
        {(phase === 'spread' || phase === 'reveal' || phase === 'exit') && (
          <motion.div
            className="venom-overlay-mask"
            variants={maskVariants}
            initial="hidden"
            animate={phase === 'exit' ? 'exit' : 'spread'}
            exit="exit"
          >
            {/* Pixel grid texture layer */}
            <div className="venom-overlay-pixels" />
            
            {/* Scanline effect layer */}
            <div className="venom-overlay-scanlines" />
            
            {/* RGB aberration layer */}
            <div className="venom-overlay-rgb" />

            {/* Semi-transparent backdrop */}
            <div className="venom-overlay-backdrop" />

            {/* Content container */}
            <AnimatePresence>
              {showContent && children && (
                <motion.div
                  className="venom-content-wrapper"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {children}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VenomOverlay;

