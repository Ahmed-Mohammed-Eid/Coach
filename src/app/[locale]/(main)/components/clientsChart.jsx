'use client';
import { Chart } from 'primereact/chart';
import { useTranslations } from 'next-intl';

export default function ClientsChart({ clients }) {
    const t = useTranslations('DashboardHome');

    return (
        <Chart
            type="pie"
            data={{
                labels: [t('all'), t('active'), t('inactive')],
                datasets: [
                    {
                        label: t('clients'),
                        data: [clients.all, clients.active, clients.inActive],
                        backgroundColor: ['#63c3ff', '#69eb36', '#ff5656']
                    }
                ]
            }}
        />
    );
}
