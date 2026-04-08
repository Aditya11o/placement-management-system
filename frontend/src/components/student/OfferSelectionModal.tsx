import React, { useState, useRef } from 'react';
import { 
  X, Upload, FileText, CheckCircle2, 
  AlertCircle, Loader2, Sparkles
} from 'lucide-react';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';

interface OfferSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  companyName: string;
  role: string;
}

const OfferSelectionModal: React.FC<OfferSelectionModalProps> = ({ 
  isOpen, onClose, applicationId, companyName, role 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        showError('Please upload a PDF file', 'Invalid File Type');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('offerLetter', file);

    try {
      await api.patch(`/applications/${applicationId}/offer-letter`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      showSuccess(`Offer letter for ${companyName} uploaded! Pending TPO verification.`, 'Upload Successful');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to upload offer letter', 'Upload Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
        
        {/* Header */}
        <div className="bg-[#000613] p-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-blue-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Official Submission</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Upload <span className="text-blue-400">Offer Letter</span></h2>
            <p className="text-gray-400 text-[11px] font-bold mt-2 uppercase tracking-widest">{role} @ {companyName}</p>
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all z-20"
          >
            <X size={20} />
          </button>

          {/* Abstract BG Decorations */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex gap-3">
              <div className="text-blue-600 shrink-0">
                <AlertCircle size={20} />
              </div>
              <p className="text-[11px] font-bold text-blue-900 leading-relaxed uppercase tracking-tight">
                Please upload the official offer letter signed by the recruiter. Your status will be updated to <span className="italic font-black text-blue-600">"Placed"</span> after TPO verification.
              </p>
            </div>

            {/* Upload Zone */}
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
                ${dragActive ? 'border-blue-600 bg-blue-50 scale-[0.98]' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50/50'}
                ${file ? 'border-emerald-600 bg-emerald-50/30' : ''}
              `}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="application/pdf"
                onChange={handleFileChange}
              />

              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-sm font-black text-gray-900 tracking-tight line-clamp-1 italic uppercase">{file.name}</h4>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase tracking-widest">Ready for upload • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="mt-4 text-[10px] font-black text-rose-600 hover:text-rose-800 uppercase tracking-widest underline underline-offset-4"
                  >
                    Replace File
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 transition-transform">
                    <Upload size={32} />
                  </div>
                  <h4 className="text-sm font-black text-gray-900 tracking-tight uppercase tracking-widest italic">Drop your PDF here</h4>
                  <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">or browse files from your folder</p>
                  <div className="mt-4 flex gap-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><FileText size={10} /> PDF ONLY</span>
                    <span className="flex items-center gap-1"><Loader2 size={10} /> MAX 5MB</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 border border-gray-200 text-gray-500 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || loading}
                className="flex-[2] px-6 py-4 bg-[#000613] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Upload & Verify</span>
                  </>
                )}
              </button>
            </div>
            
            <p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              By uploading, you certify that this offer is authentic and valid.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferSelectionModal;
