import MealsTable from '../components/MealsTable';

export default async function Packages({ params: { locale } }) {
    return (
        <div className={'card mb-0'}>
            <MealsTable locale={locale} isRTL={locale === 'ar'} />
        </div>
    );
}
