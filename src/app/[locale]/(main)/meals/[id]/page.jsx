import EditMealContent from '../../components/EditMealContent/EditMealContent';
import axios from 'axios';
import { cookies } from 'next/headers';

const getMeal = async (id) => {
    // GET THE TOKEN FROM THE COOKIE
    const token = cookies().get('token');

    if (token?.value) {
        return axios
            .get(`${process.env.API_URL}/get/meal?mealId=${id}`, {
                headers: {
                    Authorization: `Bearer ${token.value}`
                },
                next: {
                    revalidate: 0
                }
            })
            .then((response) => {
                return response.data?.meal || {};
            })
            .catch((error) => {
                console.log(error?.response?.data?.message);
            });
    } else {
        console.log('No token found');
    }
};

export default async function EditMeal({ params }) {
    // GET THE PACKAGE
    const packageData = await getMeal(params.id);

    return <EditMealContent meal={packageData} id={params.id} locale={params.locale} isRTL={params.locale === 'ar'} />;
}
