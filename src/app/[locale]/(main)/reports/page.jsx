'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';

export default function Reports({ params: { locale } }) {
    const t = useTranslations('reports');
    const isRTL = locale === 'ar';

    const [loading, setLoading] = React.useState(false);
    const [reportType, setReportType] = React.useState('');
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');

    function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        axios
            .get(`${process.env.API_URL}/report`, {
                params: {
                    reportName: reportType,
                    dateFrom: startDate,
                    dateTo: endDate
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then((res) => {
                setLoading(false);
                const timer = setTimeout(() => {
                    window.open(res.data.url, '_blank');
                    clearTimeout(timer);
                }, 1000);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    }

    return (
        <>
            <form onSubmit={handleSubmit} className={'col-12 card'} dir={isRTL ? 'rtl' : 'ltr'}>
                <h1 className="text-2xl mb-5 uppercase">{t('getReport')}</h1>
                <hr />

                <div className="p-fluid formgrid grid">
                    <div className="field col-12">
                        <label htmlFor="reportType">{t('reportType')}</label>
                        <Dropdown
                            id="reportType"
                            value={reportType}
                            onChange={(e) => {
                                setReportType(e.target.value);
                            }}
                            placeholder={t('reportType')}
                            options={[
                                { label: t('activeClients'), value: 'active clients' },
                                { label: t('kitchenMeals'), value: 'kitchenMeals' }
                            ]}
                        />
                    </div>

                    {reportType === 'kitchenMeals' && (
                        <div className="field col-12 md:col-6">
                            <label htmlFor="startDate">{t('startDate')}</label>
                            <Calendar
                                id="startDate"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                }}
                                placeholder={t('startDate')}
                                dateFormat="dd/mm/yy"
                                showIcon={true}
                            />
                        </div>
                    )}

                    {reportType === 'kitchenMeals' && (
                        <div className="field col-12 md:col-6">
                            <label htmlFor="endDate">{t('endDate')}</label>
                            <Calendar
                                id="endDate"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                }}
                                placeholder={t('endDate')}
                                dateFormat="dd/mm/yy"
                                showIcon={true}
                            />
                        </div>
                    )}

                    <div className="field col-12 ml-auto mt-4">
                        <Button
                            icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                            type="submit"
                            className="bg-slate-500 w-full"
                            style={{
                                background: loading ? '#dcdcf1' : 'var(--primary-color)'
                            }}
                            label={
                                loading ? (
                                    <ProgressSpinner
                                        strokeWidth="4"
                                        style={{
                                            width: '1.5rem',
                                            height: '1.5rem'
                                        }}
                                    />
                                ) : (
                                    t('submit')
                                )
                            }
                        />
                    </div>
                </div>
            </form>
        </>
    );
}
