import React, { useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard, { UIApplicant } from './KanbanCard';

interface KanbanColumnProps {
    id: string; // The status (e.g., 'SUBMITTED', 'REVIEWED')
    title: string;
    applications: UIApplicant[];
    onViewProfile?: (app: UIApplicant) => void;
    isBulkMode?: boolean;
    selectedAppIds?: string[];
    onToggleAppSelection?: (appId: string) => void;
}

const uiColors: Record<string, string> = {
    'SUBMITTED': 'border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/20 text-slate-700 dark:text-slate-300',
    'REVIEWED': 'border-sky-200 dark:border-sky-800/50 bg-sky-50 dark:bg-sky-900/10 text-sky-700 dark:text-sky-300',
    'SHORTLISTED': 'border-violet-200 dark:border-violet-800/50 bg-violet-50 dark:bg-violet-900/10 text-violet-700 dark:text-violet-300',
    'SELECTED': 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300',
    'REJECTED': 'border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300',
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({
    id,
    title,
    applications,
    onViewProfile,
    isBulkMode = false,
    selectedAppIds = [],
    onToggleAppSelection
}) => {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { type: 'Column', status: id },
        disabled: isBulkMode // Disable drop zones during bulk mode
    });

    const itemIds = applications.map(app => app._id);
    const colorClasses = uiColors[id] || uiColors['SUBMITTED'];

    // --- Virtualization setup ---
    const parentRef = useRef<HTMLDivElement>(null);

    // Hardcoded estimated height:
    // 140 base card height + 12px gap
    // You could dynamically calculate this but 140 is a safe estimate for the KanbanCard
    const rowVirtualizer = useVirtualizer({
        count: applications.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 140,
        overscan: 5,
    });

    // Calculate how many items in this column are selected
    const selectedCount = applications.filter(app => selectedAppIds.includes(app._id)).length;
    const isAllSelected = selectedCount > 0 && selectedCount === applications.length;

    const handleSelectAllInColumn = () => {
        if (!onToggleAppSelection || !isBulkMode) return;

        if (isAllSelected) {
            // Deselect all in this column
            applications.forEach(app => {
                if (selectedAppIds.includes(app._id)) {
                    onToggleAppSelection(app._id);
                }
            });
        } else {
            // Select all in this column
            applications.forEach(app => {
                if (!selectedAppIds.includes(app._id)) {
                    onToggleAppSelection(app._id);
                }
            });
        }
    };

    return (
        <div className="flex flex-col h-full min-w-[300px] w-full max-w-[350px]">
            <div className={`p-3 rounded-t-xl border-t border-x border-b-2 flex justify-between items-center ${colorClasses}`}>
                <div className="flex items-center gap-2">
                    {isBulkMode && applications.length > 0 && (
                        <div
                            className={`w-4 h-4 rounded cursor-pointer flex items-center justify-center border transition-colors ${isAllSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'}`}
                            onClick={handleSelectAllInColumn}
                            title={isAllSelected ? "Deselect column" : "Select column"}
                        >
                            {isAllSelected && (
                                <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 10L0 6.00003L1.40002 4.60001L4 7.20001L10.6 0.599976L12 1.99997L4 10Z" fill="currentColor" />
                                </svg>
                            )}
                        </div>
                    )}
                    <h3 className="font-bold text-[15px] m-0">{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    {isBulkMode && selectedCount > 0 && (
                        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded">
                            {selectedCount} sel.
                        </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/60 dark:bg-black/20">
                        {applications.length}
                    </span>
                </div>
            </div>

            <div
                ref={(node) => {
                    setNodeRef(node);
                }}
                className={`flex-1 p-3 rounded-b-xl border-x border-b bg-slate-50 dark:bg-slate-900/50 flex flex-col transition-colors relative overflow-hidden ${isOver && !isBulkMode ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50' : 'border-slate-200 dark:border-slate-700/50'
                    }`}
            >
                {/* Scrollable Container for Virtualizer */}
                <div
                    ref={parentRef}
                    className="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar absolute inset-0 py-3"
                    style={{ contain: 'strict' }}
                >
                    <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                        {applications.length > 0 ? (
                            <div
                                style={{
                                    height: `${rowVirtualizer.getTotalSize()}px`,
                                    width: '100%',
                                    position: 'relative',
                                }}
                            >
                                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                    const app = applications[virtualRow.index];
                                    return (
                                        <div
                                            key={virtualRow.key}
                                            data-index={virtualRow.index}
                                            ref={rowVirtualizer.measureElement}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                padding: '0 12px',
                                                transform: `translateY(${virtualRow.start}px)`,
                                                paddingBottom: '12px', // GAP between cards
                                            }}
                                        >
                                            <KanbanCard
                                                app={app}
                                                onViewProfile={onViewProfile}
                                                isBulkMode={isBulkMode}
                                                isSelected={selectedAppIds.includes(app._id)}
                                                onToggleSelection={onToggleAppSelection}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-lg text-slate-400 text-sm font-medium mx-3">
                                Drop here
                            </div>
                        )}
                    </SortableContext>
                </div>
            </div>
        </div>
    );
};

export default KanbanColumn;
