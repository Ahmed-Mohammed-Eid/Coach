'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function FlexBundlePricingPage({ params: { locale } }) {
    const t = useTranslations('flexBundlePricing');
    const isRTL = locale === 'ar';

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Form state
    const [form, setForm] = useState({
        breakfastGramPrice: 0,
        lunchGramPrice: 0,
        dinnerGramPrice: 0,
        snackPrice: 0,
        fixedExpenses: 0
    });

    // Fetch initial pricing data
    useEffect(() => {
        const fetchPricingData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.API_URL}/flex/pricing`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = response.data?.flexPricing;
                if (data) {
                    setForm({
                        breakfastGramPrice: data.breakfastGramPrice,
                        lunchGramPrice: data.lunchGramPrice,
                        dinnerGramPrice: data.dinnerGramPrice,
                        snackPrice: data.snackPrice,
                        fixedExpenses: data.fixedExpenses
                    });
                }
            } catch (error) {
                toast.error(t('fetchError'));
                console.error('Error fetching pricing data:', error);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchPricingData();
    }, []);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error(t('authError'));
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${process.env.API_URL}/create/flex/bundle/pricing`, form, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            toast.success(t('updateSuccess'));
        } catch (error) {
            toast.error(error?.response?.data?.message || t('updateError'));
            console.error('Error updating pricing:', error);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="card flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="card">
                <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
                <p className="mb-4">{t('description')}</p>

                <div className="grid formgrid p-fluid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="breakfastGramPrice" className="font-bold mb-2 block">
                            {t('breakfastGramPrice')}
                        </label>
                        <InputNumber
                            id="breakfastGramPrice"
                            value={form.breakfastGramPrice}
                            onValueChange={(e) => setForm({ ...form, breakfastGramPrice: e.value })}
                            mode="decimal"
                            minFractionDigits={5}
                            maxFractionDigits={5}
                            placeholder={t('enterBreakfastGramPrice')}
                            className="w-full"
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="lunchGramPrice" className="font-bold mb-2 block">
                            {t('lunchGramPrice')}
                        </label>
                        <InputNumber
                            id="lunchGramPrice"
                            value={form.lunchGramPrice}
                            onValueChange={(e) => setForm({ ...form, lunchGramPrice: e.value })}
                            mode="decimal"
                            minFractionDigits={5}
                            maxFractionDigits={5}
                            placeholder={t('enterLunchGramPrice')}
                            className="w-full"
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="dinnerGramPrice" className="font-bold mb-2 block">
                            {t('dinnerGramPrice')}
                        </label>
                        <InputNumber
                            id="dinnerGramPrice"
                            value={form.dinnerGramPrice}
                            onValueChange={(e) => setForm({ ...form, dinnerGramPrice: e.value })}
                            mode="decimal"
                            minFractionDigits={5}
                            maxFractionDigits={5}
                            placeholder={t('enterDinnerGramPrice')}
                            className="w-full"
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="snackPrice" className="font-bold mb-2 block">
                            {t('snackPrice')}
                        </label>
                        <InputNumber
                            id="snackPrice"
                            value={form.snackPrice}
                            onValueChange={(e) => setForm({ ...form, snackPrice: e.value })}
                            mode="decimal"
                            minFractionDigits={3}
                            maxFractionDigits={3}
                            placeholder={t('enterSnackPrice')}
                            className="w-full"
                        />
                    </div>

                    <div className="field col-12">
                        <label htmlFor="fixedExpenses" className="font-bold mb-2 block">
                            {t('fixedExpenses')}
                        </label>
                        <InputNumber
                            id="fixedExpenses"
                            value={form.fixedExpenses}
                            onValueChange={(e) => setForm({ ...form, fixedExpenses: e.value })}
                            mode="decimal"
                            minFractionDigits={5}
                            maxFractionDigits={9}
                            placeholder={t('enterFixedExpenses')}
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="flex justify-content-end mt-4">
                    <Button
                        type="submit"
                        className="w-full"
                        label={loading ? <ProgressSpinner style={{ width: '1.5rem', height: '1.5rem' }} strokeWidth="4" fill="var(--surface-ground)" animationDuration=".5s" /> : t('saveButton')}
                        disabled={loading}
                    />
                </div>
            </div>
        </form>
    );
}
