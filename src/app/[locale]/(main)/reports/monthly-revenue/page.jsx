'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Skeleton } from 'primereact/skeleton';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import useExportToExcel from '../../../../../hooks/useExportToExcel';

const MonthlyRevenuePage = ({ params: { locale } }) => {
    const t = useTranslations('monthlyRevenue');
    const isRTL = locale === 'ar';
    const [loading, setLoading] = useState(false);
    const [revenueData, setRevenueData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const { generateExcel } = useExportToExcel();

    // Format date for API (MM-DD-YYYY)
    const formatDateForAPI = (date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
    };

    // Get first and last day of selected month
    const getMonthRange = useCallback((date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        return {
            dateFrom: formatDateForAPI(firstDay),
            dateTo: formatDateForAPI(lastDay)
        };
    }, []);

    // Fetch data from API
    useEffect(() => {
        const fetchRevenueData = async () => {
            setLoading(true);
            try {
                const { dateFrom, dateTo } = getMonthRange(selectedMonth);

                const response = await axios.get(`${process.env.API_URL}/sales/report`, {
                    params: { dateFrom, dateTo },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data.success) {
                    setRevenueData(response.data.result || []);
                } else {
                    toast.error(t('fetchError'));
                }
            } catch (error) {
                console.error('Error fetching revenue data:', error);
                toast.error(t('loadingError'));
            } finally {
                setLoading(false);
            }
        };

        fetchRevenueData();
    }, [selectedMonth, getMonthRange]);

    // Calculate statistics
    const totalRevenue = revenueData.reduce((sum, client) => sum + (client.totalDatesPrice || 0), 0);
    const totalClients = revenueData.length;
    const averageRevenuePerClient = totalClients > 0 ? totalRevenue / totalClients : 0;
    const uniqueDates = revenueData.length > 0 && revenueData[0].dates ? revenueData[0].dates.length : 0;

    const stats = {
        totalRevenue: totalRevenue.toFixed(3),
        totalClients,
        averageRevenuePerClient: averageRevenuePerClient.toFixed(3),
        totalDays: uniqueDates
    };

    // Get all dates from the first client (assuming all clients have same dates)
    const getDatesArray = () => {
        if (revenueData.length === 0) return [];
        return revenueData[0]?.dates || [];
    };

    const dates = getDatesArray();

    // Format date for column header
    const formatDateHeader = (dateString) => {
        const date = new Date(dateString);
        return date.getDate();
    };

    // Format full date
    const formatFullDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Get day revenue for specific date
    const getDayRevenue = (client, dateIndex) => {
        if (!client.dates || !client.dates[dateIndex]) return 0;
        return client.dates[dateIndex].dayPrice;
    };

    // Calculate daily totals
    const calculateDailyTotal = (dateIndex) => {
        return revenueData.reduce((sum, client) => {
            return sum + getDayRevenue(client, dateIndex);
        }, 0);
    };

    // Cell template for revenue
    const revenueCellTemplate = (value) => {
        const numValue = parseFloat(value) || 0;
        return <span className={`${numValue > 0 ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>{numValue > 0 ? numValue.toFixed(3) : '-'}</span>;
    };

    // Export to Excel (you can enhance this with your existing export utility)
    const handleExport = () => {
        if (revenueData.length === 0) {
            toast.error(t('noDataToExport'));
            return;
        }

        try {
            // Prepare data for Excel
            const excelData = [];
            const dates = getDatesArray();

            // Add each client row
            revenueData.forEach((client) => {
                const row = {
                    'Client Name': client.clientName,
                    'Subscription ID': client.subscriptionId
                };

                // Add daily revenues
                dates.forEach((dateObj, index) => {
                    const dayNumber = new Date(dateObj.date).getDate();
                    row[`Day ${dayNumber}`] = client.dates[index]?.dayPrice || 0;
                });

                // Add total
                row['Total Revenue'] = client.totalDatesPrice;

                excelData.push(row);
            });

            // Add totals row
            const totalsRow = {
                'Client Name': 'DAILY TOTALS',
                'Subscription ID': ''
            };

            dates.forEach((dateObj, index) => {
                const dayNumber = new Date(dateObj.date).getDate();
                const dailyTotal = calculateDailyTotal(index);
                totalsRow[`Day ${dayNumber}`] = dailyTotal;
            });

            totalsRow['Total Revenue'] = stats.totalRevenue;
            excelData.push(totalsRow);

            // Prepare columns
            const columns = [
                { header: 'Client Name', accessor: 'Client Name' },
                { header: 'Subscription ID', accessor: 'Subscription ID' },
                ...dates.map((dateObj) => {
                    const dayNumber = new Date(dateObj.date).getDate();
                    return { header: `Day ${dayNumber}`, accessor: `Day ${dayNumber}` };
                }),
                { header: 'Total Revenue', accessor: 'Total Revenue' }
            ];

            const monthName = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            generateExcel(excelData, columns, `Monthly_Revenue_Report_${monthName}_`);
            toast.success(t('exportSuccess'));
        } catch (error) {
            console.error('Error exporting data:', error);
            toast.error(t('exportError'));
        }
    };

    return (
        <div className="grid" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="col-12">
                <div className="card">
                    <div className="flex justify-content-between align-items-center mb-4">
                        <h1 className="text-3xl font-bold m-0">{t('title')}</h1>
                        <div className="flex gap-2">
                            <Calendar value={selectedMonth} onChange={(e) => setSelectedMonth(e.value)} view="month" dateFormat="MM/yy" placeholder={t('selectMonth')} />
                            <Button label={t('export')} icon="pi pi-file-excel" className="p-button-success" onClick={handleExport} />
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid mb-4">
                        <div className="col-12 md:col-6 lg:col-3">
                            <div className="card bg-blue-50 border-blue-200">
                                <div className="flex justify-content-between align-items-center">
                                    <div>
                                        <div className="text-500 font-medium mb-2">{t('totalRevenue')}</div>
                                        <div className="text-2xl font-bold text-blue-600">{stats.totalRevenue} KD</div>
                                    </div>
                                    <div className="bg-blue-100 border-circle p-3">
                                        <i className="pi pi-dollar text-blue-600 text-2xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-6 lg:col-3">
                            <div className="card bg-green-50 border-green-200">
                                <div className="flex justify-content-between align-items-center">
                                    <div>
                                        <div className="text-500 font-medium mb-2">{t('totalClients')}</div>
                                        <div className="text-2xl font-bold text-green-600">{stats.totalClients}</div>
                                    </div>
                                    <div className="bg-green-100 border-circle p-3">
                                        <i className="pi pi-users text-green-600 text-2xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-6 lg:col-3">
                            <div className="card bg-orange-50 border-orange-200">
                                <div className="flex justify-content-between align-items-center">
                                    <div>
                                        <div className="text-500 font-medium mb-2">{t('avgPerClient')}</div>
                                        <div className="text-2xl font-bold text-orange-600">{stats.averageRevenuePerClient} KD</div>
                                    </div>
                                    <div className="bg-orange-100 border-circle p-3">
                                        <i className="pi pi-chart-line text-orange-600 text-2xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-6 lg:col-3">
                            <div className="card bg-purple-50 border-purple-200">
                                <div className="flex justify-content-between align-items-center">
                                    <div>
                                        <div className="text-500 font-medium mb-2">{t('totalDays')}</div>
                                        <div className="text-2xl font-bold text-purple-600">{stats.totalDays}</div>
                                    </div>
                                    <div className="bg-purple-100 border-circle p-3">
                                        <i className="pi pi-calendar text-purple-600 text-2xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Table */}
                    <div className="card mt-4">
                        <h2 className="text-xl font-bold mb-3">{t('dailyRevenueBreakdown')}</h2>

                        {loading ? (
                            <Skeleton height="400px" />
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table
                                    className="revenue-table"
                                    style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        minWidth: '1200px'
                                    }}
                                >
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th
                                                style={{
                                                    position: 'sticky',
                                                    left: 0,
                                                    backgroundColor: '#f8f9fa',
                                                    padding: '12px',
                                                    border: '1px solid #dee2e6',
                                                    fontWeight: 'bold',
                                                    textAlign: 'left',
                                                    zIndex: 10,
                                                    minWidth: '200px'
                                                }}
                                            >
                                                {t('clientName')}
                                            </th>
                                            {dates.map((dateObj, index) => (
                                                <th
                                                    key={index}
                                                    style={{
                                                        padding: '12px',
                                                        border: '1px solid #dee2e6',
                                                        fontWeight: 'bold',
                                                        textAlign: 'center',
                                                        minWidth: '80px',
                                                        fontSize: '0.875rem'
                                                    }}
                                                >
                                                    <div>{formatDateHeader(dateObj.date)}</div>
                                                    <div
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            fontWeight: 'normal',
                                                            color: '#6c757d'
                                                        }}
                                                    >
                                                        {new Date(dateObj.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                                    </div>
                                                </th>
                                            ))}
                                            <th
                                                style={{
                                                    padding: '12px',
                                                    border: '1px solid #dee2e6',
                                                    fontWeight: 'bold',
                                                    textAlign: 'center',
                                                    backgroundColor: '#e3f2fd',
                                                    minWidth: '100px'
                                                }}
                                            >
                                                {t('total')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {revenueData.map((client, clientIndex) => (
                                            <tr
                                                key={clientIndex}
                                                style={{
                                                    backgroundColor: clientIndex % 2 === 0 ? '#ffffff' : '#f8f9fa'
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        position: 'sticky',
                                                        left: 0,
                                                        backgroundColor: clientIndex % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                                        padding: '12px',
                                                        border: '1px solid #dee2e6',
                                                        fontWeight: '600',
                                                        zIndex: 9
                                                    }}
                                                >
                                                    <div>{client.clientName}</div>
                                                    <div
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            color: '#6c757d'
                                                        }}
                                                    >
                                                        ID: {client.subscriptionId}
                                                    </div>
                                                </td>
                                                {dates.map((dateObj, dateIndex) => {
                                                    const revenue = getDayRevenue(client, dateIndex);
                                                    return (
                                                        <td
                                                            key={dateIndex}
                                                            style={{
                                                                padding: '12px',
                                                                border: '1px solid #dee2e6',
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            {revenueCellTemplate(revenue)}
                                                        </td>
                                                    );
                                                })}
                                                <td
                                                    style={{
                                                        padding: '12px',
                                                        border: '1px solid #dee2e6',
                                                        textAlign: 'center',
                                                        fontWeight: 'bold',
                                                        backgroundColor: '#e3f2fd'
                                                    }}
                                                >
                                                    <span className="text-blue-600">{(client.totalDatesPrice || 0).toFixed(3)}</span>
                                                </td>
                                            </tr>
                                        ))}

                                        {/* Daily Totals Row */}
                                        <tr
                                            style={{
                                                backgroundColor: '#fff3cd',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <td
                                                style={{
                                                    position: 'sticky',
                                                    left: 0,
                                                    backgroundColor: '#fff3cd',
                                                    padding: '12px',
                                                    border: '1px solid #dee2e6',
                                                    zIndex: 9
                                                }}
                                            >
                                                {t('dailyTotals')}
                                            </td>
                                            {dates.map((dateObj, index) => {
                                                const dailyTotal = calculateDailyTotal(index);
                                                return (
                                                    <td
                                                        key={index}
                                                        style={{
                                                            padding: '12px',
                                                            border: '1px solid #dee2e6',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        <span className="text-orange-600">{dailyTotal > 0 ? dailyTotal.toFixed(3) : '-'}</span>
                                                    </td>
                                                );
                                            })}
                                            <td
                                                style={{
                                                    padding: '12px',
                                                    border: '1px solid #dee2e6',
                                                    textAlign: 'center',
                                                    backgroundColor: '#ffc107'
                                                }}
                                            >
                                                <span className="text-white" style={{ fontSize: '1.1rem' }}>
                                                    {stats.totalRevenue}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .revenue-table th,
                .revenue-table td {
                    white-space: nowrap;
                }

                .revenue-table tbody tr:hover {
                    background-color: #e7f3ff !important;
                }

                @media print {
                    .revenue-table {
                        font-size: 10px;
                    }
                }
            `}</style>
        </div>
    );
};

export default MonthlyRevenuePage;
