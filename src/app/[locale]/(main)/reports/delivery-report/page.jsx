'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Accordion, AccordionTab } from 'primereact/accordion';
import axios from 'axios';
import useExportToExcel from '../../../../../hooks/useExportToExcel';
import { useComponentPdfGenerator } from '../../../../../hooks/useComponentPdfGenerator';
import DeliveryReportPdf from './reports/DeliveryReportPdf';

import { ProgressSpinner } from 'primereact/progressspinner';
import toast from 'react-hot-toast';

function DeliveryReport({ params: { locale } }) {
    // IS RTL
    const isRTL = locale === 'ar';

    const [date, setDate] = useState(new Date());
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [pdfFilename, setPdfFilename] = useState('Delivery_Report_' + new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));

    const { generateExcel } = useExportToExcel();
    const { generatePdf, isGenerating } = useComponentPdfGenerator({
        filename: pdfFilename,
        format: 'a4',
        orientation: 'portrait',
        margin: 10,
        scale: 2
    });

    // Translations
    const translations = {
        en: {
            reportTitle: 'Delivery Report',
            chooseDate: 'Choose Date',
            search: 'Search',
            exportAllPDF: 'Export All PDF',
            exportAllExcel: 'Export All Excel',
            exportPDF: 'Export PDF',
            exportExcel: 'Export Excel',
            clientName: 'Client Name',
            phoneNumber: 'Phone Number',
            address: 'Address',
            package: 'Package',
            deliveryNotes: 'Delivery Notes',
            client: 'client',
            clients: 'clients',
            noData: 'No data available for the report',
            pdfReportTitle: 'Delivery Report',
            distributionZone: 'Distribution Zone'
        },
        ar: {
            reportTitle: 'تقرير التوصيل',
            chooseDate: 'اختر التاريخ',
            search: 'بحث',
            exportAllPDF: 'تصدير الكل PDF',
            exportAllExcel: 'تصدير الكل Excel',
            exportPDF: 'تصدير PDF',
            exportExcel: 'تصدير Excel',
            clientName: 'اسم العميل',
            phoneNumber: 'رقم الهاتف',
            address: 'العنوان',
            package: 'الباقة',
            deliveryNotes: 'ملاحظات التوصيل',
            client: 'عميل',
            clients: 'عملاء',
            noData: 'لا توجد بيانات متاحة للتقرير',
            pdfReportTitle: 'تقرير التوصيل',
            distributionZone: 'منطقة التوزيع'
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
                    reportName: 'deliveryReport'
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setReportData(response.data.deliverZones);
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

    // Update PDF filename when date changes
    useEffect(() => {
        const newFilename = isRTL ? `تقرير_التوصيل_` + date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : `Delivery_Report_` + date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        setPdfFilename(newFilename);
    }, [date, isRTL]);

    const exportToPDF = async (zoneData = null) => {
        // If no specific zone data is provided, export all zones
        const dataToExport = zoneData ? [zoneData] : reportData;

        if (!dataToExport || dataToExport.length === 0) {
            toast.error('No data to export');
            return;
        }

        try {
            setExportLoading(true);
            // Prepare data for PDF
            const flatData = dataToExport.flatMap((zone) =>
                zone.clients.map((client) => ({
                    zoneName: zone.zoneName,
                    clientName: client.clientName,
                    phoneNumber: client.phoneNumber,
                    address: `${client.governorate}, ${client.region}, ${client.street}, ${client.building}, ${client.floor}`,
                    bundleName: client.subscripedBundle?.bundleId?.bundleName || '-',
                    deliveryNote: client.mealsPlan?.meals[0]?.deliveryNote || '-'
                }))
            );

            const zoneName = zoneData ? zoneData.zoneName : 'All_Zones';
            const fileName = isRTL
                ? `تقرير_التوصيل_${zoneName}_` + date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : `Delivery_Report_${zoneName}_` + date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

            // Update the filename before generating PDF
            setPdfFilename(fileName);

            // Generate PDF with the component
            await generatePdf(() => <DeliveryReportPdf reportData={flatData} date={date} isRtl={isRTL} t={t} zoneName={zoneData ? zoneData.zoneName : null} />);

            toast.success('PDF exported successfully');
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            toast.error('Failed to export PDF');
        } finally {
            setExportLoading(false);
        }
    };

    const exportToExcel = async (zoneData = null) => {
        // If no specific zone data is provided, export all zones
        const dataToExport = zoneData ? [zoneData] : reportData;

        if (!dataToExport || dataToExport.length === 0) {
            toast.error('No data to export');
            return;
        }

        try {
            setExportLoading(true);
            // Prepare data for Excel
            const flatData = dataToExport.flatMap((zone) =>
                zone.clients.map((client) => ({
                    zoneName: zone.zoneName,
                    clientName: client.clientName,
                    phoneNumber: client.phoneNumber,
                    address: `${client.governorate}, ${client.region}, ${client.street}, ${client.building}, ${client.floor}`,
                    bundleName: client.subscripedBundle?.bundleId?.bundleName || '-',
                    deliveryNote: client.mealsPlan?.meals[0]?.deliveryNote || '-'
                }))
            );

            const columns = [
                { header: isRTL ? 'منطقة التوزيع' : 'Distribution Zone', accessor: 'zoneName' },
                { header: isRTL ? 'اسم العميل' : 'Client Name', accessor: 'clientName' },
                { header: isRTL ? 'رقم الهاتف' : 'Phone Number', accessor: 'phoneNumber' },
                { header: isRTL ? 'العنوان' : 'Address', accessor: 'address' },
                { header: isRTL ? 'الباقة' : 'Package', accessor: 'bundleName' },
                { header: isRTL ? 'ملاحظات التوصيل' : 'Delivery Notes', accessor: 'deliveryNote' }
            ];

            const zoneName = zoneData ? zoneData.zoneName : 'All_Zones';
            const fileName = isRTL ? `تقرير_التوصيل_${zoneName}_` : `Delivery_Report_${zoneName}_`;

            generateExcel(flatData, columns, fileName);
            toast.success('Excel exported successfully');
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            toast.error('Failed to export Excel');
        } finally {
            setExportLoading(false);
        }
    };

    const addressTemplate = (client) => {
        return (
            <span>
                {client.governorate}, {client.region}, {client.street}, {client.building}, {client.floor}
            </span>
        );
    };

    const bundleTemplate = (client) => {
        return client.subscripedBundle?.bundleId?.bundleName || '-';
    };

    const deliveryNoteTemplate = (client) => {
        return client.mealsPlan?.meals[0]?.deliveryNote || '-';
    };

    const renderHeader = () => {
        return (
            <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                <h5 className="m-0">{t.reportTitle}</h5>
                <div className="flex align-items-center gap-2">
                    <Calendar value={date} onChange={(e) => setDate(e.value)} dateFormat="mm/dd/yy" showIcon placeholder={t.chooseDate} />
                    <Button icon="pi pi-search" severity="primary" onClick={fetchReport} loading={loading} />
                </div>
                <div className="flex align-items-center gap-2">
                    <Button label={t.exportAllPDF} icon="pi pi-file-pdf" severity="info" onClick={() => exportToPDF()} loading={exportLoading || isGenerating} disabled={!reportData || loading || exportLoading || isGenerating} />
                    <Button label={t.exportAllExcel} icon="pi pi-file-excel" severity="success" onClick={() => exportToExcel()} loading={exportLoading} disabled={!reportData || loading || exportLoading || isGenerating} />
                </div>
            </div>
        );
    };

    const renderZoneContent = (zone) => {
        return (
            <div className="p-3">
                <div className={`flex ${isRTL ? 'justify-content-start' : 'justify-content-end'} mb-3`}>
                    <Button label={t.exportPDF} icon="pi pi-file-pdf" severity="info" className={isRTL ? 'ml-2' : 'mr-2'} onClick={() => exportToPDF(zone)} loading={exportLoading || isGenerating} disabled={exportLoading || isGenerating} />
                    <Button label={t.exportExcel} icon="pi pi-file-excel" severity="success" onClick={() => exportToExcel(zone)} loading={exportLoading} disabled={exportLoading || isGenerating} />
                </div>
                <DataTable value={zone.clients} rowHover responsiveLayout="scroll" className="p-datatable-sm" emptyMessage={t.noData}>
                    <Column field="clientName" header={t.clientName} />
                    <Column field="phoneNumber" header={t.phoneNumber} />
                    <Column body={addressTemplate} header={t.address} />
                    <Column body={bundleTemplate} header={t.package} />
                    <Column body={deliveryNoteTemplate} header={t.deliveryNotes} />
                </DataTable>
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
                ) : reportData && reportData.length > 0 ? (
                    <Accordion multiple>
                        {reportData.map((zone, index) => (
                            <AccordionTab key={index} header={`${zone.zoneName} (${zone.clients.length} ${zone.clients.length === 1 ? t.client : t.clients})`}>
                                {renderZoneContent(zone)}
                            </AccordionTab>
                        ))}
                    </Accordion>
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

export default DeliveryReport;
