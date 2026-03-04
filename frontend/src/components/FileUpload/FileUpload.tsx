import React, { useCallback, useState } from 'react';
import { UploadCloud, CheckCircle, FileText, X, ImageIcon } from 'lucide-react';

interface FileUploadProps {
    label: string;
    accept?: string;
    description?: string;
    currentFileUrl?: string; // Optional: show currently active file/image
    isUploading?: boolean;
    onUpload: (file: File) => Promise<void>;
}

const FileUpload: React.FC<FileUploadProps> = ({
    label,
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
                    relative w-full rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden
                    ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'}
                    ${isUploading ? 'opacity-70 pointer-events-none' : 'cursor-pointer'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept={accept}
                    onChange={handleChange}
                    disabled={isUploading}
                    aria-label={`Upload ${label}`}
                />

                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 md:p-8">

                    {/* Visual Indicator (Avatar / Document Icon) */}
                    <div className="shrink-0 relative">
                        {isImageMode ? (
                            <div className={`w-24 h-24 rounded-full border-4 border-white shadow-md bg-slate-200 flex items-center justify-center overflow-hidden transition-all ${isUploading ? 'animate-pulse' : ''}`}>
                                {activeDisplayUrl ? (
                                    <img src={activeDisplayUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon size={32} className="text-slate-400" />
                                )}
                            </div>
                        ) : (
                            <div className={`w-16 h-20 rounded border-2 shadow-sm flex items-center justify-center transition-all ${activeDisplayUrl ? 'bg-indigo-50 border-indigo-200 text-indigo-500' : 'bg-white border-slate-200 text-slate-400'} ${isUploading ? 'animate-pulse' : ''}`}>
                                {activeDisplayUrl ? <CheckCircle size={28} /> : <FileText size={32} />}
                            </div>
                        )}

                        {/* Selected file pending badge */}
                        {selectedFile && !isUploading && (
                            <button
                                onClick={clearSelection}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center z-20 hover:bg-red-500 transition-colors"
                                title="Clear selection"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 text-center sm:text-left">
                        {isUploading ? (
                            <>
                                <h4 className="text-lg font-bold text-slate-800 mb-1">Uploading...</h4>
                                <div className="w-full h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full w-2/3 animate-[pulse_1s_ease-in-out_infinite]"></div>
                                </div>
                            </>
                        ) : selectedFile ? (
                            <>
                                <h4 className="text-lg font-bold text-slate-800 mb-1 truncate max-w-[200px] sm:max-w-[300px]">{selectedFile.name}</h4>
                                <p className="text-sm text-slate-500 m-0">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to upload</p>
                            </>
                        ) : (
                            <>
                                <h4 className="text-lg font-bold text-slate-800 mb-1 flex items-center justify-center sm:justify-start gap-2">
                                    <UploadCloud className="text-indigo-500" size={20} />
                                    Drop file here
                                </h4>
                                <p className="text-sm text-slate-500 m-0">
                                    {description || `or click to browse ${accept !== '*/*' ? `(${accept})` : ''}`}
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
