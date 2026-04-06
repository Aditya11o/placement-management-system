import React, { useState } from 'react';
import { 
  Building2, Briefcase, X, 
  Save, Shield, HelpCircle,
  GraduationCap
} from 'lucide-react';
import { useCreateExperience } from '../../hooks/useExperiences';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const CreateExperience: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const createExp = useCreateExperience();

  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    role: '',
    batch: new Date().getFullYear().toString(),
    experienceType: 'Interview',
    difficulty: 'Medium',
    content: '',
    tips: '',
    isAnonymous: false
  });

  const [newQuestion, setNewQuestion] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createExp.mutateAsync({
        ...formData,
        questions
      });
      showSuccess('Experience shared successfully!', 'Knowledge Hub');
      navigate('/experiences');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to share experience');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Dynamic Progress Header */}
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-blue-950 uppercase tracking-tighter">Share Your <span className="text-blue-500">Journey</span></h1>
          <p className="text-gray-500 font-bold mt-1 text-sm uppercase tracking-widest">Contribute to the collective wisdom of students.</p>
        </div>
        <button 
          onClick={() => navigate('/experiences')}
          className="p-3 text-gray-400 hover:text-blue-600 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core Details Grid */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-2xl shadow-blue-900/5 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                <input 
                  required
                  type="text"
                  placeholder="e.g. Google, Microsoft"
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-blue-950"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Target Role</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                <input 
                  required
                  type="text"
                  placeholder="e.g. SDE-1, Data Analyst"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-blue-950"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Type & Difficulty</label>
              <div className="grid grid-cols-2 gap-4">
                <select 
                  value={formData.experienceType}
                  onChange={(e) => setFormData({...formData, experienceType: e.target.value})}
                  className="bg-gray-50 border-none rounded-xl py-3 px-4 font-bold text-blue-950/80 focus:ring-4 focus:ring-blue-500/10 text-sm"
                >
                  <option>Interview</option>
                  <option>Internship</option>
                  <option>Placement</option>
                </select>
                <select 
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  className="bg-gray-50 border-none rounded-xl py-3 px-4 font-bold text-blue-950/80 focus:ring-4 focus:ring-blue-500/10 text-sm"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Batch Year</label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                <input 
                  type="text"
                  placeholder="e.g. 2024"
                  value={formData.batch}
                  onChange={(e) => setFormData({...formData, batch: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-blue-950"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Highlight Title</label>
            <input 
              required
              type="text"
              placeholder="e.g. Efficiently cracking the 3rd Round at Uber"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-blue-950 text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Your Story</label>
            <textarea 
              required
              rows={8}
              placeholder="Describe the overall interview process, atmosphere, and your thoughts..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-[2rem] py-6 px-8 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-700 leading-relaxed"
            />
          </div>
        </div>

        {/* Interview Questions Section */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-2xl shadow-blue-900/5 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <HelpCircle size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-blue-950 uppercase tracking-tighter leading-none">Interview Questions</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Specific problems or behavioral questions asked.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <input 
                type="text"
                placeholder="Type a question and press enter..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddQuestion())}
                className="flex-1 bg-gray-50 border-none rounded-xl py-4 px-6 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-blue-950"
              />
              <button 
                type="button"
                onClick={handleAddQuestion}
                className="px-6 bg-blue-950 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all"
              >
                Add
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {questions.map((q, i) => (
                <div key={i} className="flex items-center justify-between bg-blue-50/50 p-4 rounded-xl group border border-blue-100/50">
                  <div className="flex items-center gap-4">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                    <span className="font-bold text-blue-950/80">{q}</span>
                  </div>
                  <button onClick={() => removeQuestion(i)} className="p-1 hover:text-rose-500 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50">
             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1 block mb-2">Preparation Tips</label>
             <textarea 
               rows={4}
               placeholder="Share specific topics to focus on or resources you used..."
               value={formData.tips}
               onChange={(e) => setFormData({...formData, tips: e.target.value})}
               className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-blue-950/80 text-sm"
             />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-blue-950 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-900/40">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setFormData({...formData, isAnonymous: !formData.isAnonymous})}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${
                formData.isAnonymous ? 'bg-blue-600 text-white' : 'bg-blue-900/50 text-blue-200'
              }`}
            >
              <Shield size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest">
                {formData.isAnonymous ? 'Posting Anonymously' : 'Public Profile'}
              </span>
            </button>
            <p className="text-[10px] font-bold text-blue-300 max-w-xs leading-tight">
              Anonymity hides your name from peers but remains visible to designated administrators for moderation.
            </p>
          </div>

          <button 
            type="submit"
            disabled={createExp.isPending}
            className="w-full md:w-auto px-12 py-4 bg-white text-blue-950 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-4"
          >
            {createExp.isPending ? 'Publishing...' : (
              <>
                <Save size={20} />
                Publish Journey
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateExperience;
