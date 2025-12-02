/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

// Matrix Rain Canvas Component
const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters - mix of katakana, numbers, and symbols
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]|/\\'.split('');
    
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(1).map(() => Math.random() * -100);

    const draw = () => {
      // Semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)];
        
        // Calculate position
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Color gradient: bright at head, fading trail
        const brightness = Math.random();
        if (brightness > 0.98) {
          ctx.fillStyle = '#ffffff'; // Bright white flash
        } else if (brightness > 0.9) {
          ctx.fillStyle = '#ff3333'; // Red accent (brand color)
        } else {
          ctx.fillStyle = `rgba(255, 26, 26, ${0.3 + Math.random() * 0.4})`; // Red with varying opacity
        }

        ctx.fillText(char, x, y);

        // Reset drop randomly after passing screen
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.5 + Math.random() * 0.5;
      }
    };

    const interval = setInterval(draw, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.4,
        pointerEvents: 'none',
      }}
    />
  );
};

// Glitch Lines Component
const GlitchLines: React.FC = () => {
  const lines = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      width: 20 + Math.random() * 80,
      height: 1 + Math.random() * 2,
      delay: Math.random() * 5,
      duration: 0.1 + Math.random() * 0.3,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {lines.map((line) => (
        <motion.div
          key={line.id}
          style={{
            position: 'absolute',
            top: `${line.top}%`,
            left: 0,
            width: `${line.width}%`,
            height: `${line.height}px`,
            background: 'linear-gradient(90deg, transparent, rgba(255, 26, 26, 0.8), rgba(0, 255, 255, 0.6), transparent)',
            filter: 'blur(0.5px)',
          }}
          initial={{ opacity: 0, x: '-100%' }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: line.duration,
            repeat: Infinity,
            repeatDelay: 3 + line.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

// Cyber Grid Component
const CyberGrid: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255, 26, 26, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 26, 26, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
        opacity: 0.5,
        pointerEvents: 'none',
      }}
    />
  );
};

// Floating Circuit Nodes
const CircuitNodes: React.FC = () => {
  const nodes = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          style={{
            position: 'absolute',
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: node.size,
            height: node.size,
            borderRadius: '50%',
            background: 'var(--accent-red)',
            boxShadow: '0 0 10px var(--accent-red), 0 0 20px var(--accent-red)',
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: node.duration,
            repeat: Infinity,
            delay: node.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Scan Line Effect
const ScanLines: React.FC = () => {
  return (
    <>
      {/* Static scan lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.1) 2px,
            rgba(0, 0, 0, 0.1) 4px
          )`,
          pointerEvents: 'none',
          opacity: 0.3,
        }}
      />
      {/* Moving scan line */}
      <motion.div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 26, 26, 0.5), rgba(255, 255, 255, 0.3), rgba(255, 26, 26, 0.5), transparent)',
          boxShadow: '0 0 20px rgba(255, 26, 26, 0.5)',
          pointerEvents: 'none',
        }}
        animate={{
          top: ['-2px', '100%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </>
  );
};

// Digital Noise Overlay
const DigitalNoise: React.FC = () => {
  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        opacity: 0.03,
        pointerEvents: 'none',
        mixBlendMode: 'overlay',
      }}
      animate={{
        opacity: [0.02, 0.04, 0.02],
      }}
      transition={{
        duration: 0.1,
        repeat: Infinity,
      }}
    />
  );
};

// Glitch RGB Split Effect (appears randomly)
const RGBGlitch: React.FC = () => {
  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
      animate={{
        opacity: [0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        times: [0, 0.1, 0.5, 0.51, 0.52, 0.7, 0.8, 0.81, 0.82, 1],
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(255,0,0,0.1) 0%, transparent 20%, transparent 80%, rgba(0,255,255,0.1) 100%)',
          transform: 'translateX(-5px)',
        }}
      />
    </motion.div>
  );
};

// Data Stream Particles
const DataStreams: React.FC = () => {
  const streams = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      width: 1 + Math.random(),
      height: 30 + Math.random() * 100,
      delay: Math.random() * 10,
      duration: 3 + Math.random() * 5,
      opacity: 0.1 + Math.random() * 0.3,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {streams.map((stream) => (
        <motion.div
          key={stream.id}
          style={{
            position: 'absolute',
            left: `${stream.x}%`,
            width: `${stream.width}px`,
            height: `${stream.height}px`,
            background: `linear-gradient(180deg, transparent, rgba(255, 26, 26, ${stream.opacity}), transparent)`,
            filter: 'blur(1px)',
          }}
          initial={{ top: '-150px' }}
          animate={{
            top: ['0%', '110%'],
          }}
          transition={{
            duration: stream.duration,
            repeat: Infinity,
            delay: stream.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

// Hexagon Pattern Overlay
const HexPattern: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.02,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ff1a1a' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: 'none',
      }}
    />
  );
};

// Main Cyber Background Component
const CyberBackground: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #050505 0%, #0a0505 50%, #050508 100%)',
      }}
    >
      {/* Base gradient glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '150vw',
          height: '150vh',
          background: 'radial-gradient(ellipse at center, rgba(255, 26, 26, 0.08) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Layers */}
      <HexPattern />
      <CyberGrid />
      <MatrixRain />
      <DataStreams />
      <CircuitNodes />
      <ScanLines />
      <GlitchLines />
      <RGBGlitch />
      <DigitalNoise />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top edge glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 26, 26, 0.5), transparent)',
          boxShadow: '0 0 20px rgba(255, 26, 26, 0.3)',
        }}
      />
    </div>
  );
};

export default CyberBackground;

