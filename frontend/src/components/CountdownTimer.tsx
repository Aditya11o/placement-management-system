import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
  className?: string;
  showLabels?: boolean;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, className = "", showLabels = true }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeftData = null;

      if (difference > 0) {
        timeLeftData = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return timeLeftData;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 rounded-full border border-rose-100 font-black text-[10px] uppercase tracking-widest ${className}`}>
        <Clock size={12} />
        Ended
      </div>
    );
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-500 ${
        isUrgent 
          ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20 animate-pulse' 
          : 'bg-gray-900 text-white border-gray-800'
      }`}>
        <Clock size={14} className={isUrgent ? 'animate-spin-slow' : ''} />
        
        <div className="flex gap-2 font-black tracking-tighter text-sm">
          {timeLeft.days > 0 && (
            <div className="flex flex-col items-center">
              <span>{String(timeLeft.days).padStart(2, '0')}</span>
              {showLabels && <span className="text-[7px] uppercase tracking-widest opacity-60 -mt-1">Days</span>}
            </div>
          )}
          {timeLeft.days > 0 && <span className="opacity-30">:</span>}
          
          <div className="flex flex-col items-center">
            <span>{String(timeLeft.hours).padStart(2, '0')}</span>
            {showLabels && <span className="text-[7px] uppercase tracking-widest opacity-60 -mt-1">Hrs</span>}
          </div>
          <span className="opacity-30">:</span>
          
          <div className="flex flex-col items-center">
            <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
            {showLabels && <span className="text-[7px] uppercase tracking-widest opacity-60 -mt-1">Min</span>}
          </div>
          <span className="opacity-30">:</span>
          
          <div className="flex flex-col items-center">
            <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
            {showLabels && <span className="text-[7px] uppercase tracking-widest opacity-60 -mt-1">Sec</span>}
          </div>
        </div>
      </div>
      
      {isUrgent && (
        <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 animate-bounce">
          LAST CALL
        </span>
      )}
    </div>
  );
};

export default CountdownTimer;
