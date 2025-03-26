import React from 'react';
import SubscriptionDays from '../../../../../../components/users/sections/SubscriptionDays';

export function page({ params: { id, locale } }) {
    const isRTL = locale === 'ar';

    return (
        <div>
            <SubscriptionDays isRTL={isRTL} clientId={id} />
        </div>
    );
}

export default page;
