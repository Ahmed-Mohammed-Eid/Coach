import UserProfile from '../../../components/users/UserProfile';

export default function ViewUser({ params: { id, locale } }) {
    return <UserProfile id={id} locale={locale} />;
}
