import WalletOffersTable from '../components/walletOffers/WalletsTable';

export default async function Packages({ params: { locale } }) {
    return (
        <div className={'card mb-0'}>
            <WalletOffersTable locale={locale} isRTL={locale === 'ar'} />
        </div>
    );
}
