import CouponsAddForm from '../../../../../components/Coupons/CouponsAddForm/CouponsAddForm';

export default function AddCouponsPage({ params: { locale } }) {
    return <CouponsAddForm locale={locale} isRTL={locale === 'ar'} />;
}
