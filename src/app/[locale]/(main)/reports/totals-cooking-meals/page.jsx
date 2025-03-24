'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';
import useExportToExcel from '../../../../../hooks/useExportToExcel';
import { useComponentPdfGenerator } from '../../../../../hooks/useComponentPdfGenerator';
import ManufacturingReport from './reports/report';
import toast from 'react-hot-toast';

function TotalsCookingMealsReport({ params: { locale } }) {
    // IS RTL
    const isRTL = locale === 'ar';

    const [date, setDate] = useState(new Date());
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const { generateExcel } = useExportToExcel();
    const { generatePdf, isGenerating } = useComponentPdfGenerator({
        filename: 'Manufacturing_Report_' + date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        format: 'a4',
        orientation: 'portrait'
    });

    // Translations
    const translations = {
        en: {
            reportTitle: 'Manufacturing Report',
            chooseDate: 'Choose Date',
            search: 'Search',
            exportPDF: 'Export PDF',
            exportExcel: 'Export Excel',
            noData: 'No data available for the report'
        },
        ar: {
            reportTitle: 'تقرير التصنيع',
            chooseDate: 'اختر التاريخ',
            search: 'بحث',
            exportPDF: 'تصدير PDF',
            exportExcel: 'تصدير Excel',
            noData: 'لا توجد بيانات متاحة للتقرير'
        }
    };

    const t = translations[locale] || translations.en;

    const fetchReport = async () => {
        // TOKEN
        const token = localStorage.getItem('token');

        try {
            setLoading(true);
            // Format date to mm-dd-yyyy
            const formattedDate = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
            const response = await axios.get(`${process.env.API_URL}/report`, {
                params: {
                    date: formattedDate,
                    reportName: 'totalCookingMeals'
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setReportData(response.data);
                toast.success('Report data loaded successfully');
            } else {
                toast.error('Failed to load report data');
            }
        } catch (error) {
            console.error('Error fetching report:', error);
            toast.error(error.message || 'Failed to fetch report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const componentToPdf = () => {
        return <ManufacturingReport reportData={reportData} />;
    };

    const exportToExcel = async () => {
        if (!reportData) {
            toast.error('No data to export');
            return;
        }

        try {
            setExportLoading(true);

            // Transform data for Excel export
            const excelData = reportData.categories.flatMap((category) =>
                category.items.map((item) => ({
                    Category: category.name,
                    Name: item.name,
                    90: item.values[0],
                    120: item.values[1],
                    150: item.values[2],
                    200: item.values[3],
                    Total: item.total,
                    'Total in Grams': item.totalInGrams
                }))
            );

            const columns = [
                { header: 'Category', accessor: 'Category' },
                { header: 'Name', accessor: 'Name' },
                { header: '90', accessor: '90' },
                { header: '120', accessor: '120' },
                { header: '150', accessor: '150' },
                { header: '200', accessor: '200' },
                { header: 'Total', accessor: 'Total' },
                { header: 'Total in Grams', accessor: 'Total in Grams' }
            ];

            const fileName = isRTL ? `تقرير_التصنيع_` : `Manufacturing_Report_`;

            generateExcel(excelData, columns, fileName);
            toast.success('Excel exported successfully');
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            toast.error('Failed to export Excel');
        } finally {
            setExportLoading(false);
        }
    };

    const renderHeader = () => {
        return (
            <div className="grid">
                <div className="col-12 md:col-4">
                    <h5 className="m-0">{t.reportTitle}</h5>
                </div>
                <div className="col-12 md:col-4 flex align-items-center justify-content-center gap-2">
                    <Calendar value={date} onChange={(e) => setDate(e.value)} dateFormat="mm/dd/yy" showIcon placeholder={t.chooseDate} />
                    <Button icon="pi pi-search" severity="primary" onClick={fetchReport} loading={loading} />
                </div>
                <div className="col-12 md:col-4 flex align-items-center justify-content-end gap-2">
                    <Button label={t.exportPDF} icon="pi pi-file-pdf" severity="info" onClick={() => generatePdf(componentToPdf)} loading={isGenerating} disabled={!reportData || loading || isGenerating} />
                    <Button label={t.exportExcel} icon="pi pi-file-excel" severity="success" onClick={exportToExcel} loading={exportLoading} disabled={!reportData || loading || exportLoading} />
                </div>
            </div>
        );
    };

    return (
        <div className="card p-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {renderHeader()}

            <div className="mt-4">
                {loading ? (
                    <div className="flex justify-content-center">
                        <ProgressSpinner />
                    </div>
                ) : reportData ? (
                    <ManufacturingReport reportData={{ ...reportData, date }} />
                ) : (
                    <div className="text-center p-5">
                        <i className="pi pi-info-circle" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
                        <p>{t.noData}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TotalsCookingMealsReport;
