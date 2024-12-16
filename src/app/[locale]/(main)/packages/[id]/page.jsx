import EditPackageContent from '../../components/EditPackageContent/EditPackageContent';
import axios from 'axios';
import { cookies } from 'next/headers';

const getPackage = async (id) => {
    // GET THE TOKEN FROM THE COOKIE
    const token = cookies().get('token');

    if (token?.value) {
        return axios
            .get(`${process.env.API_URL}/get/bundle?bundleId=${id}`, {
                headers: {
                    Authorization: `Bearer ${token.value}`
                },
                next: {
                    revalidate: 0
                }
            })
            .then((response) => {
                return response.data?.bundle || {};
            })
            .catch((error) => {
                console.log(error?.response?.data?.message);
            });
    } else {
        console.log('No token found');
    }
};

export default async function EditPackage({ params }) {
    // GET THE PACKAGE
    const packageData = await getPackage(params.id);
    const locale = params.locale;

    return <EditPackageContent bundle={packageData} id={params.id} locale={locale} />;
}
