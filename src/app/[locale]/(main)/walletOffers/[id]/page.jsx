import axios from 'axios';
import { cookies } from 'next/headers';
import EditOffer from '../../components/walletOffers/EditOffer';

const getOffer = async (id) => {
    // GET THE TOKEN FROM THE COOKIE
    const token = cookies().get('token');

    if (token?.value) {
        return axios
            .get(`${process.env.API_URL}/wallet/offer?offerId=${id}`, {
                headers: {
                    Authorization: `Bearer ${token.value}`
                },
                next: {
                    revalidate: 0
                }
            })
            .then((response) => {
                return response.data?.offer || {};
            })
            .catch((error) => {
                console.log(error?.response?.data?.message);
            });
    } else {
        console.log('No token found');
    }
};

export default async function EditOfferPage({ params }) {
    // GET THE PACKAGE
    const offerData = await getOffer(params.id);

    return (
        <div className={'card mb-0'}>
            <EditOffer offerData={offerData} id={params.id} locale={params.locale} isRTL={params.locale === 'ar'} />
        </div>
    );
}
