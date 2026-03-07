import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, Filter, Download, Eye, X, Plus, Copy, Check, Loader2, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import { useToast } from '../../context/ToastContext';

// ── Field Definitions ────────────────────────────────────────────────────────
interface FieldDef {
    key: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'array';
}

const STUDENT_FIELDS: FieldDef[] = [
    { key: 'name', label: 'Name', type: 'string' },
    { key: 'email', label: 'Email', type: 'string' },
    { key: 'branch', label: 'Branch', type: 'string' },
    { key: 'cgpa', label: 'CGPA', type: 'number' },
    { key: 'graduation_year', label: 'Graduation Year', type: 'number' },
    { key: 'phone', label: 'Phone', type: 'string' },
    { key: 'marks_10th', label: '10th Marks', type: 'number' },
    { key: 'marks_12th', label: '12th Marks', type: 'number' },
    { key: 'gender', label: 'Gender', type: 'string' },
    { key: 'backlogs_active', label: 'Active Backlogs', type: 'number' },
    { key: 'skills', label: 'Skills', type: 'array' },
    { key: 'status', label: 'Status', type: 'string' },
    { key: 'created_at', label: 'Registered On', type: 'date' },
];

const APPLICATION_FIELDS: FieldDef[] = [
    { key: 'student_id.name', label: 'Student Name', type: 'string' },
    { key: 'student_id.email', label: 'Student Email', type: 'string' },
    { key: 'student_id.branch', label: 'Branch', type: 'string' },
    { key: 'job_id.title', label: 'Job Title', type: 'string' },
    { key: 'status', label: 'Application Status', type: 'string' },
    { key: 'created_at', label: 'Applied On', type: 'date' },
];

const OPERATORS: Record<string, { label: string; types: string[] }> = {
    'eq': { label: '=', types: ['string', 'number', 'date'] },
    'ne': { label: '≠', types: ['string', 'number'] },
    'gt': { label: '>', types: ['number'] },
    'gte': { label: '≥', types: ['number'] },
    'lt': { label: '<', types: ['number'] },
    'lte': { label: '≤', types: ['number'] },
};

interface FilterRow {
    id: string;
    field: string;
    operator: string;
    value: string;
}

type DataSource = 'students' | 'applications';

// ── Helpers ──────────────────────────────────────────────────────────────────
const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
};

const downloadCSV = (headers: string[], rows: string[][], filename: string) => {
    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
};

