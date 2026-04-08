import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Zap,
  BookOpen,
  Target
} from 'lucide-react';

interface SkillGapProps {
  matchScore: number;
  breakdown: {
    academic: number;
    skills: number;
    experience: number;
  };
  missingSkills: string[];
  jobSkills: string[];
  studentSkills: string[];
}

const SkillGapVisualization: React.FC<SkillGapProps> = ({ 
  matchScore, 
  breakdown, 
  missingSkills,
  jobSkills,
  studentSkills
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const recommendations = useMemo(() => {
    return missingSkills.map(skill => ({
      skill,
      resource: `${skill} Learning Path`,
      link: `https://www.google.com/search?q=learn+${encodeURIComponent(skill)}+best+courses`
    }));
  }, [missingSkills]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'emerald';
    if (score >= 60) return 'amber';
    return 'rose';
  };

  const color = getScoreColor(matchScore);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${color}-50`}>
              <Target className={`w-5 h-5 text-${color}-600`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Skill Gap Analysis</h3>
              <p className="text-sm text-gray-500">How your profile compares to requirements</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold text-${color}-600`}>{matchScore}%</div>
            <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Match Score</div>
          </div>
        </div>

        {/* Circular Match visualization logic simplified for performance */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {Object.entries(breakdown).map(([key, value]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 capitalize mb-1">{key}</div>
              <div className="font-bold text-gray-900">{value}%</div>
              <div className="mt-1.5 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  className={`h-full bg-${color}-500`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {studentSkills.filter(s => jobSkills.includes(s)).map(skill => (
              <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                <CheckCircle className="w-3 h-3" /> {skill}
              </span>
            ))}
            {missingSkills.map(skill => (
              <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-medium border border-rose-100">
                <XCircle className="w-3 h-3" /> {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-3 px-5 border-t border-gray-50 flex items-center justify-between text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Upskill Recommendations ({recommendations.length})</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden bg-gray-50/50"
          >
            <div className="p-5 pt-0 space-y-3">
              {recommendations.length > 0 ? (
                recommendations.map((rec, idx) => (
                  <a 
                    key={idx}
                    href={rec.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg bg-white border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group"
                  >
                    <div className="p-2 rounded bg-blue-50 text-blue-600">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{rec.resource}</div>
                      <div className="text-xs text-gray-500 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Bridge the gap in {rec.skill}</div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 mt-1" />
                  </a>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm italic">You have all the required skills for this role!</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SkillGapVisualization;
