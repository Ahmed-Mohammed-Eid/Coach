'use client';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Badge } from 'primereact/badge';
import { Skeleton } from 'primereact/skeleton';

// Cohesive color palette
const colors = {
    primary: 'rgba(99, 102, 241, 1)', // Indigo-500
    success: 'rgba(34, 197, 94, 1)', // Green-500
    warning: 'rgba(234, 179, 8, 1)', // Yellow-500
    background: {
        primary: 'rgba(99, 102, 241, 0.1)',
        success: 'rgba(34, 197, 94, 0.1)',
        warning: 'rgba(234, 179, 8, 0.1)'
    }
};

const rankColors = {
    0: {
        severity: 'success',
        icon: 'pi-trophy',
        color: colors.success
    },
    1: {
        severity: 'info',
        icon: 'pi-star-fill',
        color: colors.primary
    },
    2: {
        severity: 'warning',
        icon: 'pi-star',
        color: colors.warning
    }
};

const BestSellingOverview = ({ packages = [], loading, locale }) => {
    const isRTL = locale === 'ar';
    const rankTemplate = (rowData) => {
        const rank = packages.indexOf(rowData);
        const rankStyle = rankColors[rank] || {
            severity: 'secondary',
            icon: 'pi-circle-fill',
            color: 'var(--surface-500)'
        };

        return (
            <div className="flex align-items-center gap-2">
                <Badge value={rank + 1} size="large" severity={rankStyle.severity} className="transform transition-transform duration-200 hover:scale-110" />
                <i className={`pi ${rankStyle.icon} text-xl`} style={{ color: rankStyle.color }}></i>
            </div>
        );
    };

    const nameTemplate = (rowData) => (
        <div className="flex flex-column">
            <span className="font-semibold text-900 mb-1">{isRTL ? rowData.bundleName : rowData.bundleNameEn}</span>
        </div>
    );

    const priceTemplate = (rowData) => (
        <div className="flex align-items-center">
            <span
                className="px-3 py-1 border-round-xl font-medium"
                style={{
                    backgroundColor: colors.background.success,
                    color: colors.success
                }}
            >
                {rowData.periodPrices?.map((price) => price.price).join(' / ')}
            </span>
        </div>
    );

    if (loading) {
        return (
            <Card className="h-full border-round-2xl" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }}>
                <div className="flex flex-column gap-3">
                    <Skeleton height="2rem" className="mb-2" />
                    <Skeleton height="3rem" count={5} className="mb-2" />
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
            <DataTable
                value={packages || []}
                className="p-datatable-sm"
                emptyMessage={locale === 'ar' ? 'لا توجد بيانات' : 'No data available'}
                rows={5}
                scrollable
                scrollHeight="400px"
                rowHover
                stripedRows
                showGridlines={false}
                pt={{
                    wrapper: {
                        className: 'overflow-hidden border-round-xl'
                    },
                    headerCell: {
                        className: 'text-center text-700 font-semibold'
                    },
                    bodyCell: {
                        className: 'text-center'
                    }
                }}
                style={{
                    '--data-table-cell-padding': '8px'
                }}
            >
                <Column header={locale === 'ar' ? 'الترتيب' : 'Rank'} body={rankTemplate} style={{ width: '8rem' }} headerStyle={{ backgroundColor: colors.background.primary }} />
                <Column field="name" header={locale === 'ar' ? 'الاسم' : 'Name'} body={nameTemplate} headerStyle={{ backgroundColor: colors.background.primary }} />
                <Column field="price" header={locale === 'ar' ? 'السعر' : 'Price'} body={priceTemplate} style={{ width: '12rem' }} headerStyle={{ backgroundColor: colors.background.primary }} />
            </DataTable>
        </Card>
    );
};

export default BestSellingOverview;
