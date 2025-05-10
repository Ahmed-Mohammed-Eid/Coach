'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Chips } from 'primereact/chips';
import { Button } from 'primereact/button';
import axios from 'axios';
import toast from 'react-hot-toast';

function DeliveryPeriodsPage({ params: { locale } }) {
    const isRTL = locale === 'ar';
    const t = useTranslations('deliveryPeriods');
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDeliveryPeriods = async () => {
        try {
            const adminToken = localStorage.getItem('token');
            const res = await axios.get(`${process.env.API_URL}/delivery/periods`, {
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            });
            setPeriods(res.data?.periods || []);
        } catch (error) {
            toast.error(error?.response?.data?.message || t('fetchPeriodsError'));
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            fetchDeliveryPeriods();
        }
    }, []);

    const handleSavePeriods = async () => {
        setLoading(true);
        try {
            const adminToken = localStorage.getItem('token');
            await axios.post(
                `${process.env.API_URL}/set/delivery/periods`,
                { periods },
                {
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    }
                }
            );
            toast.success(t('periodsSavedSuccess'));
        } catch (error) {
            toast.error(error?.response?.data?.message || t('savePeriodsError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" dir={isRTL ? 'rtl' : 'ltr'}>
            <div>
                <h1 className="text-2xl font-bold">{t('pageTitle')}</h1>
                <hr />
            </div>
            <div className="formgrid p-fluid">
                <Chips value={periods} onChange={(e) => setPeriods(e.value)} placeholder={t('chipsPlaceholder')} className="w-full mb-4" />
                <Button label={t('saveButtonLabel')} onClick={handleSavePeriods} loading={loading} className="p-button-primary" />
            </div>
        </div>
    );
}

export default DeliveryPeriodsPage;
