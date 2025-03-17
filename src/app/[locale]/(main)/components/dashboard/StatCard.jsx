'use client';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';

// Cohesive color palette
const colors = {
    primary: {
        main: 'rgba(99, 102, 241, 1)', // Indigo-500
        light: 'rgba(99, 102, 241, 0.1)',
        gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)'
    },
    success: {
        main: 'rgba(34, 197, 94, 1)', // Green-500
        light: 'rgba(34, 197, 94, 0.1)',
        gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)'
    },
    warning: {
        main: 'rgba(234, 179, 8, 1)', // Yellow-500
        light: 'rgba(234, 179, 8, 0.1)',
        gradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(234, 179, 8, 0.05) 100%)'
    },
    help: {
        main: 'rgba(236, 72, 153, 1)', // Pink-500
        light: 'rgba(236, 72, 153, 0.1)',
        gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)'
    }
};

const StatCard = ({ icon, title, value, trend, trendValue, loading, className }) => {
    const colorSet = colors[icon.color] || colors.primary;

    if (loading) {
        return (
            <Card className={`h-full border-round-2xl ${className}`} style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }}>
                <div className="flex flex-column gap-3">
                    <Skeleton height="2rem" width="50%" />
                    <Skeleton height="3rem" width="30%" />
                    <Skeleton height="1.5rem" width="40%" />
                </div>
            </Card>
        );
    }

    return (
        <Card
            className={`h-full border-round-2xl transform transition-all duration-300 ${className}`}
            style={{
                background: colorSet.gradient,
                border: 'none',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
            }}
            pt={{
                root: { className: 'hover:shadow-lg hover:-translate-y-1' }
            }}
        >
            <div className="flex justify-content-between align-items-start">
                <div className="flex flex-column gap-2">
                    <span className="text-700 text-lg font-medium">{title}</span>
                    <span className="text-900 text-4xl font-bold mb-2">{value}</span>
                    {trend && (
                        <div className="flex align-items-center gap-2">
                            <span className={`px-2 py-1 border-round-lg font-medium ${trend === 'up' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                <i className={`pi ${trend === 'up' ? 'pi-arrow-up' : 'pi-arrow-down'} mr-1`}></i>
                                {trendValue}
                            </span>
                        </div>
                    )}
                </div>
                <div
                    className="border-round-xl p-3 transition-colors transition-duration-300"
                    style={{
                        backgroundColor: colorSet.light,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <i className={`pi ${icon.name} text-3xl`} style={{ color: colorSet.main }}></i>
                </div>
            </div>
        </Card>
    );
};

export default StatCard;
