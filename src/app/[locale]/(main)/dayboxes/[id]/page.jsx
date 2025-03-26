import EditBoxContent from '../../../../../components/EditBoxContent/EditBoxContent';
import { cookies } from 'next/headers';
import axios from 'axios';
// REVALIDATE THE DATA EVERY 0 SECONDS

const getBox = async (id) => {
    // GET THE TOKEN FROM THE COOKIE
    const token = cookies().get('token');

    if (token?.value) {
        return axios
            .get(`${process.env.API_URL}/box?boxId=${id}`, {
                headers: {
                    Authorization: `Bearer ${token.value}`
                },
                next: {
                    revalidate: 0
                }
            })
            .then((response) => {
                return response.data?.box || {};
            })
            .catch((error) => {
                console.log(error?.response?.data?.message);
            });
    } else {
        console.log('No token found');
    }
};

export default async function EditBox({ params }) {
    // GET THE BOX ID FROM THE PARAMS
    const { id, locale } = params;
    // GET THE BOX
    const box = await getBox(id);

    return <EditBoxContent boxData={box} id={id} locale={locale} isRTL={locale === 'ar'} />;
}
