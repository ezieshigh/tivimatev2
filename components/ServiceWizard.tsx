import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export interface WizardStep {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface ServiceWizardProps {
  title: string;
  subtitle?: string;
  steps: WizardStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onClose: () => void;
  onComplete?: () => void;
  children: React.ReactNode;
  canProceed?: boolean;
  isLastStep?: boolean;
  accentColor?: 'red' | 'cyan' | 'magenta';
}

const ServiceWizard: React.FC<ServiceWizardProps> = ({
  title,
  subtitle,
  steps,
  currentStepIndex,
  onStepChange,
  onClose,
  onComplete,
  children,
  canProceed = true,
  isLastStep = false,
  accentColor = 'red'
}) => {
  const handleNext = () => {
    if (isLastStep && onComplete) {
      onComplete();
    } else if (currentStepIndex < steps.length - 1) {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1);
    }
  };

  const handleStepClick = (index: number) => {
    // Allow clicking on completed steps or current step
    if (index <= currentStepIndex) {
      onStepChange(index);
    }
  };

  const stepContentVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      }
    })
  };

  const accentColors = {
    red: 'var(--accent-red)',
    cyan: '#00ffff',
    magenta: '#ff00ff'
  };

  const accent = accentColors[accentColor];

  return (
    <div className="wizard-shell" onClick={onClose}>
      <motion.div 
        className="wizard-frame"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{ '--wizard-accent': accent } as React.CSSProperties}
      >
        {/* Animated virus border */}
        <div className="wizard-virus-border" />
        
        {/* Corner accents */}
        <div className="wizard-corner wizard-corner-tl" />
        <div className="wizard-corner wizard-corner-tr" />
        <div className="wizard-corner wizard-corner-bl" />
        <div className="wizard-corner wizard-corner-br" />

        {/* Header */}
        <div className="wizard-header">
          <div className="wizard-header-content">
            <h2 className="wizard-title">{title}</h2>
            {subtitle && <p className="wizard-subtitle">{subtitle}</p>}
          </div>
          <button className="wizard-close-btn" onClick={onClose} aria-label="Close wizard">
            <X size={20} />
          </button>
        </div>

        {/* Main content area */}
        <div className="wizard-body">
          {/* Step navigation - sidebar on desktop, top on mobile */}
          <nav className="wizard-steps-nav">
            <div className="wizard-steps-list">
              {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isClickable = index <= currentStepIndex;

                return (
                  <button
                    key={step.id}
                    className={`wizard-step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                    onClick={() => handleStepClick(index)}
                    disabled={!isClickable}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    <span className="wizard-step-indicator">
                      {isCompleted ? (
                        <Check size={14} />
                      ) : (
                        <span className="wizard-step-number">{index + 1}</span>
                      )}
                    </span>
                    <span className="wizard-step-label">{step.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Progress bar */}
            <div className="wizard-progress-track">
              <motion.div 
                className="wizard-progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </nav>

          {/* Step content */}
          <div className="wizard-content">
            <AnimatePresence mode="wait" custom={1}>
              <motion.div
                key={currentStepIndex}
                custom={1}
                variants={stepContentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="wizard-step-content"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer with navigation */}
        <div className="wizard-footer">
          <button
            className="wizard-nav-btn wizard-nav-prev"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>

          <div className="wizard-step-dots">
            {steps.map((_, index) => (
              <span
                key={index}
                className={`wizard-dot ${index === currentStepIndex ? 'active' : ''} ${index < currentStepIndex ? 'completed' : ''}`}
              />
            ))}
          </div>

          <button
            className="wizard-nav-btn wizard-nav-next"
            onClick={handleNext}
            disabled={!canProceed}
          >
            <span>{isLastStep ? 'Add to Cart' : 'Continue'}</span>
            {isLastStep ? <Check size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Scanline effect */}
        <div className="wizard-scanline" />
      </motion.div>
    </div>
  );
};

export default ServiceWizard;

