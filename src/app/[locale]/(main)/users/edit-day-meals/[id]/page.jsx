import React from 'react';
import SubscriptionDays from '../../../../../../components/users/sections/SubscriptionDays';

function EditDayMealsPage({ params: { id, locale } }) {
    const isRTL = locale === 'ar';

    return (
        <div>
            <SubscriptionDays isRTL={isRTL} clientId={id} />
        </div>
    );
}

export default EditDayMealsPage;
