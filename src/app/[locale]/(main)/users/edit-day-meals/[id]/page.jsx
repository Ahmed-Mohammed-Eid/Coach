import React from 'react';
import ChangeDayMealsClient from '../../../../../../components/users/sections/ChangeDayMealsClient';

function EditDayMealsPage({ params: { id, locale } }) {
    const isRTL = locale === 'ar';

    return <ChangeDayMealsClient isRTL={isRTL} id={id} />;
}

export default EditDayMealsPage;
