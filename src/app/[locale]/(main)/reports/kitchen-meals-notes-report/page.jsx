'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import useExportToExcel from '../../../../../hooks/useExportToExcel';
import { useComponentPdfGenerator } from '../../../../../hooks/useComponentPdfGenerator';
import KichenMealsNotesPdfReport from './reports/KichenMealsNotesPdfReport';

import { ProgressSpinner } from 'primereact/progressspinner';
import toast from 'react-hot-toast';

function KitchenMealsNotesReport({ params: { locale } }) {
    // IS RTL
    const isRTL = locale === 'ar';

    const [date, setDate] = useState(new Date());
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const { generateExcel } = useExportToExcel();
    const { generatePdf, isGenerating, error } = useComponentPdfGenerator({
        filename: 'Kitchen_Meals_Notes_Report' + date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        format: 'a4',
        orientation: 'portrait',
        margin: 10,
        scale: 2
    });

    // Translations
    const translations = {
        en: {
            reportTitle: 'Kitchen Meals Notes Report',
            chooseDate: 'Choose Date',
            search: 'Search',
            exportPDF: 'Export PDF',
            exportExcel: 'Export Excel',
            customerName: 'Customer Name',
            mealTitle: 'Meal Title',
            mealNote: 'Meal Note',
            noData: 'No data available for the report',
            pdfReportTitle: 'Kitchen Meals Notes Report'
        },
        ar: {
            reportTitle: 'تقرير ملاحظات وجبات المطبخ',
            chooseDate: 'اختر التاريخ',
            search: 'بحث',
            exportPDF: 'تصدير PDF',
            exportExcel: 'تصدير Excel',
            customerName: 'اسم العميل',
            mealTitle: 'عنوان الوجبة',
            mealNote: 'ملاحظة الوجبة',
            noData: 'لا توجد بيانات متاحة للتقرير',
            pdfReportTitle: 'تقرير ملاحظات وجبات المطبخ'
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
                    reportName: 'mealsNotes'
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setReportData(response.data.clients);
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
        return <KichenMealsNotesPdfReport reportData={reportData} date={date} isRtl={isRTL} t={t} />;
    };

    const exportToExcel = async () => {
        if (!reportData || reportData.length === 0) {
            toast.error('No data to export');
            return;
        }

        try {
            setExportLoading(true);

            const columns = [
                { header: isRTL ? 'اسم العميل' : 'Customer Name', accessor: 'customerName' },
                { header: isRTL ? 'عنوان الوجبة' : 'Meal Title', accessor: 'mealTitle' },
                { header: isRTL ? 'ملاحظة الوجبة' : 'Meal Note', accessor: 'mealNote' }
            ];

            const fileName = isRTL ? `تقرير_ملاحظات_وجبات_المطبخ_` : `Kitchen_Meals_Notes_Report_`;

            generateExcel(reportData, columns, fileName);
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
                    {/* PDF */}
                    <Button label={t.exportPDF} icon="pi pi-file-pdf" severity="info" onClick={() => generatePdf(componentToPdf)} />
                    <Button label={t.exportExcel} icon="pi pi-file-excel" severity="success" onClick={exportToExcel} loading={exportLoading} disabled={!reportData || loading || exportLoading} />
                </div>
            </div>
        );
    };

    const mealNoteTemplate = (rowData) => {
        if (!rowData.mealNote || rowData.mealNote.trim() === '') {
            return <span className="text-color-secondary">-</span>;
        }
        return <span>{rowData.mealNote}</span>;
    };

    return (
        <div className="card p-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {renderHeader()}

            <div className="mt-4">
                {loading ? (
                    <div className="flex justify-content-center">
                        <ProgressSpinner />
                    </div>
                ) : reportData && reportData.length > 0 ? (
                    <DataTable
                        value={reportData}
                        rowHover
                        responsiveLayout="stack"
                        breakpoint="960px"
                        className="p-datatable-sm"
                        emptyMessage={t.noData}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate={isRTL ? '{الإجمالي} من {first}-{last}' : '{first}-{last} of {totalRecords}'}
                    >
                        <Column field="customerName" header={t.customerName} sortable />
                        <Column field="mealTitle" header={t.mealTitle} sortable />
                        <Column field="mealNote" header={t.mealNote} body={mealNoteTemplate} />
                    </DataTable>
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

export default KitchenMealsNotesReport;
