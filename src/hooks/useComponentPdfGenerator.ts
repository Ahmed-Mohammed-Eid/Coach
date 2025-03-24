import { useState, useCallback } from 'react';
import ReactDOMServer from 'react-dom/server';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import React from 'react';

interface UsePdfGeneratorOptions {
    filename?: string;
    format?: 'a4' | 'letter' | 'legal';
    orientation?: 'portrait' | 'landscape';
    margin?: number;
    scale?: number;
}

interface UsePdfGeneratorReturn {
    generatePdf: <T extends object>(Component: React.ComponentType<T>, props?: T) => Promise<void>;
    isGenerating: boolean;
    error: Error | null;
}

export const useComponentPdfGenerator = (options: UsePdfGeneratorOptions = {}): UsePdfGeneratorReturn => {
    const { filename = 'report.pdf', format = 'a4', orientation = 'portrait', margin = 10, scale = 3 } = options;

    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const generatePdf = useCallback(
        async <T extends object>(Component: React.ComponentType<T>, props?: T) => {
            try {
                setIsGenerating(true);
                setError(null);

                // Get dimensions based on format and orientation
                const getPageDimensions = () => {
                    const dimensions = {
                        a4: { width: 210, height: 297 },
                        letter: { width: 216, height: 279 },
                        legal: { width: 216, height: 356 }
                    };

                    const dims = dimensions[format];
                    return orientation === 'portrait' ? { width: dims.width, height: dims.height } : { width: dims.height, height: dims.width };
                };

                const pageDims = getPageDimensions();

                // Create component element with proper types
                const element = React.createElement(Component, props || ({} as T));

                // Render the component to HTML string
                const componentHtml = ReactDOMServer.renderToString(element);

                // Create a temporary container to render the component
                const container = document.createElement('div');
                container.innerHTML = componentHtml;

                // Apply any necessary styles for proper rendering
                container.style.position = 'absolute';
                container.style.left = '-9999px';
                container.style.top = '-9999px';
                document.body.appendChild(container);

                // Wait a bit for any fonts/images to load
                await new Promise((resolve) => setTimeout(resolve, 100));

                // Create PDF of the right size
                const pdf = new jsPDF({
                    format: format,
                    orientation: orientation,
                    unit: 'mm'
                });

                // Calculate the effective page content area
                const pageWidth = pageDims.width - margin * 2;
                const pageHeight = pageDims.height - margin * 2;

                // Capture the component as canvas
                const canvas = await html2canvas(container, {
                    scale: scale,
                    logging: false,
                    useCORS: true,
                    allowTaint: true
                });

                // Calculate the scaled width and total height
                const contentWidth = pageWidth;
                const contentHeight = (canvas.height * contentWidth) / canvas.width;

                // Calculate how many pages we need
                const pageCount = Math.ceil(contentHeight / pageHeight);

                // For each page, add a portion of the image
                for (let i = 0; i < pageCount; i++) {
                    // If it's not the first page, add a new page
                    if (i > 0) {
                        pdf.addPage(format, orientation);
                    }

                    // Calculate the source and destination dimensions for this page slice
                    const sourceY = (i * pageHeight * canvas.width) / contentWidth;
                    const sourceHeight = Math.min((pageHeight * canvas.width) / contentWidth, canvas.height - sourceY);

                    // Skip if there's nothing to draw (might happen on the last page)
                    if (sourceHeight <= 0) continue;

                    // Destination height for this slice
                    const destHeight = (sourceHeight * contentWidth) / canvas.width;

                    // Convert canvas to image data
                    const imgData = canvas.toDataURL('image/png');

                    // Use correct method to draw partial images
                    // Instead of using the extended parameters directly, we'll use the clipToContext approach
                    const imgWidth = canvas.width;
                    const imgHeight = canvas.height;

                    // Create a temporary canvas for the slice
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');

                    if (!tempCtx) {
                        throw new Error('Failed to get 2D context');
                    }

                    tempCanvas.width = imgWidth;
                    tempCanvas.height = sourceHeight;

                    // Draw just the slice we need
                    tempCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);

                    // Get the data for just this slice
                    const sliceImgData = tempCanvas.toDataURL('image/png');

                    // Add the slice to the PDF
                    pdf.addImage(sliceImgData, 'PNG', margin, margin, contentWidth, destHeight);
                }

                // Remove the temporary container
                document.body.removeChild(container);

                // Save the PDF
                pdf.save(filename);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to generate PDF'));
                console.error('PDF generation error:', err);
            } finally {
                setIsGenerating(false);
            }
        },
        [filename, format, orientation, margin, scale]
    );

    return { generatePdf, isGenerating, error };
};
