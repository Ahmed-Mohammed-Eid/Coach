import DayboxesTable from '../../../../components/DayboxesTable';

export default function DayboxPage({ params: { locale } }) {
    return (
        <div className={'card mb-0'}>
            <DayboxesTable locale={locale} isRTL={locale === 'ar'} />
        </div>
    );
}
