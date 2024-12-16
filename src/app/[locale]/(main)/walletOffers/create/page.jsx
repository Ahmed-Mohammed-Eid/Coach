'use client';
import React, { useState } from 'react';
import CustomFileUpload from '../../components/customFileUpload';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useTranslations } from 'next-intl';

export default function CreateOffer({ params: { locale } }) {
    const t = useTranslations('createWalletOffer');
    const isRTL = locale === 'ar';

    // LOADING STATE
    const [loading, setLoading] = useState(false);

    // FORM STATE
    const [form, setForm] = useState({
        title: '',
        description: '',
        chargeAmount: 0,
        offerAmount: 0,
        expiryDate: null,
        files: []
    });

    // HANDLERS
    function createOffer(event) {
        // PREVENT THE DEFAULT BEHAVIOUR
        event.preventDefault();

        // GET THE TOKEN FROM THE LOCAL STORAGE
        const token = localStorage.getItem('token');

        // VALIDATE THE FORM
        if (!form.title || !form.description || !form.chargeAmount || !form.offerAmount || !form.expiryDate || !form.files.length) {
            return toast.error(t('fillAllFieldsError'));
        }

        // CREATE THE FORM DATA
        const formData = new FormData();

        // APPEND THE FORM DATA
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('chargeAmount', form.chargeAmount);
        formData.append('offerAmount', form.offerAmount);
        formData.append('expiryDate', form.expiryDate);

        // APPEND THE IMAGES
        for (let i = 0; i < form.files.length; i++) {
            formData.append('files', form.files[i]);
        }

        // Set the loading state for the spinner
        setLoading(true);

        // SEND THE REQUEST
        axios
            .post(`${process.env.API_URL}/create/wallet/offer`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                toast.success(t('createSuccess'));
                setLoading(false);
            })
            .catch((error) => {
                toast.error(t('createError'));
                setLoading(false);
            });
    }

    return (
        <form onSubmit={createOffer} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={'card mb-2'}>
                <h1 className={'text-2xl font-bold mb-4 uppercase'}>{t('title')}</h1>
                <div className="grid formgrid p-fluid">
                    <div className="col-12 mb-2 lg:mb-2">
                        <label className={'mb-2 block'} htmlFor="male-image">
                            {t('offerImage')}
                        </label>
                        <CustomFileUpload
                            setFiles={(files) => {
                                setForm({ ...form, files: files });
                            }}
                            removeThisItem={(index) => {
                                // ITEMS COPY
                                const items = [...(form.files || [])];
                                // FILTER THE ITEMS
                                const newItems = items.filter((item, i) => {
                                    return i !== index;
                                });
                                setForm({ ...form, files: newItems });
                            }}
                        />
                    </div>

                    <div className="field col-12">
                        <label htmlFor="title">{t('offerTitle')}</label>
                        <InputText id="title" type="text" placeholder={t('offerTitlePlaceholder')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    </div>
                    {/*DESCRIPTION*/}
                    <div className="field col-12">
                        <label htmlFor="description">{t('description')}</label>
                        <InputTextarea id="description" placeholder={t('descriptionPlaceholder')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ height: '100px' }} />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="chargeAmount">{t('chargeAmount')}</label>
                        <InputNumber id="chargeAmount" placeholder={t('chargeAmountPlaceholder')} value={form.chargeAmount} onChange={(e) => setForm({ ...form, chargeAmount: e.value })} />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="offerAmount">{t('offerAmount')}</label>
                        <InputNumber id="offerAmount" placeholder={t('offerAmountPlaceholder')} value={form.offerAmount} onChange={(e) => setForm({ ...form, offerAmount: e.value })} />
                    </div>
                    {/*  EXPIRY DATE  */}
                    <div className="field col-12">
                        <label htmlFor="expiryDate">{t('expiryDate')}</label>
                        <Calendar id="expiryDate" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.value })} showIcon placeholder={t('expiryDatePlaceholder')} minDate={new Date()} />
                    </div>
                </div>
            </div>
            <div
                className="mt-4"
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}
            >
                <Button type={'submit'} style={{ width: '100%', textTransform: 'uppercase' }} label={loading ? <ProgressSpinner fill={'#fff'} strokeWidth={'4'} style={{ width: '2rem', height: '2rem' }} /> : t('createButton')} disabled={loading} />
            </div>
        </form>
    );
}
