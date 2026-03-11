/**
 * Utility function to export an array of Javascript Objects to a CSV file.
 * 
 * @param data Array of objects (row data)
 * @param filename Name of the exported file (without .csv extension)
 */
export const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
        console.warn('No data provided to exportToCSV');
        return;
    }

    // Extract headers from the keys of the first object
    const headers = Object.keys(data[0]);

    // Format rows
    const csvRows = [];

    // Add header row
    csvRows.push(headers.map(header => escapeCSVValue(header)).join(','));

    // Add data rows
    for (const row of data) {
        const rowData = headers.map(header => {
            let val = row[header];
            // Handle arrays (like skills) by joining with pipe or space
            if (Array.isArray(val)) {
                val = val.join(' | ');
            }
            // Handle null/undef
            if (val === null || val === undefined) {
                val = '';
            }
            return escapeCSVValue(String(val));
        });
        csvRows.push(rowData.join(','));
    }

    // Create string and blob
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    // Create hidden download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Helper to escape commas, quotes, and newlines in CSV cells
const escapeCSVValue = (value: string): string => {
    let result = value;
    // If value contains comma, quotes, or newlines, wrap in quotes and escape internal quotes
    if (result.includes(',') || result.includes('"') || result.includes('\n')) {
        result = result.replace(/"/g, '""'); // Escape double quotes by doubling them
        result = `"${result}"`;
    }
    return result;
};

/**
 * Export a printable PDF of the dashboard using the browser's native print dialog.
 * Adds a 'print-mode' class to the target element, calls window.print(), then removes it.
 *
 * @param elementId  ID of the wrapper element to print
 */
export const exportDashboardPDF = (elementId: string): void => {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.classList.add('print-mode');
    window.print();
    el.classList.remove('print-mode');
};

/**
 * Export recruiter dashboard stats + chart data as a CSV.
 *
 * @param stats           KPI stat object
 * @param trendsData      Array of { dateStr, count } from applications-over-time
 * @param funnelData      Array of { stage, count } from conversion funnel
 */
export const exportDashboardCSV = (
    stats: Record<string, number | string>,
    trendsData: { dateStr: string; count: number }[],
    funnelData: { stage: string; count: number }[]
): void => {
    const rows: string[] = ['=== KPI Summary ===', 'Metric,Value'];
    Object.entries(stats).forEach(([k, v]) => rows.push(`${k},${v}`));

    rows.push('', '=== Application Trends ===', 'Date,Applications');
    trendsData.forEach(d => rows.push(`${d.dateStr},${d.count}`));

    rows.push('', '=== Pipeline Funnel ===', 'Stage,Count');
    funnelData.forEach(d => rows.push(`${d.stage},${d.count}`));

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `recruiter-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
