import React from 'react';
import Modal from '../Modal/Modal';
import { FileJson, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuditDiffModalProps {
    isOpen: boolean;
    onClose: () => void;
    log: any;
}

const AuditDiffModal: React.FC<AuditDiffModalProps> = ({ isOpen, onClose, log }) => {
    if (!log) return null;

    const metadata = log.metadata || {};
    const oldValue = metadata.old_value;
    const newValue = metadata.new_value;

    const isDataAvailable = oldValue !== undefined || newValue !== undefined;

    const renderData = (data: any) => {
        if (data === null || data === undefined) return <span className="text-slate-400 italic">None</span>;
        if (typeof data !== 'object') return <span className="text-slate-700 dark:text-slate-300 font-mono">{String(data)}</span>;
        
        return (
            <pre className="text-[11px] font-mono p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 overflow-x-auto custom-scrollbar">
                {JSON.stringify(data, null, 2)}
            </pre>
        );
    };

    // Simple diff logic for object keys
    const getDiffKeys = () => {
        if (typeof oldValue !== 'object' || typeof newValue !== 'object' || !oldValue || !newValue) return [];
        const keys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);
        return Array.from(keys).map(key => {
            const hasChanged = JSON.stringify(oldValue[key]) !== JSON.stringify(newValue[key]);
            return { key, hasChanged };
        });
    };

    const diffKeys = getDiffKeys();

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Electronic Audit Trail: Change Discovery" 
            size="xl"
        >
            <div className="p-6 space-y-6 animate-fade-in">
                {/* Log Identity Card */}
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-4 flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <FileJson size={24} />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 m-0">{log.action}</h4>
                        <p className="text-xs text-slate-500 m-0 uppercase font-black tracking-widest">{log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}</p>
                    </div>
                </div>

                {!isDataAvailable ? (
                    <div className="flex flex-col items-center justify-center p-20 text-center opacity-40">
                        <AlertCircle size={48} className="mb-4 text-slate-300" />
                        <p className="text-lg font-bold">No mutation data available</p>
                        <p className="text-sm">This log entry contains description text only.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Old State */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest m-0">Original State (Redacted)</h5>
                            </div>
                            <div className="border border-red-100 dark:border-red-900/20 bg-red-50/30 dark:bg-red-900/5 rounded-2xl p-4 min-h-[200px]">
                                {renderData(oldValue)}
                            </div>
                        </div>

                        {/* New State */}
                        <div className="space-y-3 relative">
                            <div className="flex items-center gap-2 px-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest m-0">Revised State (Propagated)</h5>
                            </div>
                            <div className="border border-emerald-100 dark:border-emerald-900/20 bg-emerald-50/30 dark:bg-emerald-900/5 rounded-2xl p-4 min-h-[200px]">
                                {renderData(newValue)}
                            </div>
                            <div className="absolute top-1/2 -left-3 -translate-y-1/2 hidden md:flex items-center justify-center w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                                <ArrowRight size={14} className="text-slate-400" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Key Summary (Optional for complex objects) */}
                {diffKeys.length > 0 && (
                    <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest m-0 px-1">Atomic Mutation Summary</h5>
                        <div className="flex flex-wrap gap-2">
                            {diffKeys.map(({ key, hasChanged }) => (
                                <div 
                                    key={key}
                                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider flex items-center gap-2 ${hasChanged ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                >
                                    {hasChanged ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-200" />}
                                    {key}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 transition-all text-sm"
                    >
                        Close Inspector
                    </button>
                    <div className="ml-auto flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-100/50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">
                        <CheckCircle2 size={12} /> Cryptographically Indexed
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AuditDiffModal;
