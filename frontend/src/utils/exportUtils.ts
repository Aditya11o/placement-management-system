import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export const exportToExcel = (data: any, fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (data: any, fileName: string) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  doc.setFontSize(20);
  doc.text('Recruiter ROI Report', 20, 20);
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

  // KPIs Section
  doc.setFontSize(14);
  doc.text('Key Performance Indicators', 20, 45);
  
  const kpiData = [
    ['Metric', 'Value'],
    ['Total Views', data.kpis.totalViews],
    ['Total Applications', data.kpis.totalApplications],
    ['Shortlisted', data.kpis.shortlisted],
    ['Selected', data.kpis.selected],
    ['Accepted', data.kpis.accepted],
    ['Offer Acceptance Rate', `${data.kpis.offerAcceptanceRate}%`],
    ['Avg. Match Score', `${data.kpis.avgMatchScore}%`],
    ['Avg. Time-to-Fill', `${data.kpis.avgTimeToFill || 'N/A'} days`]
  ];

  doc.autoTable({
    startY: 50,
    head: [kpiData[0]],
    body: kpiData.slice(1),
    theme: 'striped',
  });

  // Job Performance Section
  const nextY = (doc as any).lastAutoTable.finalY + 20;
  doc.text('Job Performance Ranking', 20, nextY);

  const jobData = [
    ['Job Title', 'Apps', 'Hired', 'Conv. Rate'],
    ...data.jobPerformance.map((j: any) => [j.title, j.applications, j.selected, `${j.conversionRate}%`])
  ];

  doc.autoTable({
    startY: nextY + 5,
    head: [jobData[0]],
    body: jobData.slice(1),
    theme: 'grid',
  });

  doc.save(`${fileName}.pdf`);
};
