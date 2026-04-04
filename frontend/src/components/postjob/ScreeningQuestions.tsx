import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface ScreeningQuestionsProps {
  questions: { question: string; type: 'text' | 'boolean' }[];
  onChange: (questions: ScreeningQuestionsProps['questions']) => void;
}

const ScreeningQuestions: React.FC<ScreeningQuestionsProps> = ({ questions, onChange }) => {
  return (
    <div className="space-y-6 pt-4 border-t border-gray-100">
      <div className="flex justify-between items-center">
        <h3 className="text-[14px] font-black text-gray-900 tracking-tight">Custom Screening Questions</h3>
        <button 
          onClick={() => onChange([...questions, { question: '', type: 'text' }])}
          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center gap-2"
        >
          <Plus size={14} /> Add Question
        </button>
      </div>
      
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl border border-gray-100 group">
            <div className="flex-1 space-y-3">
              <input 
                type="text"
                placeholder="e.g. Why are you interested in this role?"
                value={q.question}
                onChange={(e) => {
                  const newQs = [...questions];
                  newQs[i].question = e.target.value;
                  onChange(newQs);
                }}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={q.type === 'text'} 
                    onChange={() => {
                      const newQs = [...questions];
                      newQs[i].type = 'text';
                      onChange(newQs);
                    }}
                    className="text-blue-600 focus:ring-blue-500" 
                  />
                  <span className="text-[11px] font-bold text-gray-600">Text Response</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={q.type === 'boolean'} 
                    onChange={() => {
                      const newQs = [...questions];
                      newQs[i].type = 'boolean';
                      onChange(newQs);
                    }}
                    className="text-blue-600 focus:ring-blue-500" 
                  />
                  <span className="text-[11px] font-bold text-gray-600">Yes / No</span>
                </label>
              </div>
            </div>
            <button 
              onClick={() => onChange(questions.filter((_, idx) => idx !== i))}
              className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {questions.length === 0 && (
          <p className="text-center text-gray-400 italic py-4 border-2 border-dashed border-gray-100 rounded-xl">No screening questions added yet.</p>
        )}
      </div>
    </div>
  );
};

export default ScreeningQuestions;
