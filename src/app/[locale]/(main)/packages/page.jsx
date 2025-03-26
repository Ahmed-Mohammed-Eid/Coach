import PackagesTable from '../../../../components/PackagesTable';

export default async function Packages({ params: { locale } }) {
    return (
        <div className={'card mb-0'}>
            <PackagesTable locale={locale} />
        </div>
    );
}
