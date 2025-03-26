'use client';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useTranslations } from 'next-intl';

export default function BestSelling({ packages, locale }) {
    const t = useTranslations('DashboardHome');
    const isRTL = locale === 'ar';

    return (
        <DataTable value={packages} style={{ width: '100%' }} dir={isRTL ? 'rtl' : 'ltr'}>
            <Column field="bundleName" header={t('name')}></Column>
            <Column field="bundlePrice" header={t('price')}></Column>
            <Column field="snacksNumber" header={t('snacks')}></Column>
            <Column
                field="fridayOption"
                header={t('fridays')}
                body={(rowData) => {
                    return <span className="text-center font-bold">{rowData.fridayOption ? t('yes') : t('no')}</span>;
                }}
            ></Column>
        </DataTable>
    );
}
