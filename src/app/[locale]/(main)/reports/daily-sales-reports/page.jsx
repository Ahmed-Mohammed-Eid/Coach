'use client';

import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Skeleton } from 'primereact/skeleton';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import useExportToExcel from '../../../../../hooks/useExportToExcel';

const DailySalesReportPage = ({ params: { locale } }) => {
    const t = useTranslations('dailySales');
    const isRTL = locale === 'ar';
    const [loading, setLoading] = useState(false);
    const [paymentsData, setPaymentsData] = useState([]);
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);
    const [stats, setStats] = useState({
        totalClients: 0,
        totalSubscriptions: 0
    });
    const { generateExcel } = useExportToExcel();

    // Initialize dates on client side only
    useEffect(() => {
        setDateFrom(new Date(new Date().setDate(1))); // First day of current month
        setDateTo(new Date()); // Today
    }, []);

    // Format date for API (MM-DD-YYYY)
    const formatDateForAPI = (date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
    };

    // Fetch data from API
    const fetchPaymentsData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.API_URL}/payments/report`, {
                params: {
                    dateFrom: formatDateForAPI(dateFrom),
                    dateTo: formatDateForAPI(dateTo)
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                setPaymentsData(response.data.payments || []);
            } else {
                toast.error(t('fetchError'));
            }
        } catch (error) {
            console.error('Error fetching payments data:', error);
            toast.error(t('loadingError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (dateFrom && dateTo) {
            fetchPaymentsData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateFrom, dateTo]);

    // Calculate statistics whenever paymentsData changes
    useEffect(() => {
        const totalClients = paymentsData.length;
        const totalSubscriptions = paymentsData.reduce((sum, client) => sum + (client.subscriptions?.length || 0), 0);

        setStats({
            totalClients,
            totalSubscriptions,
        });
    }, [paymentsData]);

    // Export to Excel
    const handleExport = () => {
        if (paymentsData.length === 0) {
            toast.error(t('noDataToExport'));
            return;
        }

        try {
            const excelData = [];

            paymentsData.forEach((client) => {
                // Add a row for each subscription
                client.subscriptions.forEach((subscription) => {
                    excelData.push({
                        'Client Name': client.clientName,
                        'Bundle Name': subscription.bundleName,
                        'Start Date': new Date(subscription.subscriptionStartDate).toLocaleDateString('en-US'),
                        'End Date': new Date(subscription.subscriptionEndDate).toLocaleDateString('en-US'),
                        'Bundle Price': subscription.bundlePrice,
                        'Discount Amount': subscription.discountAmount,
                        'Total Bundle Prices': client.totalBundlePrices,
                        'Total Discounts': client.totalDiscounts,
                        'Net': (client.totalBundlePrices - client.totalDiscounts).toFixed(3)
                    });
                });
            });

            const columns = [
                { header: 'Client Name', accessor: 'Client Name' },
                { header: 'Bundle Name', accessor: 'Bundle Name' },
                { header: 'Start Date', accessor: 'Start Date' },
                { header: 'End Date', accessor: 'End Date' },
                { header: 'Bundle Price', accessor: 'Bundle Price' },
                { header: 'Discount Amount', accessor: 'Discount Amount' },
                { header: 'Total Bundle Prices', accessor: 'Total Bundle Prices' },
                { header: 'Total Discounts', accessor: 'Total Discounts' },
                { header: 'Net', accessor: 'Net' }
            ];

            const dateRange = `${formatDateForAPI(dateFrom)}_to_${formatDateForAPI(dateTo)}`;
            generateExcel(excelData, columns, `Daily_Sales_Report_${dateRange}_`);
            toast.success(t('exportSuccess'));
        } catch (error) {
            console.error('Error exporting data:', error);
            toast.error(t('exportError'));
        }
    };

    // Template for subscriptions - show all subscriptions for a client
    const subscriptionsBodyTemplate = (rowData) => {
        return (
            <div className="flex flex-column gap-2">
                {rowData.subscriptions.map((subscription, index) => (
                    <div key={index} className="p-2 border-round surface-100">
                        <div className="font-semibold mb-1">{subscription.bundleName}</div>
                        <div className="text-sm text-600 flex gap-3">
                            <span>
                                {new Date(subscription.subscriptionStartDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                            <span>→</span>
                            <span>
                                {new Date(subscription.subscriptionEndDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                        <div className="flex gap-3 mt-1 text-sm">
                            <span>
                                {t('price')}: <strong>{subscription.bundlePrice.toFixed(3)} KD</strong>
                            </span>
                            <span>
                                {t('discount')}: <strong>{subscription.discountAmount.toFixed(3)} KD</strong>
                            </span>
                            {/* Net */}
                            <span>
                                {t('net')}: <strong>{(subscription.bundlePrice - subscription.discountAmount).toFixed(3)} KD</strong>
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Template for client name
    const clientNameTemplate = (rowData) => {
        return (
            <div>
                <div className="font-bold text-900">{rowData.clientName}</div>
                <div className="text-sm text-500">{rowData.subscriptions.length} {t('subscription')}</div>
            </div>
        );
    };

    // Template for total bundle prices
    const totalBundlePricesTemplate = (rowData) => {
        return <span className="font-semibold text-blue-600">{rowData.totalBundlePrices.toFixed(3)} KD</span>;
    };

    // Template for total discounts
    const totalDiscountsTemplate = (rowData) => {
        return <span className="font-semibold text-orange-600">{rowData.totalDiscounts.toFixed(3)} KD</span>;
    };

    // Template for net amount
    const netAmountTemplate = (rowData) => {
        return <span className="font-semibold text-green-600">{(rowData.totalBundlePrices - rowData.totalDiscounts).toFixed(3)} KD</span>;
    };

    return (
        <div className="grid" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="col-12">
                <div className="card">
                    <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
                        <h1 className="text-3xl font-bold m-0">{t('title')}</h1>
                        <div className="flex flex-wrap gap-2">
                            <Calendar value={dateFrom} onChange={(e) => setDateFrom(e.value)} dateFormat="mm/dd/yy" placeholder={t('dateFrom')} showIcon />
                            <Calendar value={dateTo} onChange={(e) => setDateTo(e.value)} dateFormat="mm/dd/yy" placeholder={t('dateTo')} showIcon />
                            <Button label={t('fetchReport')} icon="pi pi-search" onClick={fetchPaymentsData} loading={loading} />
                            <Button label={t('export')} icon="pi pi-file-excel" className="p-button-success" onClick={handleExport} disabled={loading || paymentsData.length === 0} />
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid mb-4">
                        <div className="col-12 md:col-6">
                            <div className="card bg-purple-50 border-purple-200">
                                <div className="flex justify-content-between align-items-center">
                                    <div>
                                        <div className="text-500 font-medium mb-2">{t('totalClients')}</div>
                                        <div className="text-2xl font-bold text-purple-600">{stats.totalClients}</div>
                                    </div>
                                    <div className="bg-purple-100 border-circle p-3">
                                        <i className="pi pi-users text-purple-600 text-2xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="card bg-indigo-50 border-indigo-200">
                                <div className="flex justify-content-between align-items-center">
                                    <div>
                                        <div className="text-500 font-medium mb-2">{t('totalSubscriptions')}</div>
                                        <div className="text-2xl font-bold text-indigo-600">{stats.totalSubscriptions}</div>
                                    </div>
                                    <div className="bg-indigo-100 border-circle p-3">
                                        <i className="pi pi-shopping-cart text-indigo-600 text-2xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sales Table */}
                    <div className="card mt-4">
                        <h2 className="text-xl font-bold mb-3">{t('paymentsBreakdown')}</h2>

                        {loading ? (
                            <div className="flex flex-column gap-3">
                                <Skeleton height="100px" />
                                <Skeleton height="100px" />
                                <Skeleton height="100px" />
                            </div>
                        ) : (
                            <DataTable value={paymentsData} showGridlines stripedRows responsiveLayout="scroll" emptyMessage={t('noPaymentsFound')} className="p-datatable-sm">
                                <Column field="clientName" header={t('clientName')} body={clientNameTemplate} style={{ minWidth: '180px' }} sortable />
                                <Column header={t('subscriptions')} body={subscriptionsBodyTemplate} style={{ minWidth: '400px' }} />
                                <Column field="totalBundlePrices" header={t('clientTotal')} body={totalBundlePricesTemplate} style={{ minWidth: '140px' }} sortable />
                                <Column field="totalDiscounts" header={t('clientDiscounts')} body={totalDiscountsTemplate} style={{ minWidth: '150px' }} sortable />
                                <Column field="net" header={t('net')} body={netAmountTemplate} style={{ minWidth: '120px' }} sortable />
                            </DataTable>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailySalesReportPage;
