'use client';
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';

export default function CreateDeliveryZone({ params: { locale } }) {
    const t = useTranslations('delivery');
    const isRTL = locale === 'ar';
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [governorates, setGovernorates] = useState([]);
    const [availableRegions, setAvailableRegions] = useState([]);

    const [form, setForm] = useState({
        zoneName: '',
        governorate: '',
        regions: []
    });

    // Fetch governorates on component mount
    useEffect(() => {
        fetchGovernorates();
    }, []);

    // Fetch governorates
    const fetchGovernorates = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.API_URL}/governorates`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setGovernorates(response.data?.governorates || []);
        } catch (error) {
            toast.error(t('fetchGovernoratesError'));
        }
    };

    // Fetch regions when governorate is selected
    const fetchRegions = async (governorateId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.API_URL}/gove/regions`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    governorateId: governorateId
                }
            });
            setAvailableRegions(response.data?.regions || []);
            // Clear previously selected regions when governorate changes
            setForm((prev) => ({ ...prev, regions: [] }));
        } catch (error) {
            toast.error(t('fetchRegionsError'));
            setAvailableRegions([]);
        }
    };

    // Handle governorate change
    const handleGovernorateChange = (e) => {
        const selectedGovernorate = e.value;
        setForm((prev) => ({ ...prev, governorate: selectedGovernorate }));
        if (selectedGovernorate) {
            fetchRegions(selectedGovernorate._id);
        } else {
            setAvailableRegions([]);
        }
    };

    async function createZone(event) {
        event.preventDefault();

        // Form validation
        if (!form.zoneName || !form.governorate || form.regions.length === 0) {
            return toast.error(t('fillAllFields'));
        }

        // Get token from localStorage
        const token = localStorage.getItem('token');

        setLoading(true);

        try {
            const response = await axios.post(
                `${process.env.API_URL}/create/delivery/zone`,
                {
                    zoneName: form.zoneName,
                    regions: form.regions
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            toast.success(t('zoneCreatedSuccess'));
            router.push(`/${locale}/delivery`);
        } catch (error) {
            toast.error(error?.response?.data?.message || t('createError'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={createZone} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">{t('createZone')}</h1>
                </div>

                <div className="grid formgrid p-fluid">
                    <div className="field col-12">
                        <label htmlFor="zoneName" className="font-bold">
                            {t('zoneName')}
                        </label>
                        <InputText id="zoneName" value={form.zoneName} onChange={(e) => setForm({ ...form, zoneName: e.target.value })} placeholder={t('enterZoneName')} />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="governorate" className="font-bold">
                            {t('governorate')}
                        </label>
                        <Dropdown id="governorate" value={form.governorate} onChange={handleGovernorateChange} options={governorates} optionLabel="governorate" placeholder={t('selectGovernorate')} className="w-full" />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="regions" className="font-bold">
                            {t('regions')}
                        </label>
                        <MultiSelect
                            id="regions"
                            value={form.regions}
                            onChange={(e) => setForm({ ...form, regions: e.value })}
                            options={availableRegions}
                            filter
                            showClear
                            disabled={!form.governorate}
                            placeholder={form.governorate ? t('selectRegions') : t('selectGovernorateFirst')}
                            className="w-full"
                            display="chip"
                        />
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <Button icon="pi pi-check" type="submit" severity="primary" className="w-full gap-2" disabled={loading}>
                        {loading ? <ProgressSpinner style={{ width: '1.5rem', height: '1.5rem' }} strokeWidth="4" fill="var(--surface-ground)" animationDuration=".5s" /> : t('createZone')}
                    </Button>
                </div>
            </div>
        </form>
    );
}
