import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../Card/Card';
import SkeletonTable from '../Skeleton/SkeletonTable';

export type Column<T> = {
    /** Column header text */
    header: string;
    /** Simple key accessor — used when the cell is plain text */
    accessor?: keyof T;
    /** Custom cell renderer — takes priority over accessor */
    cell?: (row: T) => React.ReactNode;
    /** Optional extra className on the <th> and <td> */
    className?: string;
};

interface DataTableProps<T> {
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

    // Pagination specific props
    page?: number;
    totalPages?: number;
    onPageChange?: (newPage: number) => void;
}

const thClass = 'p-4 px-6 bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 text-left';
const tdClass = 'p-5 px-6 border-b border-slate-200 align-middle';

function DataTable<T>({
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
}: DataTableProps<T>) {
    const cols = selectable ? (skeletonCols ?? columns.length) + 1 : skeletonCols ?? columns.length;
    const hasPagination = page !== undefined && totalPages !== undefined && onPageChange !== undefined;

    const rowKeysOnPage = data.map((row, rowIdx) => rowKey ? rowKey(row) : (row as any)._id ?? rowIdx);
    const isAllSelected = data.length > 0 && rowKeysOnPage.every(k => selectedKeys.includes(k));
    const isSomeSelected = data.length > 0 && rowKeysOnPage.some(k => selectedKeys.includes(k)) && !isAllSelected;

    const handleSelectAll = () => {
        if (!onSelectionChange) return;
        if (isAllSelected) {
            // Remove exactly these keys from selectedKeys
            onSelectionChange(selectedKeys.filter(k => !rowKeysOnPage.includes(k)));
        } else {
            // Add any missing keys from this page
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
        <Card className="overflow-hidden p-0">
            {isLoading ? (
                <SkeletonTable rows={skeletonRows} cols={cols} />
            ) : data.length === 0 ? (
                <div className="p-16 text-center">
                    <p className="text-slate-500">{emptyMessage}</p>
                </div>
            ) : (
                <div className="overflow-x-auto w-full">
                    <table className="w-full border-collapse text-left">
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
                        <tbody>
                            {data.map((row, rowIdx) => {
                                const key = rowKey
                                    ? rowKey(row)
                                    : (row as any)._id ?? rowIdx;
                                return (
                                    <tr
                                        key={key}
                                        className={`transition-colors border-b border-slate-100 last:border-none ${onRowClick ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-700/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/80'} ${selectedKeys.includes(key) ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : ''}`}
                                        onClick={(e) => {
                                            // Only trigger row click if we're not clicking the checkbox itself
                                            if ((e.target as HTMLElement).tagName.toLowerCase() !== 'input' && onRowClick) {
                                                onRowClick(row);
                                            }
                                        }}
                                    >
                                        {selectable && (
                                            <td className={`${tdClass} w-12 text-center`} onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedKeys.includes(key)}
                                                    onChange={() => handleSelectRow(key)}
                                                    className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                                                />
                                            </td>
                                        )}
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className={`${tdClass} ${col.className ?? ''}`}>
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
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
                    <span className="text-sm text-slate-500">
                        Page <span className="font-semibold text-slate-800">{page}</span> of <span className="font-semibold text-slate-800">{totalPages}</span>
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1 || isLoading}
                            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${page === 1 || isLoading ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
                            aria-label="Previous Page"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page === totalPages || isLoading}
                            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${page === totalPages || isLoading ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
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

export default DataTable;
