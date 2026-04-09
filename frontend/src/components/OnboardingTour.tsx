import React, { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTour } from '../context/TourContext';
import './OnboardingTour.css';

const OnboardingTour: React.FC = () => {
  const { 
    isOpen, 
    activeStep, 
    totalSteps, 
    currentStep, 
    nextStep, 
    prevStep, 
    skipTour 
  } = useTour();

  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const updateCoords = () => {
    if (!currentStep) return;
    const element = document.getElementById(currentStep.targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = 8;
      setCoords({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + (padding * 2),
        height: rect.height + (padding * 2)
      });
      
      // Scroll into view if needed
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useLayoutEffect(() => {
    if (isOpen && currentStep) {
      // Small delay for potential layout shifts or scrolls
      const timer = setTimeout(updateCoords, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeStep, currentStep, windowSize]);

  if (!isOpen || !currentStep) return null;

  const tooltipPosition = () => {
    const { top, left, width, height } = coords;
    const padding = 16;
    
    switch (currentStep.position) {
      case 'bottom':
        return { top: top + height + padding, left: left + (width / 2) };
      case 'top':
        return { top: top - padding, left: left + (width / 2), transform: 'translate(-50%, -100%)' };
      case 'left':
        return { top: top + (height / 2), left: left - padding, transform: 'translate(-100%, -50%)' };
      case 'right':
        return { top: top + (height / 2), left: left + width + padding, transform: 'translate(0, -50%)' };
      default:
        return { top: top + height + padding, left: left + (width / 2) };
    }
  };

  const pos = tooltipPosition();

  return (
    <div className="pms-tour-overlay">
      {/* Spotlight Canvas */}
      <svg className="pms-tour-svg">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect 
              x={coords.left} 
              y={coords.top} 
              width={coords.width} 
              height={coords.height} 
              rx="12" 
              fill="black" 
              className="spotlight-cutout"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.7)" mask="url(#spotlight-mask)" />
      </svg>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="pms-tour-tooltip"
          style={{
            position: 'fixed',
            ...pos,
            ...(currentStep.position === 'bottom' || currentStep.position === 'top' ? { transform: 'translateX(-50%)' } : {})
          }}
        >
          <div className="pms-tour-header">
            <span className="pms-tour-badge">
              {activeStep + 1} / {totalSteps}
            </span>
            <button onClick={skipTour} className="pms-tour-close">
              <X size={18} />
            </button>
          </div>

          <div className="pms-tour-content">
            <h3>{currentStep.title}</h3>
            <p>{currentStep.content}</p>
          </div>

          <div className="pms-tour-footer">
            <button 
              onClick={prevStep} 
              disabled={activeStep === 0}
              className="pms-tour-btn-secondary"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <div className="flex gap-2">
              <button onClick={skipTour} className="pms-tour-btn-ghost">
                Skip
              </button>
              <button onClick={nextStep} className="pms-tour-btn-primary">
                {activeStep === totalSteps - 1 ? 'Finish' : 'Next'}
                {activeStep !== totalSteps - 1 && <ChevronRight size={16} />}
              </button>
            </div>
          </div>

          {/* Arrow */}
          <div className={`pms-tour-arrow arrow-${currentStep.position}`} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingTour;
