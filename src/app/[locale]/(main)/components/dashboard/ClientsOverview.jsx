'use client';
import { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';

// Cohesive color palette
const chartColors = {
    primary: 'rgba(99, 102, 241, 1)', // Indigo-500
    secondary: 'rgba(236, 72, 153, 1)', // Pink-500
    background: {
        primary: 'rgba(99, 102, 241, 0.2)',
        secondary: 'rgba(236, 72, 153, 0.2)'
    }
};

const ClientsOverview = ({ data: clientsData, loading, locale }) => {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const chartDataConfig = {
            labels: [locale === 'ar' ? 'نشط' : 'Active', locale === 'ar' ? 'غير نشط' : 'Inactive'],
            datasets: [
                {
                    data: [clientsData?.active || 0, clientsData?.inActive || 0],
                    backgroundColor: [chartColors.primary, chartColors.secondary],
                    hoverBackgroundColor: ['rgba(99, 102, 241, 0.8)', 'rgba(236, 72, 153, 0.8)'],
                    borderWidth: 0,
                    hoverOffset: 8
                }
            ]
        };

        const options = {
            cutout: '70%',
            radius: '90%',
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 800,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 14,
                            weight: '500'
                        },
                        color: 'var(--surface-700)'
                    }
                },
                title: {
                    display: true,
                    text: locale === 'ar' ? 'إجمالي العملاء: ' + (clientsData?.all || 0) : 'Total Clients: ' + (clientsData?.all || 0),
                    font: {
                        size: 16,
                        weight: '600'
                    },
                    padding: {
                        bottom: 24
                    },
                    color: 'var(--surface-700)'
                }
            }
        };

        setChartData(chartDataConfig);
        setChartOptions(options);
    }, [clientsData, locale]);

    if (loading) {
        return (
            <Card className="h-full border-round-2xl" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }}>
                <div className="flex flex-column gap-3">
                    <Skeleton height="300px" className="mb-2" />
                    <div className="flex justify-content-between">
                        <Skeleton width="4rem" height="2rem" />
                        <Skeleton width="4rem" height="2rem" />
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card
            className="h-full border-round-2xl transition-all duration-300"
            style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }}
            pt={{
                root: { className: 'hover:shadow-lg' }
            }}
        >
            <div className="flex flex-column">
                <div className="flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
                    <Chart type="doughnut" data={chartData} options={chartOptions} className="w-full md:w-30rem" />
                </div>
                <div className="flex justify-content-center gap-5 mt-4">
                    <div className="flex align-items-center gap-2">
                        <div className="w-1rem h-1rem border-round" style={{ backgroundColor: chartColors.primary }} />
                        <span className="text-700 font-medium">
                            {Math.round((clientsData?.active / clientsData?.all || 0) * 100)}% {locale === 'ar' ? 'نشط' : 'Active'}
                        </span>
                    </div>
                    <div className="flex align-items-center gap-2">
                        <div className="w-1rem h-1rem border-round" style={{ backgroundColor: chartColors.secondary }} />
                        <span className="text-700 font-medium">
                            {Math.round((clientsData?.inActive / clientsData?.all || 0) * 100)}% {locale === 'ar' ? 'غير نشط' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ClientsOverview;
