import { cookies } from 'next/headers';
import axios from 'axios';
import Wallets from '../../../components/Wallets';

const getUserWallet = async (id) => {
    // GET THE TOKEN FROM THE COOKIE
    const token = cookies().get('token');

    if (token?.value) {
        return axios
            .get(`${process.env.API_URL}/show/client/wallet?clientId=${id}`, {
                headers: {
                    Authorization: `Bearer ${token.value}`
                },
                next: {
                    revalidate: 0
                }
            })
            .then((response) => {
                return response.data?.wallet || {};
            })
            .catch((error) => {
                console.log(error?.response?.data?.message);
            });
    } else {
        console.log('No token found');
    }
};

export default async function WalletPage({ params }) {
    const walletData = await getUserWallet(params.id);

    return (
        <div>
            <Wallets wallet={walletData} id={params.id} locale={params.locale} isRTL={params.locale === 'ar'} />
        </div>
    );
}
