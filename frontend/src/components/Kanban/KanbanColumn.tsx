import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard, { UIApplicant } from './KanbanCard';

interface KanbanColumnProps {
    id: string; // The status (e.g., 'SUBMITTED', 'REVIEWED')
    title: string;
    applications: UIApplicant[];
    onViewProfile?: (app: UIApplicant) => void;
}

const uiColors: Record<string, string> = {
    'SUBMITTED': 'border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/20 text-slate-700 dark:text-slate-300',
    'REVIEWED': 'border-sky-200 dark:border-sky-800/50 bg-sky-50 dark:bg-sky-900/10 text-sky-700 dark:text-sky-300',
    'SHORTLISTED': 'border-violet-200 dark:border-violet-800/50 bg-violet-50 dark:bg-violet-900/10 text-violet-700 dark:text-violet-300',
    'SELECTED': 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300',
    'REJECTED': 'border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300',
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, applications, onViewProfile }) => {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { type: 'Column', status: id }
    });

    const itemIds = applications.map(app => app._id);
    const colorClasses = uiColors[id] || uiColors['SUBMITTED'];

    return (
        <div className="flex flex-col h-full min-w-[300px] w-full max-w-[350px]">
            <div className={`p-3 rounded-t-xl border-t border-x border-b-2 flex justify-between items-center ${colorClasses}`}>
                <h3 className="font-bold text-[15px] m-0">{title}</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/60 dark:bg-black/20">
                    {applications.length}
                </span>
            </div>

            <div
                ref={setNodeRef}
                className={`flex-1 p-3 rounded-b-xl border-x border-b bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-3 transition-colors ${isOver ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50' : 'border-slate-200 dark:border-slate-700/50'
                    }`}
            >
                <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                    {applications.map(app => (
                        <KanbanCard key={app._id} app={app} onViewProfile={onViewProfile} />
                    ))}
                    {applications.length === 0 && (
                        <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-lg text-slate-400 text-sm font-medium">
                            Drop here
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
};

export default KanbanColumn;
