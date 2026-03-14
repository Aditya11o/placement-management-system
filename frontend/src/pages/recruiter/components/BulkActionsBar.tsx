import React from 'react';
import Button from '../../../components/Button/Button';

interface BulkActionsBarProps {
    selectedCount: number;
    onAction: (action: string) => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
    selectedCount,
    onAction
}) => {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 z-40 animate-slide-up border border-slate-700">
            <span className="font-semibold text-indigo-400">{selectedCount} Selected</span>
            <div className="w-px h-6 bg-slate-700"></div>
            <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-700" onClick={() => onAction('COMPARE')}>Compare</Button>
                <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-700" onClick={() => onAction('SEND_MESSAGE')}>Message</Button>
                <div className="w-px h-6 bg-slate-700 mx-1"></div>
                <Button size="sm" variant="ghost" className="text-red-400 hover:text-white hover:bg-red-900/40" onClick={() => onAction('REJECTED')}>Reject</Button>
                <Button size="sm" variant="primary" className="bg-indigo-500 hover:bg-indigo-400 border-none text-white shadow-none font-bold" onClick={() => onAction('SHORTLISTED')}>Shortlist</Button>
            </div>
        </div>
    );
};

export default BulkActionsBar;
