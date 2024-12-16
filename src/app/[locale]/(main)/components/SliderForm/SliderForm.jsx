'use client';
import React, { useState } from 'react';
import CustomFileUpload from '../customFileUpload/customFileUpload';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputNumber } from 'primereact/inputnumber';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useTranslations } from 'next-intl';

export default function SliderForm({ locale, isRTL }) {
    const t = useTranslations('slider');

    // LOADING STATE
    const [loading, setLoading] = useState(false);

    // STATE
    const [form, setForm] = useState({
        files: [],
        position: ''
    });

    // HANDLERS
    function addAds(event) {
        // PREVENT THE DEFAULT BEHAVIOUR
        event.preventDefault();

        // GET THE TOKEN FROM THE LOCAL STORAGE
        const token = localStorage.getItem('token');

        // VALIDATE THE FORM
        if (!form.files || form.files.length < 1) {
            toast.error(t('fillAllFieldsError'));
            return;
        }

        // CHECK IF THE POSITION IS NOT A NUMBER OR LESS THAN 1 OR GREATER THAN FILES LENGTH
        if (isNaN(form.position) || form.position < 1 || form.position > form.files.length) {
            toast.error(t('validPositionError'));
            return;
        }

        // SET THE LOADING TO TRUE
        setLoading(true);

        // CREATE THE FORM DATA
        const formData = new FormData();

        // Set the loading state for the spinner
        setLoading(true);

        // APPEND THE FILES
        for (let i = 0; i < form.files.length; i++) {
            formData.append('files', form.files[i]);
        }

        if (form.position) {
            formData.append('clickablePosition', form.position);
        }

        // SEND THE REQUEST
        axios
            .post(`${process.env.API_URL}/carousel/ads`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                toast.success(t('addSuccess'));
                setLoading(false);
            })
            .catch((error) => {
                toast.error(t('addError'));
                setLoading(false);
            });
    }

    return (
        <div className={'card mb-0'} dir={isRTL ? 'rtl' : 'ltr'}>
            <h1 className={'text-2xl font-bold mb-4 uppercase'}>{t('addSliderImage')}</h1>
            <form className="grid formgrid p-fluid" onSubmit={addAds}>
                <div className="col-12 mb-2 lg:mb-2" dir={'ltr'}>
                    <label className={'mb-2 block'} htmlFor="male-image">
                        {t('adImageLabel')}
                    </label>
                    <CustomFileUpload
                        setFiles={(files) => {
                            setForm({ ...form, files });
                        }}
                        accept={'image/*'}
                        multiple={true}
                        removeThisItem={(index) => {
                            // ITEMS COPY
                            const items = [...(form?.files || [])];
                            // FILTER THE ITEMS
                            const newItems = items.filter((item, i) => {
                                return i !== index;
                            });
                            // SET THE STATE
                            setForm({ ...form, files: newItems });
                        }}
                    />
                </div>

                {/*POSITION CLICKABLE*/}
                <div className="col-12 mb-2 lg:mb-2">
                    <label className={'mb-2 block'} htmlFor="position">
                        {t('clickablePositionLabel')}
                    </label>
                    <InputNumber id="position" value={form.position} onValueChange={(e) => setForm({ ...form, position: e.value })} placeholder={t('clickableImageNumberPlaceholder')} min={1} />
                </div>

                <div className="field col-12 mt-4 ml-auto">
                    <Button
                        type={'submit'}
                        label={
                            loading ? (
                                <ProgressSpinner
                                    fill={'#fff'}
                                    strokeWidth={'4'}
                                    style={{
                                        width: '2rem',
                                        height: '2rem'
                                    }}
                                />
                            ) : (
                                t('addButton')
                            )
                        }
                        disabled={loading}
                    />
                </div>
            </form>
        </div>
    );
}
