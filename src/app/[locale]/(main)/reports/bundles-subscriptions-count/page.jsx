'use client';

import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Skeleton } from 'primereact/skeleton';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Chart } from 'primereact/chart';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import useExportToExcel from '../../../../../hooks/useExportToExcel';

const BundlesSubscriptionsCountPage = ({ params: { locale } }) => {
    const t = useTranslations('bundlesSubscriptions');
    const isRTL = locale === 'ar';
    const [loading, setLoading] = useState(false);
    const [bundlesData, setBundlesData] = useState([]);
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);
    const [stats, setStats] = useState({
        totalSubscribers: 0,
        totalBundles: 0
    });
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const { generateExcel } = useExportToExcel();

    // Initialize dates on client side only
    useEffect(() => {
        setDateFrom(new Date(new Date().setDate(1))); // First day of current month
        setDateTo(new Date()); // Today
    }, []);

    // Format date for API (M-D-YYYY)
    const formatDateForAPI = (date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
    };

    // Fetch data from API
    const fetchBundlesData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.API_URL}/bundles/subscriptions/count`, {
                params: {
                    dateFrom: formatDateForAPI(dateFrom),
                    dateTo: formatDateForAPI(dateTo)
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                setBundlesData(response.data.results || []);
            } else {
                toast.error(t('fetchError'));
            }
        } catch (error) {
            console.error('Error fetching bundles data:', error);
            toast.error(t('loadingError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (dateFrom && dateTo) {
            fetchBundlesData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateFrom, dateTo]);

    // Calculate statistics whenever bundlesData changes
    useEffect(() => {
        const totalSubscribers = bundlesData.reduce((sum, bundle) => sum + (bundle.totalSubscribers || 0), 0);
        const totalBundles = bundlesData.length;

        setStats({
            totalSubscribers,
            totalBundles
        });

        // Update chart data
        if (bundlesData.length > 0) {
            const documentStyle = getComputedStyle(document.documentElement);
            const colors = [
                documentStyle.getPropertyValue('--blue-500'),
                documentStyle.getPropertyValue('--purple-500'),
                documentStyle.getPropertyValue('--teal-500'),
                documentStyle.getPropertyValue('--orange-500'),
                documentStyle.getPropertyValue('--pink-500'),
                documentStyle.getPropertyValue('--indigo-500'),
                documentStyle.getPropertyValue('--cyan-500'),
                documentStyle.getPropertyValue('--green-500')
            ];

            setChartData({
                labels: bundlesData.map(bundle => bundle.bundleName),
                datasets: [
                    {
                        label: 'Total Subscribers',
                        data: bundlesData.map(bundle => bundle.totalSubscribers),
                        backgroundColor: colors.slice(0, bundlesData.length),
                        borderColor: colors.slice(0, bundlesData.length),
                        borderWidth: 1
                    }
                ]
            });

            setChartOptions({
                maintainAspectRatio: false,
                aspectRatio: 0.8,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            });
        }
    }, [bundlesData]);

    // Export to Excel
    const handleExport = () => {
        if (bundlesData.length === 0) {
            toast.error(t('noDataToExport'));
            return;
        }

        try {
            const excelData = bundlesData.map((bundle) => ({
                'Bundle Name': bundle.bundleName,
                'Total Subscribers': bundle.totalSubscribers
            }));

            const columns = [
                { header: 'Bundle Name', accessor: 'Bundle Name' },
                { header: 'Total Subscribers', accessor: 'Total Subscribers' }
            ];

            const dateRange = `${formatDateForAPI(dateFrom)}_to_${formatDateForAPI(dateTo)}`;
            generateExcel(excelData, columns, `Bundles_Subscriptions_Count_${dateRange}_`);
            toast.success(t('exportSuccess'));
        } catch (error) {
            console.error('Error exporting data:', error);
            toast.error(t('exportError'));
        }
    };

    // Template for bundle name
    const bundleNameTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-box text-2xl text-primary"></i>
                <span className="font-semibold text-900">{rowData.bundleName}</span>
            </div>
        );
    };

    // Template for total subscribers
    const totalSubscribersTemplate = (rowData) => {
        const maxSubscribers = Math.max(...bundlesData.map(b => b.totalSubscribers));
        const percentage = maxSubscribers > 0 ? (rowData.totalSubscribers / maxSubscribers) * 100 : 0;

        return (
            <div className="flex align-items-center gap-3">
                <span className="font-bold text-2xl text-primary">{rowData.totalSubscribers}</span>
                <div className="flex-1">
                    <div className="bg-primary-100 border-round overflow-hidden" style={{ height: '8px', minWidth: '100px' }}>
                        <div className="bg-primary h-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>
            </div>
        );
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
                            <Button label={t('fetchReport')} icon="pi pi-search" onClick={fetchBundlesData} loading={loading} />
                            <Button label={t('export')} icon="pi pi-file-excel" className="p-button-success" onClick={handleExport} disabled={loading || bundlesData.length === 0} />
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid mb-4">
                        <div className="col-12 md:col-6">
                            <div className="card bg-blue-50 border-blue-200">
                                <div className="flex justify-content-between align-items-center">
                                    <div>
                                        <div className="text-500 font-medium mb-2">{t('totalSubscribers')}</div>
                                        <div className="text-2xl font-bold text-blue-600">{stats.totalSubscribers}</div>
                                    </div>
                                    <div className="bg-blue-100 border-circle p-3">
                                        <i className="pi pi-users text-blue-600 text-2xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="card bg-purple-50 border-purple-200">
                                <div className="flex justify-content-between align-items-center">
                                    <div>
                                        <div className="text-500 font-medium mb-2">{t('totalBundles')}</div>
                                        <div className="text-2xl font-bold text-purple-600">{stats.totalBundles}</div>
                                    </div>
                                    <div className="bg-purple-100 border-circle p-3">
                                        <i className="pi pi-box text-purple-600 text-2xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    {!loading && bundlesData.length > 0 && (
                        <div className="card mb-4">
                            <h2 className="text-xl font-bold mb-3">{t('subscriptionsByBundle')}</h2>
                            <Chart type="bar" data={chartData} options={chartOptions} style={{ height: '400px' }} />
                        </div>
                    )}

                    {/* Bundles Table */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-3">{t('bundlesBreakdown')}</h2>

                        {loading ? (
                            <div className="flex flex-column gap-3">
                                <Skeleton height="60px" />
                                <Skeleton height="60px" />
                                <Skeleton height="60px" />
                            </div>
                        ) : (
                            <DataTable value={bundlesData} showGridlines stripedRows responsiveLayout="scroll" emptyMessage={t('noBundlesFound')} className="p-datatable-sm" sortField="totalSubscribers" sortOrder={-1}>
                                <Column field="bundleName" header={t('bundleName')} body={bundleNameTemplate} style={{ minWidth: '250px' }} sortable />
                                <Column field="totalSubscribers" header={t('totalSubscribers')} body={totalSubscribersTemplate} style={{ minWidth: '300px' }} sortable />
                            </DataTable>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BundlesSubscriptionsCountPage;
