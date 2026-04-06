import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF with autoTable type
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export type ResumeTemplate = 'classic' | 'modern' | 'sidebar';

export const generateResumePDF = async (data: any, template: ResumeTemplate = 'modern') => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const { personal, education, experience, skills } = data;

  // Configuration based on template
  const config = {
    primaryColor: template === 'modern' ? [0, 98, 255] : [0, 0, 0], // Blue for modern, Black for others
    font: template === 'classic' ? 'times' : 'helvetica',
  };

  doc.setFont(config.font);

  // --- Header ---
  if (template === 'classic' || template === 'modern') {
    doc.setFontSize(24);
    doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
    doc.text(personal.name || 'Your Name', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    const subHeader = `${personal.email} | ${personal.phone} | ${personal.location}`;
    doc.text(subHeader, 105, 28, { align: 'center' });
    
    if (personal.linkedin) {
      doc.text(personal.linkedin, 105, 33, { align: 'center' });
    }

    // Horizontal line
    doc.setDrawColor(230);
    doc.line(20, 38, 190, 38);
  } else if (template === 'sidebar') {
    // Left column background
    doc.setFillColor(245, 247, 250);
    doc.rect(0, 0, 70, 297, 'F');
    
    // Name onto main area
    doc.setFontSize(24);
    doc.setTextColor(0, 6, 19);
    doc.text(personal.name || 'Your Name', 80, 25);
    
    // Contact into sidebar
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text('CONTACT', 15, 60);
    doc.setFontSize(9);
    doc.text(personal.email || '', 15, 68);
    doc.text(personal.phone || '', 15, 74);
    doc.text(personal.location || '', 15, 80);
    
    if (skills && skills.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text('SKILLS', 15, 100);
      let y = 108;
      skills.forEach((s: string) => {
        if (s) {
          doc.setFontSize(9);
          doc.text(`• ${s}`, 15, y);
          y += 6;
        }
      });
    }
  }

  // --- Summary ---
  let startY = template === 'sidebar' ? 35 : 45;
  if (personal.summary) {
    const margin = template === 'sidebar' ? 80 : 20;
    const width = template === 'sidebar' ? 110 : 170;
    
    doc.setFontSize(12);
    doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
    doc.text('PROFESSIONAL SUMMARY', margin, startY);
    
    doc.setFontSize(10);
    doc.setTextColor(60);
    const splitSummary = doc.splitTextToSize(personal.summary, width);
    doc.text(splitSummary, margin, startY + 7);
    startY += (splitSummary.length * 5) + 15;
  }

  // --- Experience ---
  if (experience && experience.length > 0 && experience[0].company) {
    const margin = template === 'sidebar' ? 80 : 20;
    doc.setFontSize(12);
    doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
    doc.text('EXPERIENCE', margin, startY);
    
    doc.autoTable({
      startY: startY + 5,
      margin: { left: margin },
      body: experience.map((exp: any) => [
        { content: `${exp.role}\n${exp.company}`, styles: { fontStyle: 'bold' } },
        { content: exp.duration, styles: { halign: 'right' } },
        { content: exp.description }
      ]),
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30 },
        2: { cellWidth: template === 'sidebar' ? 30 : 80 }
      },
      didParseCell: (dataCell: any) => {
        if (dataCell.column.index === 2) {
          dataCell.cell.styles.fontSize = 8;
          dataCell.cell.styles.textColor = [100, 100, 100];
        }
      }
    });
    startY = (doc as any).lastAutoTable.finalY + 15;
  }

  // --- Education ---
  if (education && education.length > 0 && education[0].school) {
    const margin = template === 'sidebar' ? 80 : 20;
    doc.setFontSize(12);
    doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
    doc.text('EDUCATION', margin, startY);
    
    doc.autoTable({
      startY: startY + 5,
      margin: { left: margin },
      body: education.map((edu: any) => [
        { content: `${edu.school}`, styles: { fontStyle: 'bold' } },
        { content: edu.degree },
        { content: `CGPA: ${edu.cgpa || 'N/A'}`, styles: { halign: 'right' } },
        { content: edu.year, styles: { halign: 'right' } }
      ]),
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 40 }
      }
    });
    startY = (doc as any).lastAutoTable.finalY + 15;
  }

  // Save the PDF
  doc.save(`Resume_${personal.name || 'User'}.pdf`);
};
