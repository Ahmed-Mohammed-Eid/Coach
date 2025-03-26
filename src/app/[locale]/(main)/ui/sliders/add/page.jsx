import SliderForm from '../../../../../../components/SliderForm/SliderForm';

export default function SliderPage({ params: { locale } }) {
    return (
        <div>
            <SliderForm locale={locale} isRTL={locale === 'ar'} />
        </div>
    );
}
