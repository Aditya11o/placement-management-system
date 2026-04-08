import React, { useEffect, useState } from 'react';
import { Target, CheckCircle2, BookOpen, Activity, Briefcase, Info } from 'lucide-react';

interface ComponentProps {
  score: number;
  breakdown: {
    profile: { score: number; max: number };
    academic: { score: number; max: number };
    skills: { score: number; max: number };
    activity: { score: number; max: number };
    placement: { score: number; max: number };
  };
}

const ReadinessGauge: React.FC<ComponentProps> = ({ score, breakdown }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Gauge Section */}
        <div className="relative flex items-center justify-center">
          <svg className="w-48 h-48 transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-100"
            />
            {/* Progress Circle */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              style={{
                strokeDashoffset,
                transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              strokeLinecap="round"
              className={getScoreColor(animatedScore)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center transform group">
             <span className={`text-4xl font-bold tracking-tight ${getScoreText(animatedScore)}`}>
               {animatedScore}%
             </span>
             <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ready</span>
          </div>
        </div>

        {/* Breakdown Section */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Readiness Breakdown</h3>
            <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Rule-based Score
            </div>
          </div>
          
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="group cursor-help">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    {item.label}
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    {item.score}/{item.max}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${item.color.replace('text', 'bg')}`}
                    style={{ width: `${(item.score / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Target className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-900">Pro Tip</p>
                <p className="text-xs text-indigo-700 leading-relaxed mt-0.5">
                  Verify your skills and update your CGPA to boost your score above 80 
                  to catch more recruiter attention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadinessGauge;
