import React, { useCallback, useState } from 'react';
import { UploadCloud, CheckCircle, FileText, X, ImageIcon } from 'lucide-react';

interface FileUploadProps {
    label: string;
    id?: string;
    title?: string;
    accept?: string;
    description?: string;
    currentFileUrl?: string; // Optional: show currently active file/image
    isUploading?: boolean;
    onUpload: (file: File) => Promise<void>;
}

const FileUpload: React.FC<FileUploadProps> = ({
    label,
    id,
    title,
    accept = '*/*',
    description,
    currentFileUrl,
    isUploading = false,
    onUpload
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const isImageMode = accept.includes('image/');
    const activeDisplayUrl = previewUrl || currentFileUrl;

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleFileSelect = (file: File) => {
        // Validate file type
        if (accept !== '*/*') {
            const acceptArray = accept.split(',').map(a => a.trim());
            const isValid = acceptArray.some(type => {
                if (type.endsWith('/*')) {
                    return file.type.startsWith(type.replace('/*', ''));
                }
                return file.type === type || file.name.endsWith(type);
            });

            if (!isValid) return; // Silent fail or trigger toast ideally
        }

        setSelectedFile(file);

        // Generate preview for images
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }

        // Auto-trigger upload
        onUpload(file).then(() => {
            setSelectedFile(null); // Clear selected state on success, relies on parent to update currentFileUrl
            setPreviewUrl(null);
        }).catch(() => {
            // Keep file selected on failure so user can see it
        });
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    return (
        <div className="w-full">
            <label className="text-slate-700 text-sm block mb-2 font-semibold flex justify-between items-center">
                {label}
                {isUploading && <span className="text-indigo-600 text-xs animate-pulse">Uploading...</span>}
            </label>

            <div
                className={`
                    relative w-full rounded-2xl border-2 border-dashed transition-all duration-500 overflow-hidden group
                    ${isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01] shadow-xl' : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-300 hover:shadow-lg'}
                    ${isUploading ? 'opacity-70 pointer-events-none' : 'cursor-pointer'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {/* Animated Background Pulse */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <input
                    type="file"
                    id={id}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept={accept}
                    onChange={handleChange}
                    disabled={isUploading}
                    aria-label={`Upload ${label}`}
                />

                <div className="flex flex-col sm:flex-row items-center gap-8 p-8 md:p-10 relative z-10">

                    {/* Visual Indicator (Avatar / Document Icon) */}
                    <div className="shrink-0 relative">
                        {isImageMode ? (
                            <div className={`w-24 h-24 rounded-full border-4 border-white dark:border-slate-700 shadow-xl bg-slate-200 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-110 ${isUploading ? 'animate-pulse' : ''}`}>
                                {activeDisplayUrl ? (
                                    <img src={activeDisplayUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon size={32} className="text-slate-400" />
                                )}
                            </div>
                        ) : (
                            <div className={`w-20 h-24 rounded-xl border-2 shadow-lg flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${activeDisplayUrl ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-500' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300'} ${isUploading ? 'animate-pulse' : ''}`}>
                                {activeDisplayUrl ? <CheckCircle size={32} /> : <FileText size={40} />}
                            </div>
                        )}

                        {/* Selected file pending badge */}
                        {selectedFile && !isUploading && (
                            <button
                                onClick={clearSelection}
                                className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 dark:bg-slate-700 text-white rounded-full flex items-center justify-center z-20 hover:bg-rose-500 transition-colors shadow-lg border-2 border-white dark:border-slate-800"
                                title="Clear selection"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 text-center sm:text-left">
                        {isUploading ? (
                            <>
                                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Analyzing your credentials...</h4>
                                <div className="w-full h-3 bg-slate-100 dark:bg-slate-700/50 rounded-full mt-4 overflow-hidden border border-slate-200/50 dark:border-slate-700">
                                    <div className="h-full bg-indigo-500 rounded-full w-full animate-[shimmer_2s_infinite] origin-left bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                                </div>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-3">AI Engine Processing</p>
                            </>
                        ) : selectedFile ? (
                            <>
                                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 truncate max-w-[200px] sm:max-w-xs">{selectedFile.name}</h4>
                                <p className="text-sm font-bold text-emerald-500 dark:text-emerald-400 m-0">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Verification Complete</p>
                            </>
                        ) : (
                            <>
                                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 flex items-center justify-center sm:justify-start gap-3">
                                    <div className="p-2 bg-indigo-500 rounded-lg text-white shadow-lg shadow-indigo-500/20 group-hover:animate-bounce">
                                        <UploadCloud size={20} />
                                    </div>
                                    {title || `Drag & Drop ${label.split(' ')[0] || 'File'}`}
                                </h4>
                                <p className="text-sm font-medium text-slate-400 dark:text-slate-500 m-0 leading-relaxed">
                                    {description || `or click to browse your system drive`}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
