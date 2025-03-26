'use client';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useTranslations } from 'next-intl';

export default function CategoriesNumber({ categories }) {
    const t = useTranslations('DashboardHome');

    return (
        <DataTable value={categories} style={{ width: '100%' }}>
            <Column field="name" header={t('name')}></Column>
            <Column
                field="number"
                header={t('number')}
                body={(rowData) => {
                    return <span className="text-center font-bold">{rowData.number}</span>;
                }}
            ></Column>
        </DataTable>
    );
}
