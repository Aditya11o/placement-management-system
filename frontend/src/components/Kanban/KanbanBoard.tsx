import React, { useState, useEffect } from 'react';
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

const COLUMNS = [
    { id: 'SUBMITTED', title: 'Submitted' },
    { id: 'REVIEWED', title: 'Reviewed' },
    { id: 'SHORTLISTED', title: 'Shortlisted' },
    { id: 'SELECTED', title: 'Selected' },
    { id: 'REJECTED', title: 'Rejected' }
];

interface KanbanBoardProps {
    applications: UIApplicant[];
    onStatusChange: (appId: string, newStatus: string) => void;
    onViewProfile?: (app: UIApplicant) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ applications: initialData, onStatusChange, onViewProfile }) => {
    // Local state for optimistic updates during drag
    const [items, setItems] = useState<UIApplicant[]>(initialData);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Sync with server data changes (e.g., when filters change or refetch occurs)
    useEffect(() => {
        setItems(initialData);
    }, [initialData]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
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

                    // Also physically move the item in the array if hovering another card
                    if (isOverCard) {
                        // Card ordering is handled generically or in DragEnd
                    }

                    return newItems;
                }

                return prevItems;
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
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
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory hide-scrollbar">
                {COLUMNS.map(col => (
                    <div key={col.id} className="snap-start shrink-0">
                        <KanbanColumn
                            id={col.id}
                            title={col.title}
                            applications={items.filter(app => app.status === col.id)}
                            onViewProfile={onViewProfile}
                        />
                    </div>
                ))}
            </div>

            <DragOverlay>
                {activeApp ? (
                    <div className="opacity-90 rotate-2 scale-105 shadow-2xl cursor-grabbing">
                        <KanbanCard app={activeApp} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default KanbanBoard;