const AdminReportBuilder: React.FC = () => {
    const { addToast } = useToast();

    const [dataSource, setDataSource] = useState<DataSource>('students');
    const [selectedFields, setSelectedFields] = useState<string[]>(['name', 'email', 'branch', 'cgpa']);
    const [filters, setFilters] = useState<FilterRow[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [copied, setCopied] = useState(false);

    const fields = dataSource === 'students' ? STUDENT_FIELDS : APPLICATION_FIELDS;

    // Reset selections when data source changes
    const handleDataSourceChange = (source: DataSource) => {
        setDataSource(source);
        setSelectedFields(source === 'students' ? ['name', 'email', 'branch', 'cgpa'] : ['student_id.name', 'job_id.title', 'status']);
        setFilters([]);
        setShowPreview(false);
    };

    // ── Filter Management ────────────────────────────────────────────────────
    const addFilter = () => {
        setFilters(prev => [...prev, {
            id: Date.now().toString(),
            field: fields[0].key,
            operator: 'eq',
            value: '',
        }]);
    };

    const updateFilter = (id: string, updates: Partial<FilterRow>) => {
        setFilters(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeFilter = (id: string) => {
        setFilters(prev => prev.filter(f => f.id !== id));
    };

    // ── Build Query Params ───────────────────────────────────────────────────
    const buildQueryParams = useCallback(() => {
        const params: Record<string, string> = {};

        // Select fields (for students only — applications use populate)
        if (dataSource === 'students' && selectedFields.length > 0) {
            params.select = selectedFields.join(',');
        }

        // Filters → advancedResults query format
        filters.forEach(f => {
            if (!f.value.trim()) return;
            if (f.operator === 'eq') {
                params[f.field] = f.value;
            } else {
                params[`${f.field}[${f.operator}]`] = f.value;
            }
        });

        params.limit = '100'; // Preview limit
        return params;
    }, [dataSource, selectedFields, filters]);

    // ── Data Fetching ────────────────────────────────────────────────────────
    const { data: previewData, isLoading, refetch } = useQuery({
        queryKey: ['report-preview', dataSource, buildQueryParams()],
        queryFn: async () => {
            const endpoint = dataSource === 'students' ? '/admin/users?role=STUDENT' : '/admin/applications';
            const params = buildQueryParams();
            const res = await api.get(endpoint, { params });
            return res.data?.data || [];
        },
        enabled: showPreview,
    });

    const handlePreview = () => {
        setShowPreview(true);
        refetch();
    };

    // ── Export ────────────────────────────────────────────────────────────────
    const handleExportCSV = () => {
        if (!previewData || previewData.length === 0) {
            addToast('No data to export. Run preview first.', 'error');
            return;
        }
        const headers = selectedFields.map(f => fields.find(fd => fd.key === f)?.label || f);
        const rows = previewData.map((row: any) => selectedFields.map(f => {
            const val = getNestedValue(row, f);
            return Array.isArray(val) ? val.join('; ') : String(val ?? '');
        }));
        downloadCSV(headers, rows, `report_${dataSource}_${new Date().toISOString().slice(0, 10)}.csv`);
        addToast('CSV downloaded!', 'success');
    };

    const handleCopyClipboard = async () => {
        if (!previewData || previewData.length === 0) return;
        const headers = selectedFields.map(f => fields.find(fd => fd.key === f)?.label || f);
        const rows = previewData.map((row: any) => selectedFields.map(f => {
            const val = getNestedValue(row, f);
            return Array.isArray(val) ? val.join('; ') : String(val ?? '');
        }));
        const text = [headers.join('\t'), ...rows.map((r: string[]) => r.join('\t'))].join('\n');
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Field Toggle ─────────────────────────────────────────────────────────
    const toggleField = (key: string) => {
        setSelectedFields(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in overflow-hidden">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-1 flex items-center gap-3">
                    <FileSpreadsheet size={28} /> Report Builder
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base m-0">Select fields, apply filters, preview data, and export to CSV.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                {/* ── Left Panel: Controls ──────────────────────────────────── */}
                <div className="flex flex-col gap-4">
                    {/* Data Source */}
                    <Card className="p-5">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                            <Database size={16} /> Data Source
                        </h3>
                        <div className="flex gap-2">
                            {(['students', 'applications'] as DataSource[]).map(src => (
                                <button
                                    key={src}
                                    onClick={() => handleDataSourceChange(src)}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${dataSource === src
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    {src === 'students' ? 'Students' : 'Applications'}
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Field Picker */}
                    <Card className="p-5">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                            Select Columns ({selectedFields.length}/{fields.length})
                        </h3>
                        <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto">
                            {fields.map(f => (
                                <label key={f.key} className="flex items-center gap-2.5 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedFields.includes(f.key)}
                                        onChange={() => toggleField(f.key)}
                                        className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{f.label}</span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto font-mono">{f.type}</span>
                                </label>
                            ))}
                        </div>
                    </Card>

                    {/* Filters */}
                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                <Filter size={14} /> Query Rules
                            </h3>
                            <button
                                onClick={addFilter}
                                className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <Plus size={14} /> Add Rule
                            </button>
                        </div>

                        {filters.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                                <Filter size={24} className="text-slate-300 dark:text-slate-600 mb-2" />
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 m-0">No active rules</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[200px] text-center">Add a rule to filter and refine the generated data.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <AnimatePresence initial={false}>
                                    {filters.map((f, index) => {
                                        const fieldDef = fields.find(fd => fd.key === f.field);
                                        const validOps = Object.entries(OPERATORS).filter(([, op]) => fieldDef && op.types.includes(fieldDef.type));

                                        return (
                                            <motion.div
                                                key={f.id}
                                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2, type: 'spring', bounce: 0.3 }}
                                                className="relative"
                                            >
                                                {/* Logical Connector Line (Notion style) */}
                                                {index > 0 && (
                                                    <div className="absolute -top-3 left-6 w-px h-3 bg-slate-300 dark:bg-slate-700" />
                                                )}

                                                <div className="flex flex-wrap items-stretch gap-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all">

                                                    {/* Where / And indicator */}
                                                    <div className="flex items-center px-3 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-400 dark:text-slate-500 select-none">
                                                        {index === 0 ? 'Where' : 'And'}
                                                    </div>

                                                    {/* Field Selector */}
                                                    <select
                                                        value={f.field}
                                                        onChange={e => updateFilter(f.id, { field: e.target.value, operator: 'eq' })}
                                                        className="flex-1 min-w-[120px] text-sm bg-transparent border-0 border-r border-slate-200 dark:border-slate-700 p-2.5 text-slate-700 dark:text-slate-200 font-medium focus:ring-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                                    >
                                                        {fields.map(fd => <option key={fd.key} value={fd.key}>{fd.label}</option>)}
                                                    </select>

                                                    {/* Operator Selector */}
                                                    <select
                                                        value={f.operator}
                                                        onChange={e => updateFilter(f.id, { operator: e.target.value })}
                                                        className="w-16 sm:w-20 text-sm text-center bg-indigo-50 dark:bg-indigo-900/20 border-0 border-r border-slate-200 dark:border-slate-700 p-2.5 text-indigo-700 dark:text-indigo-400 font-bold focus:ring-0 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                                                        title="Operator"
                                                    >
                                                        {validOps.map(([key, op]) => <option key={key} value={key}>{op.label}</option>)}
                                                    </select>

                                                    {/* Value Input */}
                                                    <input
                                                        type={fieldDef?.type === 'number' ? "number" : fieldDef?.type === 'date' ? "date" : "text"}
                                                        value={f.value}
                                                        onChange={e => updateFilter(f.id, { value: e.target.value })}
                                                        placeholder="Enter value..."
                                                        className="flex-[2] min-w-[150px] text-sm bg-transparent border-0 p-2.5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-0 focus:bg-slate-50 dark:focus:bg-slate-900"
                                                    />

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={() => removeFilter(f.id)}
                                                        className="px-3 border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
                                                        title="Remove Rule"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handlePreview}
                            disabled={selectedFields.length === 0}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Eye size={16} /> Preview Data
                        </button>
                        {showPreview && previewData && previewData.length > 0 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleExportCSV}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                                >
                                    <Download size={14} /> Export CSV
                                </button>
                                <button
                                    onClick={handleCopyClipboard}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right Panel: Preview Table ────────────────────────────── */}
                <Card className="p-0 overflow-hidden">
                    {!showPreview ? (
                        <div className="flex flex-col items-center justify-center p-16 text-center">
                            <FileSpreadsheet size={48} className="text-slate-200 dark:text-slate-700 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-400 dark:text-slate-500 mb-1">No Preview Yet</h3>
                            <p className="text-sm text-slate-400 dark:text-slate-600">Select your fields and click "Preview Data" to see results.</p>
                        </div>
                    ) : isLoading ? (
                        <div className="flex items-center justify-center p-16 gap-3 text-slate-400">
                            <Loader2 className="animate-spin" size={24} />
                            <span>Fetching data…</span>
                        </div>
                    ) : !previewData || previewData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-16 text-center text-slate-400 dark:text-slate-500">
                            <Database size={40} className="mb-3 opacity-40" />
                            <p>No records match your filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-auto max-h-[70vh]">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="sticky top-0 z-10">
                                    <tr>
                                        <th className="p-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 w-12">
                                            #
                                        </th>
                                        {selectedFields.map(f => (
                                            <th key={f} className="p-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                                {fields.find(fd => fd.key === f)?.label || f}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.map((row: any, idx: number) => (
                                        <tr key={row._id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-3 px-4 border-b border-slate-100 dark:border-slate-700/30 text-slate-400 dark:text-slate-500 text-xs">
                                                {idx + 1}
                                            </td>
                                            {selectedFields.map(f => {
                                                const val = getNestedValue(row, f);
                                                const display = val == null ? '—' : Array.isArray(val) ? val.join(', ') : String(val);
                                                return (
                                                    <td key={f} className="p-3 px-4 border-b border-slate-100 dark:border-slate-700/30 text-slate-700 dark:text-slate-300 whitespace-nowrap max-w-[200px] truncate">
                                                        {display}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                                Showing {previewData.length} records (limited to 100 for preview)
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default AdminReportBuilder;
