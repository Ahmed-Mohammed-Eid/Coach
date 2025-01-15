import FlexBundleComponent from '../../components/flexBundle/FlexBundleComponent';

export default function FlexBundlePage({ params: { locale } }) {
    return <FlexBundleComponent locale={locale} />;
}
