import CouponsList from '../components/Coupons/CouponsList/CouponsList';

export default function CouponsPage({ params: { locale } }) {
    return (
        <>
            <div className="container">
                <CouponsList locale={locale} isRTL={locale === 'ar'} />
            </div>
        </>
    );
}
