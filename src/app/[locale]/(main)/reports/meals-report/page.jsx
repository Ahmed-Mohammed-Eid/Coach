import MealsReportTable from '../../components/MealsReportTable';

export default async function Packages({ params: { locale } }) {
    return (
        <div className={'card mb-0'}>
            <MealsReportTable locale={locale} isRTL={locale === 'ar'} />
        </div>
    );
}
