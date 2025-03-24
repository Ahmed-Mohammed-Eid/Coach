import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { font } from './fonts/Amiri-Regular';

interface Column {
    header: string;
    dataKey: string;
    align?: 'left' | 'center' | 'right';
}

interface DataItem {
    [key: string]: string | number | undefined;
}

interface Position {
    x: number;
    y: number;
}

const useExportToPDF = () => {
    const generatePDF = async (data: DataItem[], columns: Column[], outputName: string, reportTitle: string = 'تقرير العملاء', headerposition: Position = { x: 165, y: 15 }, datePosition: Position = { x: 15, y: 15 }): Promise<boolean> => {
        try {
            // Create a new jsPDF instance
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Add the font
            doc.addFileToVFS('Amiri-Regular.ttf', font);
            doc.addFont('Amiri-Regular.ttf', 'Amiri-Regular', 'normal');
            doc.setFont('Amiri-Regular');

            // Add the title
            doc.setFontSize(20);
            // if text is RTL make the text align right
            doc.text(reportTitle, headerposition.x, headerposition.y, { align: 'right' });

            // GET THE DATE
            const date = new Date().toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: '2-digit'
            });

            // ADD STYLE TO THE TEXT
            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text(`التاريخ: ${date}`, datePosition.x, datePosition.y);

            // Create a table structure from the data
            const tableHeaders = columns.map((col) => col.header);
            const tableRows = data.map((item) => columns.map((col) => item[col.dataKey] || ''));

            // Use autoTable directly
            autoTable(doc, {
                head: [tableHeaders],
                body: tableRows,
                startY: 20,
                styles: {
                    font: 'Amiri-Regular',
                    fontSize: 10
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [240, 240, 240]
                },
                margin: { top: 20 },
                didParseCell: (dataCell) => {
                    const column = columns[dataCell.column.index];
                    if (column && column.align === 'right') {
                        dataCell.cell.styles.halign = 'right';
                        dataCell.cell.styles.font = 'Amiri-Regular';
                    }
                }
            });

            // Save the PDF
            let updatedOutputName = outputName || 'report';
            updatedOutputName = updatedOutputName.replace(/ /g, '_');
            updatedOutputName =
                updatedOutputName +
                new Date().toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit'
                });
            doc.save(updatedOutputName + '.pdf');

            return true;
        } catch (error) {
            console.error('Error generating PDF:', error);
            return false;
        }
    };

    return { generatePDF };
};

export default useExportToPDF;
