import React, { useState, useRef } from 'react';
import { X, Loader2, Upload, FileText } from 'lucide-react';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

interface UploadResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadResumeModal: React.FC<UploadResumeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showError('Please upload a PDF file only', 'Invalid File');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showError('File size must be less than 5MB', 'File Too Large');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      await api.post('/profile/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      showSuccess('Resume uploaded successfully!', 'Success');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to upload resume', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-zoom-in">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-950 text-white">
          <h3 className="text-xl font-bold">Upload Resume</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${
              selectedFile ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100 bg-gray-50/50 hover:border-blue-200 hover:bg-blue-50/30'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf" 
              className="hidden" 
            />
            
            {selectedFile ? (
              <div className="flex flex-col items-center animate-in zoom-in duration-300">
                <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl mb-4 shadow-sm">
                  <FileText size={40} />
                </div>
                <p className="text-sm font-bold text-gray-900 line-clamp-1 max-w-[200px]">{selectedFile.name}</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={40} />
                </div>
                <p className="text-sm font-bold text-gray-900">Click to select PDF</p>
                <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-widest leading-relaxed">Accepted file types: PDF only.<br/>Max size 5MB.</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              disabled={loading || !selectedFile}
              className="flex-1 px-6 py-3 bg-blue-950 text-white rounded-xl font-bold text-sm hover:bg-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Upload Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadResumeModal;
