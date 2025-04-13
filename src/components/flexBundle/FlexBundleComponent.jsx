'use client';

import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

export default function FlexBundleComponent({ locale }) {
    const t = useTranslations('flexBundle');
    const isRTL = locale === 'ar';
    const [bundleData, setBundleData] = useState({
        carb: [],
        protine: [],
        mealsNumber: [],
        mealsType: [],
        snacksNumber: [],
        weekDays: [],
        bundlePeriods: [],
        allowedBreakfast: null,
        allowedLunch: null,
        allowedDinner: null
    });

    // Days options for the dropdown
    const daysOptions = [
        { label: 'Saturday', value: 'Sat' },
        { label: 'Sunday', value: 'Sun' },
        { label: 'Monday', value: 'Mon' },
        { label: 'Tuesday', value: 'Tue' },
        { label: 'Wednesday', value: 'Wed' },
        { label: 'Thursday', value: 'Thu' },
        { label: 'Friday', value: 'Fri' }
    ];

    // Meal type options
    const mealTypeOptions = [
        { value: 'افطار', label: isRTL ? 'فطور' : 'Breakfast' },
        { value: 'غداء', label: isRTL ? 'غداء' : 'Lunch' },
        { value: 'عشاء', label: isRTL ? 'عشاء' : 'Dinner' },
        { value: 'سناك', label: isRTL ? 'وجبات خفيفة' : 'Snacks' },
        { value: 'مقبلات', label: isRTL ? 'مقبلات' : 'Appetizers' },
        { value: 'سلطة', label: isRTL ? 'سلطة' : 'Salad' },
        { value: 'قليل الكربوهيدرات', label: isRTL ? 'قليل الكربوهيدرات' : 'Low Carb' },
        { value: 'الأطباق', label: isRTL ? 'الأطباق' : 'Dishes' },
        { value: 'البرجر الصحي', label: isRTL ? 'البرجر الصحي' : 'Healthy Burger' },
        { value: 'التورتيلا الصحي', label: isRTL ? 'التورتيلا الصحي' : 'Healthy Tortilla' },
        { value: 'البيتزا الصحية', label: isRTL ? 'البيتزا الصحية' : 'Healthy Pizza' },
        { value: 'طلبات الطاقة الجانبية', label: isRTL ? 'طلبات الطاقة الجانبية' : 'Side Energy Orders' },
        { value: 'طلبات البروتين الجانبية', label: isRTL ? 'طلبات البروتين الجانبية' : 'Side Protein Orders' },
        { value: 'معكرونة', label: isRTL ? 'معكرونة' : 'Pasta' },
        { value: 'سمــوثــي & بروتين شيك', label: isRTL ? 'سمــوثــي & بروتين شيك' : 'Smoothie & Protein Shake' },
        { value: 'حلويات', label: isRTL ? 'حلويات' : 'Desserts' }
    ];

    // GET INITIAL DATA HANDLER
    const getInitialData = async () => {
        // GET TOKEN
        const token = localStorage.getItem('token');

        const response = await fetch(`${process.env.API_URL}/flex/bundle/options`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.json();
        const flexOptions = data?.flexOptions;

        if (flexOptions) {
            setBundleData({
                carb: flexOptions?.carb || [],
                protine: flexOptions?.protine || [],
                mealsNumber: flexOptions?.mealsNumber || [],
                mealsType: flexOptions?.mealsType || [],
                snacksNumber: flexOptions?.snacksNumber || [],
                weekDays:
                    flexOptions?.weekDays.map((day) => ({
                        dayName: day.dayName,
                        price: day.price
                    })) || [],
                bundlePeriods: flexOptions?.bundlePeriods || [],
                allowedBreakfast: flexOptions?.allowedBreakfast || '',
                allowedLunch: flexOptions?.allowedLunch || '',
                allowedDinner: flexOptions?.allowedDinner || ''
            });
        }
    };

    useEffect(() => {
        getInitialData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // GET TOKEN
        const token = localStorage.getItem('token');

        // Create a deep copy to modify before sending
        const dataToSend = JSON.parse(JSON.stringify(bundleData));

        // Set price to 0 for relevant sections
        ['carb', 'protine', 'mealsNumber', 'mealsType', 'snacksNumber', 'weekDays', 'bundlePeriods'].forEach((section) => {
            if (dataToSend[section] && Array.isArray(dataToSend[section])) {
                dataToSend[section] = dataToSend[section].map((item) => ({
                    ...item,
                    price: 0
                }));
            }
        });

        console.log(dataToSend); // Log the data being sent

        try {
            const response = await fetch(`${process.env.API_URL}/create/flex/bundle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend) // Send the modified data
            });

            if (!response.ok) {
                const errorData = await response.json(); // Try to get error details
                console.error('Server response:', errorData);
                throw new Error(errorData.message || 'Failed to save bundle configuration');
            }

            const data = await response.json();
            toast.success(t('bundleCreatedSuccessfully'));
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.message || t('failedToSaveBundle')); // Show specific error or generic one
        }
    };

    const renderSection = (section, fields) => {
        if (section === 'weekDays') {
            return (
                <div className="card mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
                    <h2 className="text-xl font-bold mb-3">{t(section)}</h2>
                    <div className="grid formgrid p-fluid">
                        {bundleData[section].map((item, index) => (
                            <React.Fragment key={item._id || index}>
                                <div className="field col-12 md:col-10">
                                    {' '}
                                    {/* Adjusted width */}
                                    <label htmlFor={`${section}-dayName-${index}`}>{t('dayName')}</label>
                                    <Dropdown
                                        id={`${section}-dayName-${index}`}
                                        value={item.dayName}
                                        options={daysOptions}
                                        onChange={(e) => {
                                            const newData = [...bundleData[section]];
                                            newData[index] = {
                                                ...newData[index],
                                                dayName: e.value,
                                                _id: item._id
                                            };
                                            setBundleData({
                                                ...bundleData,
                                                [section]: newData
                                            });
                                        }}
                                        placeholder={t('selectDay')}
                                        disabled={!!item._id}
                                    />
                                </div>
                                <div className="field col-12 md:col-2 flex justify-content-end align-items-end">
                                    <Button
                                        icon="pi pi-times"
                                        type="button"
                                        rounded
                                        text
                                        raised
                                        severity="danger"
                                        onClick={() => {
                                            const newData = [...bundleData[section]];
                                            newData.splice(index, 1);
                                            setBundleData({
                                                ...bundleData,
                                                [section]: newData
                                            });
                                        }}
                                        disabled={!!item._id}
                                    />
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="flex justify-content-end mt-2">
                        <Button
                            icon="pi pi-plus"
                            type="button"
                            rounded
                            text
                            raised
                            severity="help"
                            onClick={() => {
                                setBundleData({
                                    ...bundleData,
                                    [section]: [...bundleData[section], { dayName: '' }] // Removed price
                                });
                            }}
                            disabled={bundleData[section].length >= 7}
                        />
                    </div>
                </div>
            );
        }

        if (section === 'mealsType') {
            return (
                <div className="card mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
                    <h2 className="text-xl font-bold mb-3">{t(section)}</h2>
                    <div className="grid formgrid p-fluid">
                        {bundleData[section].map((item, index) => (
                            <React.Fragment key={index}>
                                <div className="field col-12 md:col-10">
                                    {' '}
                                    {/* Adjusted width */}
                                    <label htmlFor={`${section}-mealType-${index}`}>{t('mealType')}</label>
                                    <Dropdown
                                        id={`${section}-mealType-${index}`}
                                        value={item.mealType}
                                        options={mealTypeOptions}
                                        onChange={(e) => {
                                            const newData = [...bundleData[section]];
                                            newData[index] = {
                                                ...newData[index],
                                                mealType: e.value
                                            };
                                            setBundleData({
                                                ...bundleData,
                                                [section]: newData
                                            });
                                        }}
                                        optionLabel="label"
                                        placeholder={t('mealType')}
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-2 flex justify-content-end align-items-end">
                                    <Button
                                        icon="pi pi-times"
                                        type="button"
                                        rounded
                                        text
                                        raised
                                        severity="danger"
                                        onClick={() => {
                                            const newData = [...bundleData[section]];
                                            newData.splice(index, 1);
                                            setBundleData({
                                                ...bundleData,
                                                [section]: newData
                                            });
                                        }}
                                    />
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="flex justify-content-end mt-2">
                        <Button
                            icon="pi pi-plus"
                            type="button"
                            rounded
                            text
                            raised
                            severity="help"
                            onClick={() => {
                                setBundleData({
                                    ...bundleData,
                                    [section]: [...bundleData[section], { mealType: '' }] // Removed price
                                });
                            }}
                        />
                    </div>
                </div>
            );
        }

        // Generic section rendering (carb, protine, mealsNumber, snacksNumber, bundlePeriods)
        return (
            <div className="card mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
                <h2 className="text-xl font-bold mb-3">{t(section)}</h2>
                <div className="grid formgrid p-fluid">
                    {bundleData[section].map((item, index) => (
                        <React.Fragment key={index}>
                            {fields
                                .filter((field) => field.name !== 'price') // Filter out price field
                                .map((field) => (
                                    <div key={field.name} className="field col-12 md:col-10">
                                        {' '}
                                        {/* Adjusted width */}
                                        <label htmlFor={`${section}-${field.name}-${index}`}>{t(field.label)}</label>
                                        <InputNumber
                                            id={`${section}-${field.name}-${index}`}
                                            value={item[field.name]}
                                            onValueChange={(e) => {
                                                const newData = [...bundleData[section]];
                                                newData[index] = {
                                                    ...newData[index],
                                                    [field.name]: e.value
                                                };
                                                setBundleData({
                                                    ...bundleData,
                                                    [section]: newData
                                                });
                                            }}
                                            mode={'decimal'} // Always decimal now
                                            locale="en-US"
                                            placeholder={t('enterValue')}
                                        />
                                    </div>
                                ))}
                            <div className="field col-12 md:col-2 flex justify-content-end align-items-end">
                                <Button
                                    icon="pi pi-times"
                                    type="button"
                                    rounded
                                    text
                                    raised
                                    severity="danger"
                                    onClick={() => {
                                        const newData = [...bundleData[section]];
                                        newData.splice(index, 1);
                                        setBundleData({
                                            ...bundleData,
                                            [section]: newData
                                        });
                                    }}
                                />
                            </div>
                        </React.Fragment>
                    ))}
                </div>
                <div className="flex justify-content-end mt-2">
                    <Button
                        icon="pi pi-plus"
                        type="button"
                        rounded
                        text
                        raised
                        severity="help"
                        onClick={() => {
                            const newItem = {};
                            fields
                                .filter((field) => field.name !== 'price') // Filter out price field
                                .forEach((field) => {
                                    newItem[field.name] = 0; // Initialize non-price fields
                                });
                            setBundleData({
                                ...bundleData,
                                [section]: [...bundleData[section], newItem]
                            });
                        }}
                    />
                </div>
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-column gap-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* <h1 className="text-3xl font-bold mb-4">{t('title')}</h1> */}

            {renderSection('carb', [
                { name: 'carbValue', label: 'carbValue' }
                // { name: 'price', label: 'price' } // Removed price
            ])}

            {renderSection('protine', [
                { name: 'protineValue', label: 'proteinValue' }
                // { name: 'price', label: 'price' } // Removed price
            ])}

            {renderSection('mealsNumber', [
                { name: 'mealsCount', label: 'mealsCount' }
                // { name: 'price', label: 'price' } // Removed price
            ])}

            {renderSection('mealsType', [
                { name: 'mealType', label: 'mealType' }
                // { name: 'price', label: 'price' } // Removed price
            ])}

            {renderSection('snacksNumber', [
                { name: 'snackCount', label: 'snackCount' }
                // { name: 'price', label: 'price' } // Removed price
            ])}

            {renderSection('weekDays')}

            {renderSection('bundlePeriods', [
                { name: 'weekCount', label: 'weekCount' }
                // { name: 'price', label: 'price' } // Removed price
            ])}

            {/* ALLOWED MEALS SECTION - Remains unchanged */}
            <div className="card mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
                <h2 className="text-xl font-bold mb-3">{t('allowedMeals')}</h2>
                <div className="grid formgrid p-fluid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="allowedBreakfast">{t('allowedBreakfast')}</label>
                        <InputNumber id="allowedBreakfast" value={bundleData.allowedBreakfast} onValueChange={(e) => setBundleData({ ...bundleData, allowedBreakfast: e.value })} mode="decimal" placeholder={t('enterAllowedBreakfast')} />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="allowedLunch">{t('allowedLunch')}</label>
                        <InputNumber id="allowedLunch" value={bundleData.allowedLunch} onValueChange={(e) => setBundleData({ ...bundleData, allowedLunch: e.value })} mode="decimal" placeholder={t('enterAllowedLunch')} />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="allowedDinner">{t('allowedDinner')}</label>
                        <InputNumber id="allowedDinner" value={bundleData.allowedDinner} onValueChange={(e) => setBundleData({ ...bundleData, allowedDinner: e.value })} mode="decimal" placeholder={t('enterAllowedDinner')} />
                    </div>
                </div>
            </div>

            <div className="flex justify-content-end mt-2 w-full">
                <Button type="submit" label={t('submit')} icon="pi pi-save" severity="primary" className="w-full" />
            </div>
        </form>
    );
}
