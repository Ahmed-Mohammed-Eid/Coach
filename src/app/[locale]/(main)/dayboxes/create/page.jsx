'use client';
import React, { useState } from 'react';
import CustomFileUpload from '../../components/customFileUpload';
import DayBoxMenu from '../../components/DayBoxMenu';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useTranslations } from 'next-intl';

export default function CreatePackage({ params: { locale } }) {
    const t = useTranslations('createDayBox');
    const isRTL = locale === 'ar';

    const [loading, setLoading] = useState(false);
    const [boxImage, setBoxImage] = useState([]);
    const [boxMenu, setBoxMenu] = useState([]);
    const [form, setForm] = useState({
        arName: '',
        enName: '',
        mealsNumber: 0,
        snacksNumber: 0,
        packagePrice: 0,
        foodicsId: ''
    });

    // CREATE BOX HANDLER
    function createBoxHandler(e) {
        // PREVENT DEFAULT
        e.preventDefault();

        // GET THE TOKEN FROM LOCAL STORAGE
        const token = localStorage.getItem(`token`);

        // VALIDATION
        if (!form.arName) {
            return toast.error('Please enter the box arabic name.');
        }
        if (!form.enName) {
            return toast.error('Please enter the box english name.');
        }
        if (!form.mealsNumber) {
            return toast.error('Please enter the meals number.');
        }
        if (!form.snacksNumber) {
            return toast.error('Please enter the snacks number.');
        }
        if (!form.packagePrice) {
            return toast.error('Please enter the package price.');
        }
        if (!boxImage.length) {
            return toast.error('Please upload the box image.');
        }
        if (!boxMenu?.mealsArray?.length) {
            return toast.error('Please select the box menu.');
        }

        const formData = new FormData();
        formData.append('boxNameAr', form.arName);
        formData.append('boxNameEn', form.enName);
        formData.append('mealsNumber', form.mealsNumber);
        formData.append('snacksNumber', form.snacksNumber);
        formData.append('boxPrice', form.packagePrice);
        formData.append('foodicsId', form.foodicsId);

        // LOOP THROUGH THE BOX IMAGES AND APPEND THEM TO THE FORM DATA
        for (let i = 0; i < boxImage.length; i++) {
            formData.append('files', boxImage[i]);
        }

        formData.append(
            'boxMenu',
            JSON.stringify(
                boxMenu?.mealsArray?.map((item) => {
                    return {
                        mealType: item.menuType,
                        mealsIds: item.selectedMenu,
                        allowedNumber: item.MINMAX
                    };
                })
            )
        );

        setLoading(true);

        axios
            .post(`${process.env.API_URL}/create/box`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                toast.success(response.data?.message || 'Box created successfully.');
                setLoading(false);
            })
            .catch((error) => {
                toast.error(error?.response?.data?.message || 'An error occurred while creating the box.');
                setLoading(false);
            });
    }

    function getMenuAndTypes(types) {
        setBoxMenu(types);
    }

    return (
        <form onSubmit={createBoxHandler} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={'card'}>
                <h1 className={'text-2xl font-bold mb-4 uppercase'}>{t('title')}</h1>
                <div className="grid formgrid p-fluid">
                    <div className="col-12 mb-2 lg:mb-2">
                        <label className={'mb-2 block'} htmlFor="female-image">
                            {t('imageLabel')}
                        </label>
                        <CustomFileUpload
                            setFiles={(files) => {
                                setBoxImage(files);
                            }}
                            removeThisItem={(index) => {
                                // ITEMS COPY
                                const items = [...(boxImage || [])];
                                // FILTER THE ITEMS
                                const newItems = items.filter((item, i) => {
                                    return i !== index;
                                });
                                setBoxImage(newItems);
                            }}
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="arName">{t('arNameLabel')}</label>
                        <InputText id="arName" type="text" placeholder={t('arNamePlaceholder')} value={form.arName} onChange={(e) => setForm({ ...form, arName: e.target.value })} />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="enName">{t('enNameLabel')}</label>
                        <InputText id="enName" type="text" placeholder={t('enNamePlaceholder')} value={form.enName} onChange={(e) => setForm({ ...form, enName: e.target.value })} />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="mealsNumber">{t('mealsNumberLabel')}</label>
                        <InputNumber
                            id="mealsNumber"
                            placeholder={t('mealsNumberPlaceholder')}
                            mode="decimal"
                            minFractionDigits={0}
                            maxFractionDigits={0}
                            min={0}
                            max={100}
                            value={form.mealsNumber}
                            onChange={(e) => setForm({ ...form, mealsNumber: e.value })}
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="snacksNumber">{t('snacksNumberLabel')}</label>
                        <InputNumber
                            id="snacksNumber"
                            placeholder={t('snacksNumberPlaceholder')}
                            mode="decimal"
                            minFractionDigits={0}
                            maxFractionDigits={0}
                            min={0}
                            max={100}
                            value={form.snacksNumber}
                            onChange={(e) => setForm({ ...form, snacksNumber: e.value })}
                        />
                    </div>
                    <div className="field col-12">
                        <label htmlFor="packagePrice">{t('packagePriceLabel')}</label>
                        <InputNumber
                            id="packagePrice"
                            placeholder={t('packagePricePlaceholder')}
                            mode="currency"
                            currency="KWD"
                            locale="en-US"
                            currencyDisplay="symbol"
                            value={form.packagePrice}
                            onChange={(e) => setForm({ ...form, packagePrice: e.value })}
                        />
                    </div>
                    <div className="field col-12">
                        <label htmlFor="foodicsId">{t('foodicsIdLabel')}</label>
                        <InputText id="foodicsId" type="text" placeholder={t('foodicsIdPlaceholder')} value={form.foodicsId} onChange={(e) => setForm({ ...form, foodicsId: e.target.value })} />
                    </div>
                </div>
            </div>
            <DayBoxMenu getMenuAndTypes={(types) => getMenuAndTypes(types)} />
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
