import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import KanbanCard, { UIApplicant } from './KanbanCard';

import { PipelineStage } from '../Modal/ManagePipelineModal';

interface KanbanBoardProps {
    applications: UIApplicant[];
    columns: PipelineStage[];
    onStatusChange: (appId: string, newStatus: string) => void;
    onViewProfile?: (app: UIApplicant) => void;
    isBulkMode?: boolean;
    selectedAppIds?: string[];
    onToggleAppSelection?: (appId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
    applications: initialData,
    columns,
    onStatusChange,
    onViewProfile,
    isBulkMode = false,
    selectedAppIds = [],
    onToggleAppSelection
}) => {
    // Local state for optimistic updates during drag
    const [items, setItems] = useState<UIApplicant[]>(initialData);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Filtering and Sorting State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'matchScore' | 'date' | 'name'>('matchScore');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Sync with server data changes (e.g., when filters change or refetch occurs)
    useEffect(() => {
        setItems(initialData);
    }, [initialData]);

    const processedItems = useMemo(() => {
        let result = [...items];

        // Search Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(app => {
                const name = app.student?.name?.toLowerCase() || '';
                const email = app.student?.email?.toLowerCase() || '';
                const title = app.job?.title?.toLowerCase() || '';
                return name.includes(query) || email.includes(query) || title.includes(query);
            });
        }

        // Sorting
        result.sort((a, b) => {
            let valA, valB;

            switch (sortBy) {
                case 'matchScore':
                    valA = a.matchScore || 0;
                    valB = b.matchScore || 0;
                    break;
                case 'date':
                    valA = new Date(a.createdAt || 0).getTime();
                    valB = new Date(b.createdAt || 0).getTime();
                    break;
                case 'name':
                    valA = a.student?.name?.toLowerCase() || '';
                    valB = b.student?.name?.toLowerCase() || '';
                    break;
                default:
                    valA = 0;
                    valB = 0;
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [items, searchQuery, sortBy, sortOrder]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: DragStartEvent) => {
        if (isBulkMode) return; // Disable drag in bulk mode
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        if (isBulkMode) return;
        const { active, over } = event;
        if (!over) return;

        const activeIdStr = String(active.id);
        const overIdStr = String(over.id);

        if (activeIdStr === overIdStr) return;

        const isActiveCard = active.data.current?.type === 'Application';
        const isOverCard = over.data.current?.type === 'Application';
        const isOverColumn = over.data.current?.type === 'Column';

        if (!isActiveCard) return;

        // Ensure we are hovering over a valid target
        if (isOverCard || isOverColumn) {
            setItems((prevItems) => {
                const activeIndex = prevItems.findIndex(i => i._id === activeIdStr);
                const activeItem = prevItems[activeIndex];
                const overStatus = isOverColumn
                    ? over.data.current?.status
                    : prevItems.find(i => i._id === overIdStr)?.status;

                if (activeItem.status !== overStatus) {
                    // Moving to new column optimistically
                    const newItems = [...prevItems];
                    newItems[activeIndex] = { ...activeItem, status: overStatus };
                    return newItems;
                }

                return prevItems;
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        if (isBulkMode) return;
        const { active, over } = event;

        if (!over) return;

        const activeIdStr = String(active.id);
        const overIdStr = String(over.id);

        const activeIndex = items.findIndex(i => i._id === activeIdStr);
        const originalItem = initialData.find(i => i._id === activeIdStr);
        const currentItem = items[activeIndex];

        // Trigger API mutation if status actually changed
        if (originalItem && currentItem && originalItem.status !== currentItem.status) {
            onStatusChange(activeIdStr, currentItem.status);
        }

        // Reorder if dragging within the same column (optional polish)
        if (activeIdStr !== overIdStr && currentItem.status === originalItem?.status) {
            const overIndex = items.findIndex(i => i._id === overIdStr);
            if (overIndex !== -1) {
                setItems((items) => arrayMove(items, activeIndex, overIndex));
            }
        }
    };

    const activeApp = activeId ? items.find(app => app._id === activeId) : null;

    return (
        <div className="flex flex-col gap-4">
            {/* Control Bar (Search & Sort) */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search candidates by name, email, or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-sm dark:text-slate-200"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 shrink-0">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium dark:text-slate-200"
                    >
                        <option value="matchScore">Recommendation Score</option>
                        <option value="date">Applied Date</option>
                        <option value="name">Candidate Name</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    >
                        <ArrowUpDown size={16} className={sortOrder === 'asc' ? 'rotate-180 transform transition-transform' : 'transition-transform'} />
                    </button>
                    {searchQuery.trim().length > 0 && (
                        <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 ml-2 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-1 rounded-full whitespace-nowrap">
                            {processedItems.length} match{processedItems.length !== 1 ? 'es' : ''}
                        </div>
                    )}
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory flex-nowrap min-h-[500px] -mx-1 px-1">
                    {columns.map(col => (
                        <div key={col.id} className="snap-start shrink-0 w-[85vw] sm:w-auto">
                            <KanbanColumn
                                id={col.id}
                                title={col.title}
                                applications={processedItems.filter(app => app.status === col.id)}
                                onViewProfile={onViewProfile}
                                isBulkMode={isBulkMode}
                                selectedAppIds={selectedAppIds}
                                onToggleAppSelection={onToggleAppSelection}
                            />
                        </div>
                    ))}
                </div>

                {/* Mobile swipe hint — only visible on small screens */}
                <p className="sm:hidden text-center text-xs text-slate-400 -mt-4 pb-2 font-medium select-none">
                    ← Swipe to see more columns →
                </p>

                <DragOverlay>
                    {activeApp && !isBulkMode ? (
                        <div className="opacity-90 rotate-2 scale-105 shadow-2xl cursor-grabbing">
                            <KanbanCard app={activeApp} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default KanbanBoard;
