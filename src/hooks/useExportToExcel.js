'use client';

import React from 'react';
import { utils, writeFile } from 'xlsx';

const useExportToExcel = () => {
    const generateExcel = (data, columns, outputName = 'report') => {
        // Prepare the header row
        const header = columns.map((column) => column.header);

        // Prepare the data rows
        const rows = data.map((row) => {
            return columns.map((column) => row[column.accessor]);
        });

        // Combine header and data
        const worksheetData = [header, ...rows];

        // Create a worksheet
        const worksheet = utils.aoa_to_sheet(worksheetData);

        // Create a workbook and add the worksheet
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        // Prepare the output filename
        let updatedOutputName = outputName || 'report';
        updatedOutputName = updatedOutputName.replace(/ /g, '_');
        const date = new Date().toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: '2-digit'
        });
        const formattedDate = date.replace(/ /g, '_');
        updatedOutputName += formattedDate;

        // Generate the Excel file
        writeFile(workbook, `${updatedOutputName}.xlsx`);
    };

    return { generateExcel };
};

export default useExportToExcel;
