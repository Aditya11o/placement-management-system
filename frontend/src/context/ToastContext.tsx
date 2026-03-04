import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastContextType {
    addToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const ToastItem = ({ toast, onClose }: { toast: ToastMessage, onClose: () => void }) => {
    const icons = {
        success: <CheckCircle className="text-green-500 shrink-0" size={20} />,
        error: <AlertCircle className="text-red-500 shrink-0" size={20} />,
        info: <Info className="text-indigo-500 shrink-0" size={20} />
    };

    return (
        <div className="flex items-center gap-3 px-5 py-4 bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] pointer-events-auto min-w-[300px] max-w-[400px] transition-all animate-fade-in">
            {icons[toast.type] || icons.info}
            <p className="flex-grow text-[14px] font-medium text-slate-800 m-0">{toast.message}</p>
            <button onClick={onClose} className="bg-transparent border-none text-slate-400 cursor-pointer p-1 rounded flex items-center justify-center transition-colors hover:bg-black/5 hover:text-slate-800 shrink-0 outline-none">
                <X size={16} />
            </button>
        </div>
    );
};
