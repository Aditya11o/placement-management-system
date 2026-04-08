import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, AlertCircle, 
  Info, Loader2, Award, GraduationCap, 
  BookOpen, Users, Building2 
} from 'lucide-react';
import api from '../../api';

interface EligibilityCardProps {
  jobId: string;
  onEligibilityChange?: (eligible: boolean) => void;
}

const EligibilityCard: React.FC<EligibilityCardProps> = ({ jobId, onEligibilityChange }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEligibility = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/applications/check-eligibility/${jobId}`);
        setData(res.data);
        if (onEligibilityChange) onEligibilityChange(res.data.isEligible);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to check eligibility');
      } finally {
        setLoading(false);
      }
    };

    fetchEligibility();
  }, [jobId]);

  if (loading) return (
    <div className="bg-gray-50 rounded-3xl p-8 flex flex-col items-center justify-center border border-gray-100 animate-pulse">
      <Loader2 size={24} className="animate-spin text-blue-600 mb-3" />
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Scanning Profile Compliance...</p>
    </div>
  );

  if (error) return (
    <div className="bg-rose-50 border border-rose-100 rounded-3xl p-4 flex items-center gap-3">
      <AlertCircle size={18} className="text-rose-600" />
      <p className="text-xs font-bold text-rose-900">{error}</p>
    </div>
  );

  const { isEligible, reasons, criteria } = data;

  const criteriaList = [
    { label: 'CGPA', icon: Award, ...criteria.cgpa },
    { label: '10th Marks', icon: GraduationCap, ...criteria.tenth, suffix: '%' },
    { label: '12th Marks', icon: GraduationCap, ...criteria.twelfth, suffix: '%' },
    { label: 'Backlogs', icon: BookOpen, ...criteria.backlogs, inverse: true },
    { label: 'Course', icon: Building2, ...criteria.course },
    { label: 'Specialization', icon: Building2, ...criteria.branch },
    { label: 'Gender', icon: Users, ...criteria.gender },
  ];

  return (
    <div className={`rounded-[2rem] border overflow-hidden transition-all duration-500 shadow-xl ${
      isEligible ? 'bg-white border-blue-50' : 'bg-rose-50/30 border-rose-100'
    }`}>
      {/* Header Status */}
      <div className={`px-6 py-4 flex items-center justify-between ${
        isEligible ? 'bg-emerald-500' : 'bg-rose-600'
      }`}>
        <div className="flex items-center gap-3 text-white">
          {isEligible ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <h3 className="text-[11px] font-black uppercase tracking-widest italic">
            {isEligible ? 'Eligibility Verified' : 'Compliance Failure'}
          </h3>
        </div>
        <div className="bg-white/20 px-3 py-1 rounded-full">
           <p className="text-[9px] font-black text-white uppercase">Policy v5.2</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Failures summary if any */}
        {!isEligible && reasons.length > 0 && (
          <div className="space-y-2">
            {reasons.map((reason: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p className="text-[11px] font-black leading-tight">{reason}</p>
              </div>
            ))}
          </div>
        )}

        {/* Detailed Grid */}
        <div className="grid grid-cols-2 gap-4">
          {criteriaList.map((c, i) => {
            if (c.required === 0 || (Array.isArray(c.required) && c.required.length === 0) || c.required === 'all') return null;
            
            return (
              <div key={i} className={`p-4 rounded-2xl border transition-all ${
                c.met ? 'bg-white border-gray-100' : 'bg-rose-100/50 border-rose-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${c.met ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                    <c.icon size={12} />
                  </div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{c.label}</p>
                </div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <p className={`text-lg font-black leading-none italic ${c.met ? 'text-gray-900' : 'text-rose-900'}`}>
                      {Array.isArray(c.actual) ? c.actual[0] : c.actual}{c.suffix || ''}
                    </p>
                    <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                      Requirement: {c.inverse ? '<=' : '>='} {Array.isArray(c.required) ? c.required.join('/') : c.required}{c.suffix || ''}
                    </p>
                  </div>
                  {c.met ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : (
                    <XCircle size={16} className="text-rose-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-2 flex items-center gap-2 border-t border-gray-50">
          <Info size={12} className="text-gray-300" />
          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
            {isEligible 
              ? "All parameters verified against placement policy."
              : "Contact the training & placement cell for criteria dispute."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EligibilityCard;
