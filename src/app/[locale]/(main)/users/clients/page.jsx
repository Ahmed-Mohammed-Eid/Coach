import ClientsTable from '../../../../../components/users/ClientsTable';

export default function ClientsPage({ params: { locale } }) {
    const isRTL = locale === 'ar';
    return (
        <div className="card mb-0">
            <ClientsTable locale={locale} isRTL={isRTL} />
        </div>
    );
}
