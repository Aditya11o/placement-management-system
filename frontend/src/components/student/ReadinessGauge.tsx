import React, { useEffect, useState } from 'react';
import { Target, CheckCircle2, BookOpen, Activity, Briefcase, Info } from 'lucide-react';

interface ComponentProps {
  score: number;
  previousScore?: number;
  breakdown: {
    profile: { score: number; max: number };
    academic: { score: number; max: number };
    skills: { score: number; max: number };
    activity: { score: number; max: number };
    placement: { score: number; max: number };
  };
}

const ReadinessGauge: React.FC<ComponentProps> = ({ score, previousScore, breakdown }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  const trend = previousScore !== undefined ? score - previousScore : 0;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'stroke-emerald-500';
    if (s >= 50) return 'stroke-blue-500';
    if (s >= 30) return 'stroke-amber-500';
    return 'stroke-rose-500';
  };

  const getScoreText = (s: number) => {
    if (s >= 80) return 'text-emerald-700';
    if (s >= 50) return 'text-blue-700';
    if (s >= 30) return 'text-amber-700';
    return 'text-rose-700';
  };

  const items = [
    { label: 'Profile Completion', ...breakdown.profile, icon: CheckCircle2, color: 'text-indigo-500' },
    { label: 'Academic Standing', ...breakdown.academic, icon: BookOpen, color: 'text-sky-500' },
    { label: 'Verified Skills', ...breakdown.skills, icon: Target, color: 'text-emerald-500' },
    { label: 'Platform Activity', ...breakdown.activity, icon: Activity, color: 'text-rose-500' },
    { label: 'Placement Progress', ...breakdown.placement, icon: Briefcase, color: 'text-amber-500' },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-6 hover:shadow-xl transition-all group h-full flex flex-col justify-center min-h-[420px]">
      <div className="flex flex-col xl:flex-row items-center gap-6">
        {/* Gauge Section */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-52 h-52 transform -rotate-90">
            {/* Glow Effect */}
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Background Circle */}
            <circle
              cx="104"
              cy="104"
              r={radius}
              stroke="currentColor"
              strokeWidth="14"
              fill="transparent"
              className="text-surface-container-high"
            />
            {/* Progress Circle */}
            <circle
              cx="104"
              cy="104"
              r={radius}
              stroke="currentColor"
              strokeWidth="14"
              fill="transparent"
              strokeDasharray={circumference}
              style={{
                strokeDashoffset,
                transition: 'stroke-dashoffset 2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                filter: 'url(#glow)'
              }}
              strokeLinecap="round"
              className={getScoreColor(animatedScore)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <div className="flex items-start">
                <span className={`text-5xl font-black italic tracking-tighter ${getScoreText(animatedScore)}`}>
                  {animatedScore}
                </span>
                <span className={`text-xl font-black mt-1 ${getScoreText(animatedScore)}`}>%</span>
             </div>
             <div className="flex items-center gap-1 mt-1">
                {trend !== 0 && (
                  <div className={`flex items-center text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                  </div>
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">Readiness</span>
             </div>
          </div>
        </div>

        {/* Breakdown Section */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-black text-on-surface tracking-tight italic uppercase">
                Strategic <span className="text-surface-tint">Audit</span>
              </h3>
              <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">Multi-factor capability assessment</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="group/item">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1 w-6 h-6 shrink-0 rounded-lg bg-slate-50 ${item.color.replace('text', 'bg').replace('500', '100')} ${item.color} flex items-center justify-center`}>
                      <item.icon className="w-3 h-3" />
                    </div>
                    <span className="text-[8.5px] font-black text-on-surface-variant uppercase tracking-tighter truncate xl:tracking-normal flex-1 min-w-0" title={item.label}>{item.label}</span>
                  </div>
                  <span className="text-[10px] font-bold text-on-surface italic shrink-0 ml-1">
                    {item.score}<span className="text-on-surface-variant/20 mx-0.2 font-normal">/</span>{item.max}
                  </span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden border border-outline-variant/10">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out shadow-sm ${item.color.replace('text', 'bg')}`}
                    style={{ width: `${(item.score / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadinessGauge;
