import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal } from 'lucide-react';

interface SortableWidgetProps {
    id: string;
    children: React.ReactNode;
    className?: string;
}

const SortableWidget: React.FC<SortableWidgetProps> = ({ id, children, className = '' }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.9 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative group ${className} ${isDragging ? 'shadow-2xl scale-[1.02]' : ''}`}
        >
            {/* Drag Handle Overlay Container */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-4 right-4 z-40 p-2 cursor-grab active:cursor-grabbing bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity border border-slate-200 dark:border-slate-700"
                title="Drag to reorder"
            >
                <GripHorizontal size={18} />
            </div>

            {/* The actual content */}
            {children}
        </div>
    );
};

export default SortableWidget;
