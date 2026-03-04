import React from 'react';
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
}: DataTableProps<T>) {
    const cols = skeletonCols ?? columns.length;

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
                                    <tr key={key} className="hover:bg-slate-50 transition-colors">
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
        </Card>
    );
}

export default DataTable;
