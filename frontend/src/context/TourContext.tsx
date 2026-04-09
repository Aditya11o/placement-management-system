import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface TourContextType {
  activeStep: number;
  isOpen: boolean;
  totalSteps: number;
  currentStep: TourStep | null;
  startTour: (type: 'onboarding' | 'features') => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [tourSteps, setTourSteps] = useState<TourStep[]>([]);

  const studentSteps: TourStep[] = [
    {
      targetId: 'pms-tour-welcome',
      title: 'Welcome to PMS!',
      content: 'This is your placement command center. Let\'s get you oriented.',
      position: 'bottom'
    },
    {
      targetId: 'pms-tour-announcements',
      title: 'Stay Updated',
      content: 'Check here for the latest placement news, deadlines, and company visits.',
      position: 'bottom'
    },
    {
      targetId: 'pms-tour-readiness',
      title: 'Placement Readiness',
      content: 'Track your profile completion, skill score, and academic eligibility here. Aim for 80%+!',
      position: 'right'
    },
    {
      targetId: 'pms-tour-stats',
      title: 'Quick Stats',
      content: 'View your application funnel - from jobs applied to final selections.',
      position: 'left'
    },
    {
      targetId: 'pms-tour-cmd',
      title: 'Command Palette',
      content: 'Press Ctrl+K (or Cmd+K) anywhere to search jobs, pages, and tools instantly.',
      position: 'right'
    }
  ];

  const recruiterSteps: TourStep[] = [
    {
      targetId: 'pms-tour-welcome',
      title: 'Recruiter Dashboard',
      content: 'Manage your job postings and applicant pipeline seamlessly.',
      position: 'bottom'
    },
    {
      targetId: 'pms-tour-applicants',
      title: 'Applicant Pool',
      content: 'Quickly access new applicants and filter them based on your criteria.',
      position: 'top'
    },
    {
      targetId: 'pms-tour-funnel',
      title: 'Hiring Funnel',
      content: 'Visualize how candidates are moving through your interview stages.',
      position: 'left'
    }
  ];

  const adminSteps: TourStep[] = [
    {
      targetId: 'pms-tour-welcome',
      title: 'Administrator Console',
      content: 'Monitor system-wide placement health and manage all stakeholders.',
      position: 'bottom'
    },
    {
      targetId: 'pms-tour-admin-stats',
      title: 'System Metrics',
      content: 'Get a bird\'s eye view of total jobs, active students, and successful placements.',
      position: 'bottom'
    },
    {
      targetId: 'pms-tour-admin-charts',
      title: 'Placement Trends',
      content: 'Analyze historical data and identify trends to improve placement rates.',
      position: 'top'
    }
  ];

  useEffect(() => {
    if (user?.role === 'student') setTourSteps(studentSteps);
    else if (user?.role === 'recruiter') setTourSteps(recruiterSteps);
    else if (user?.role === 'admin') setTourSteps(adminSteps);
  }, [user]);

  // Auto-start for first-time users
  useEffect(() => {
    if (user && !localStorage.getItem(`pms_tour_completed_${user.id}`)) {
      const timer = setTimeout(() => {
        startTour('onboarding');
      }, 2000); // Small delay for dashboard to settle
      return () => clearTimeout(timer);
    }
  }, [user]);

  const startTour = useCallback((_type: 'onboarding' | 'features') => {
    setActiveStep(0);
    setIsOpen(true);
  }, []);

  const nextStep = useCallback(() => {
    if (activeStep < tourSteps.length - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      skipTour();
    }
  }, [activeStep, tourSteps]);

  const prevStep = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  }, [activeStep]);

  const skipTour = useCallback(() => {
    setIsOpen(false);
    if (user) {
      localStorage.setItem(`pms_tour_completed_${user.id}`, 'true');
    }
  }, [user]);

  const value = {
    activeStep,
    isOpen,
    totalSteps: tourSteps.length,
    currentStep: tourSteps[activeStep] || null,
    startTour,
    nextStep,
    prevStep,
    skipTour
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
