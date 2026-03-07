import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../Card/Card';
import SkeletonTable from '../Skeleton/SkeletonTable';
import { Column } from './DataTable'; // Re-use the Column type

interface VirtualizedDataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    emptyMessage?: string;
    /** Row key extractor — defaults to (row as any)._id */
    rowKey?: (row: T) => string | number;
    /** Number of skeleton columns to show when loading (defaults to columns.length) */
    skeletonCols?: number;
    skeletonRows?: number;

    /** Optional row click handler */
    onRowClick?: (row: T) => void;

    /** Selection Props */
    selectable?: boolean;
    selectedKeys?: (string | number)[];
    onSelectionChange?: (keys: (string | number)[]) => void;

    // Pagination specific props (Virtualization can handle huge pages, but standard pagination might still exist)
    page?: number;
    totalPages?: number;
    onPageChange?: (newPage: number) => void;

    // Virtualization specific props
    /** The est height of a row in pixels. Defaults to 65px */
    rowHeightEstimate?: number;
    /** Maximum height of the scrollable table body. */
    maxHeight?: string;
}

const thClass = 'p-3 px-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700 text-left sticky top-0 z-10 shadow-[inset_0_-1px_0_rgba(203,213,225,1)] dark:shadow-[inset_0_-1px_0_rgba(51,65,85,1)]';
const tdClass = 'p-3 px-4 border-b border-r border-slate-200/60 dark:border-slate-700/50 last:border-r-0 align-middle text-slate-700 dark:text-slate-300 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]';

function VirtualizedDataTable<T>({
    columns,
    data,
    isLoading = false,
    emptyMessage = 'No data found.',
    rowKey,
    skeletonCols,
    skeletonRows = 6,
    page,
    totalPages,
    onPageChange,
    onRowClick,
    selectable = false,
    selectedKeys = [],
    onSelectionChange,
    rowHeightEstimate = 65,
    maxHeight = '600px', // Restrict height so virtualizer can calculate viewport
}: VirtualizedDataTableProps<T>) {
    const cols = selectable ? (skeletonCols ?? columns.length) + 1 : skeletonCols ?? columns.length;
    const hasPagination = page !== undefined && totalPages !== undefined && onPageChange !== undefined;

    // The scrollable container ref
    const parentRef = useRef<HTMLDivElement>(null);

    // Filter out row keys for the current dataset chunk to handle "Select All"
    const rowKeysOnPage = useMemo(() => {
        return data.map((row, rowIdx) => rowKey ? rowKey(row) : (row as any)._id ?? rowIdx);
    }, [data, rowKey]);

    const isAllSelected = data.length > 0 && rowKeysOnPage.every(k => selectedKeys.includes(k));
    const isSomeSelected = data.length > 0 && rowKeysOnPage.some(k => selectedKeys.includes(k)) && !isAllSelected;

    // The Virtualizer instance
    const rowVirtualizer = useVirtualizer({
        count: data.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => rowHeightEstimate,
        overscan: 5, // Render 5 extra rows outside viewport for smooth scrolling
    });

    const handleSelectAll = () => {
        if (!onSelectionChange) return;
        if (isAllSelected) {
            onSelectionChange(selectedKeys.filter(k => !rowKeysOnPage.includes(k)));
        } else {
            const newKeys = [...selectedKeys];
            rowKeysOnPage.forEach(k => {
                if (!newKeys.includes(k)) newKeys.push(k);
            });
            onSelectionChange(newKeys);
        }
    };

    const handleSelectRow = (key: string | number) => {
        if (!onSelectionChange) return;
        if (selectedKeys.includes(key)) {
            onSelectionChange(selectedKeys.filter(k => k !== key));
        } else {
            onSelectionChange([...selectedKeys, key]);
        }
    };

    return (
        <Card className="overflow-hidden p-0 flex flex-col">
            {isLoading ? (
                <SkeletonTable rows={skeletonRows} cols={cols} />
            ) : data.length === 0 ? (
                <div className="p-16 text-center">
                    <p className="text-slate-500 dark:text-slate-400">{emptyMessage}</p>
                </div>
            ) : (
                <div
                    ref={parentRef}
                    className="overflow-auto w-full custom-scrollbar"
                    style={{ maxHeight }}
                >
                    <table className="w-full border-collapse text-left relative">
                        <thead>
                            <tr>
                                {selectable && (
                                    <th className={`${thClass} w-12 text-center`}>
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            ref={input => {
                                                if (input) input.indeterminate = isSomeSelected;
                                            }}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                                        />
                                    </th>
                                )}
                                {columns.map((col, i) => (
                                    <th key={i} className={`${thClass} ${col.className ?? ''}`}>
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody
                            style={{
                                height: `${rowVirtualizer.getTotalSize()}px`,
                                position: 'relative',
                            }}
                        >
                            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const rowIdx = virtualRow.index;
                                const row = data[rowIdx];
                                const key = rowKey ? rowKey(row) : (row as any)._id ?? rowIdx;
                                const isSelected = selectedKeys.includes(key);

                                return (
                                    <tr
                                        key={key}
                                        data-index={rowIdx}
                                        ref={rowVirtualizer.measureElement}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            transform: `translateY(${virtualRow.start}px)`,
                                        }}
                                        className={`group transition-all border-b border-slate-200/60 dark:border-slate-700/50 w-full flex outline-none
                                            ${onRowClick ? 'cursor-pointer hover:bg-indigo-50/30 dark:hover:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/80'} 
                                            ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-500/20 shadow-[inset_3px_0_0_0_#6366f1]' : ''}
                                        `}
                                        onClick={(e) => {
                                            if ((e.target as HTMLElement).tagName.toLowerCase() !== 'input' && onRowClick) {
                                                onRowClick(row);
                                            }
                                        }}
                                        tabIndex={onRowClick ? 0 : undefined}
                                    >
                                        {selectable && (
                                            <td className={`${tdClass} w-12 text-center flex items-center justify-center`} onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectRow(key)}
                                                    className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                                                />
                                            </td>
                                        )}
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className={`${tdClass} ${col.className ?? ''} flex-1 flex items-center`}>
                                                {col.cell
                                                    ? col.cell(row)
                                                    : col.accessor
                                                        ? String((row as any)[col.accessor] ?? '')
                                                        : null}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Footer */}
            {hasPagination && totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shrink-0">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Page <span className="font-semibold text-slate-800 dark:text-slate-200">{page}</span> of <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</span>
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1 || isLoading}
                            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${page === 1 || isLoading ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            aria-label="Previous Page"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page === totalPages || isLoading}
                            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${page === totalPages || isLoading ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            aria-label="Next Page"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </Card>
    );
}

export default VirtualizedDataTable;
