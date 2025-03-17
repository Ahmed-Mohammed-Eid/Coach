'use client';
import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';

// Cohesive color palette
const colors = {
    primary: 'rgba(99, 102, 241, 1)', // Indigo-500
    secondary: 'rgba(236, 72, 153, 1)', // Pink-500
    background: {
        primary: 'rgba(99, 102, 241, 0.2)',
        secondary: 'rgba(236, 72, 153, 0.2)'
    }
};

const CategoriesOverview = ({ categories = [], loading, locale }) => {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const data = {
            labels: categories.map((category) => (locale === 'ar' ? (category.name === 'Packages' ? 'الباقات' : 'الوجبات') : category.name)),
            datasets: [
                {
                    data: categories.map((category) => category.number),
                    backgroundColor: [colors.background.primary, colors.background.secondary],
                    borderColor: [colors.primary, colors.secondary],
                    borderWidth: 2,
                    borderRadius: 8,
                    barThickness: 40
                }
            ]
        };

        const options = {
            maintainAspectRatio: false,
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y || 0;
                            return `${label} ${value}`;
                        }
                    },
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        drawBorder: false,
                        color: 'rgba(200, 200, 200, 0.2)'
                    },
                    ticks: {
                        color: 'var(--surface-600)',
                        font: {
                            weight: '500'
                        },
                        callback: (value) => Math.round(value)
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'var(--surface-600)',
                        font: {
                            weight: '500'
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            responsive: true,
            hover: {
                mode: 'index'
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
            }
        };

        setChartData(data);
        setChartOptions(options);
    }, [categories, locale]);

    if (loading) {
        return (
            <Card className="h-full border-round-2xl" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }}>
                <div className="flex flex-column gap-4">
                    <Skeleton height="2rem" />
                    <Skeleton height="20rem" />
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
                <h3 className="text-xl font-semibold text-900 mb-4 text-center">{locale === 'ar' ? 'إحصائيات الباقات والوجبات' : 'Packages & Meals Statistics'}</h3>
                <div style={{ minHeight: '320px' }} className="flex align-items-center justify-content-center">
                    <Chart type="bar" data={chartData} options={chartOptions} />
                </div>
                <div className="flex justify-content-center gap-4 mt-4">
                    {categories.map((category, index) => (
                        <div key={category.name} className="flex align-items-center gap-2">
                            <div
                                className="w-1rem h-1rem border-round"
                                style={{
                                    backgroundColor: index === 0 ? colors.background.primary : colors.background.secondary,
                                    border: `2px solid ${index === 0 ? colors.primary : colors.secondary}`
                                }}
                            />
                            <span className="text-700 font-medium">
                                {locale === 'ar' ? (category.name === 'Packages' ? 'الباقات' : 'الوجبات') : category.name}: {category.number}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default CategoriesOverview;
