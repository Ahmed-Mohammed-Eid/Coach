'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import classes from './CouponsAddForm.module.scss';
// PRIME REACT
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

// HELPERS
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function CouponsAddForm({ locale, isRTL }) {
    const t = useTranslations('coupons');

    // STATES
    const [couponText, setCouponText] = useState('');
    const [discountType, setDiscountType] = useState('amount');
    const [discountAmount, setDiscountAmount] = useState('');
    const [hasExpiry, setHasExpiry] = useState(false);
    const [expiryDate, setExpiryDate] = useState('');
    const [hasUsageNumber, setHasUsageNumber] = useState(false);
    const [usageNumber, setUsageNumber] = useState('');
    const [numberOfCodes, setNumberOfCodes] = useState('');

    // HANDLERS
    function handleSubmit(e) {
        // PREVENT DEFAULT
        e.preventDefault();

        // GET THE TOKEN FROM LOCAL STORAGE
        const token = localStorage.getItem('token');

        // VALIDATE
        if (!couponText || !discountAmount || !numberOfCodes || (hasExpiry && !expiryDate) || (hasUsageNumber && !usageNumber)) {
            return toast.error(t('fillRequiredFields'));
        }

        // Add validation for ratio type
        if (discountType === 'ratio' && discountAmount > 1) {
            return toast.error(t('ratioValidation'));
        }

        const data = {
            couponText,
            discountType,
            discountAmount,
            hasExpiry,
            expiryDate,
            hasUsageNumber,
            usageNumber,
            numberOfCodes
        };

        // API CALL /create/coupons
        axios
            .post(`${process.env.API_URL}/create/coupons`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((_) => {
                toast.success(t('couponAddedSuccess'));
            })
            .catch((err) => {
                console.log(err);
                toast.error(t('somethingWentWrong'));
            });
    }

    return (
        <form onSubmit={handleSubmit} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={`card`}>
                <h1 className={'text-2xl mb-5 uppercase'}>{t('addNewCoupon')}</h1>

                <div className="grid formgrid p-fluid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="couponText">{t('couponText')}</label>
                        <InputText id="couponText" value={couponText} onChange={(e) => setCouponText(e.target.value)} />
                    </div>

                    <div className={'field col-12 md:col-6'}>
                        <label htmlFor="discountType">{t('discountType')}</label>
                        <Dropdown
                            value={discountType}
                            options={[
                                { label: t('amount'), value: 'amount' },
                                { label: t('ratio'), value: 'ratio' }
                            ]}
                            onChange={(e) => setDiscountType(e.value)}
                        />
                    </div>

                    <div className={'field col-12'}>
                        <label htmlFor="discountAmount">{discountType === 'ratio' ? t('discountRatio') : t('discountAmount')}</label>
                        <InputNumber
                            id="discountAmount"
                            value={discountAmount}
                            onValueChange={(e) => setDiscountAmount(e.value)}
                            mode="decimal"
                            minFractionDigits={2}
                            maxFractionDigits={2}
                            min={0}
                            max={discountType === 'ratio' ? 1 : undefined}
                            placeholder={discountType === 'ratio' ? t('discountRatio') : t('discountAmount')}
                            step={discountType === 'ratio' ? 0.01 : 1}
                        />
                    </div>

                    <div className={'field col-12 flex flex-column align-items-center'}>
                        <label htmlFor="hasExpiry">{t('hasExpiry')}</label>
                        <InputSwitch id="hasExpiry" checked={hasExpiry} onChange={(e) => setHasExpiry(e.value)} />
                    </div>

                    {hasExpiry && (
                        <div className={'field col-12'}>
                            <label htmlFor="expiryDate">{t('expiryDate')}</label>
                            <Calendar id="expiryDate" value={expiryDate} onChange={(e) => setExpiryDate(e.value)} showIcon minDate={new Date()} />
                        </div>
                    )}

                    <div className={'field col-12 flex flex-column align-items-center'}>
                        <label htmlFor="hasUsageNumber">{t('hasUsageNumber')}</label>
                        <InputSwitch id="hasUsageNumber" checked={hasUsageNumber} onChange={(e) => setHasUsageNumber(e.value)} />
                    </div>

                    {hasUsageNumber && (
                        <div className={'field col-12'}>
                            <label htmlFor="usageNumber">{t('usageNumber')}</label>
                            <InputNumber id="usageNumber" value={usageNumber} onValueChange={(e) => setUsageNumber(e.value)} />
                        </div>
                    )}

                    <div className={'field col-12'}>
                        <label htmlFor="numberOfCodes">{t('numberOfCodes')}</label>
                        <InputNumber id="numberOfCodes" value={numberOfCodes} onValueChange={(e) => setNumberOfCodes(e.value)} />
                    </div>
                </div>

                <div className={'flex justify-center mt-5'}>
                    <Button
                        label={t('addCoupon')}
                        icon="pi pi-plus"
                        style={{
                            width: '100%',
                            padding: '1rem'
                        }}
                    />
                </div>
            </div>
        </form>
    );
}
