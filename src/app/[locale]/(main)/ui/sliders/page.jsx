import SliderList from '../../../../../components/SliderList/SliderList';

export default function Slider({ params: { locale } }) {
    return (
        <div>
            <SliderList locale={locale} isRTL={locale === 'ar'} />
        </div>
    );
}
