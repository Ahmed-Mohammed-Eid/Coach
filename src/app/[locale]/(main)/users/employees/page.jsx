import EmployeesTable from '../../../../../components/users/EmployeesTable';

export default function EmployeesPage({ params: { locale } }) {
    const isRTL = locale === 'ar';
    return (
        <div className="card mb-0">
            <EmployeesTable locale={locale} isRTL={isRTL} />
        </div>
    );
}
