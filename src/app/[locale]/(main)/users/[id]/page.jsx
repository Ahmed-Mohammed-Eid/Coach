import EditEmployeeContent from '../../components/EditEmployeeContent/EditEmployeeContent';
import axios from 'axios';
import { cookies } from 'next/headers';

const getEmployee = async (id) => {
    // GET THE TOKEN FROM THE COOKIE
    const token = cookies().get('token');

    if (token?.value) {
        return axios
            .get(`${process.env.API_URL}/get/user?userId=${id}`, {
                headers: {
                    Authorization: `Bearer ${token.value}`
                },
                next: {
                    revalidate: 0
                }
            })
            .then((response) => {
                return response.data?.user || {};
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
    const employeeData = await getEmployee(params.id);

    return <EditEmployeeContent employee={employeeData} id={params.id} locale={params.locale} isRTL={params.locale === 'ar'} />;
}
