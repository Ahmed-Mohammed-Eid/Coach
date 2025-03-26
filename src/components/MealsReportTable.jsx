'use client';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';

export default function MealsReportTable({ locale, isRTL }) {
    const t = useTranslations('dailyMealsReport');
    //STATE FOR THE MEALS
    const [clientIds, setClientIds] = React.useState([]);
    const [meals, setMeals] = React.useState([]);
    // STATE FOR THE DATE
    const [date, setDate] = useState(new Date());

    // GET THE MEALS FROM THE API
    function getMeals() {
        // GET THE TOKEN FROM THE LOCAL STORAGE
        const token = localStorage.getItem('token');

        // MAKE THE REQUEST TO THE API
        axios
            .get(`${process.env.API_URL}/today/delivery/meals`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    mealsFilter: 'all',
                    mealsDate: `${date}`
                }
            })
            .then((res) => {
                // GET THE MEALS ARRAY
                const meals = res.data.clients;
                // SET THE CLIENTS IDS AND THE DATE ID IN THE STATE WITH NO DUPLICATES TO BE SOMETHING LIKE [{clientId: "123", dateId: "123"},...]
                const clientIds = [];
                meals.forEach((meal) => {
                    if (!clientIds.some((client) => client.clientId === meal.clientId)) {
                        clientIds.push({
                            clientId: meal.clientId,
                            dateId: meal.dateId
                        });
                    }
                });
                // SET THE CLIENTS IDS
                setClientIds(clientIds);
                // SET THE ORDERS ARRAY
                setMeals(meals);
            })
            .catch((error) => {
                toast.error(error?.response?.data?.message || t('errorGettingMeals'));
            });
    }

    // PRINT ALL THE LABELS
    function printLabels() {
        // GET THE TOKEN FROM THE LOCAL STORAGE
        const token = localStorage.getItem('token');

        // VALIDATE IF THERE ARE MEALS DATE
        if (!date) {
            toast.error(t('selectDate'));
            return;
        }

        // MAKE THE REQUEST TO THE API
        axios
            .get(`${process.env.API_URL}/print/labels`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    mealFilter: 'all',
                    mealsDate: `${date}`
                }
            })
            .then((res) => {
                if (res.data?.url) {
                    window.open(res.data.url, '_blank');
                } else {
                    toast.error(t('errorPrintingLabels'));
                }
            })
            .catch((error) => {
                toast.error(error?.response?.data?.message || t('errorGettingMeals'));
            });
    }

    // MARK ALL AS DELIVERED
    function markAllAsDelivered() {
        // GET THE TOKEN FROM THE LOCAL STORAGE
        const token = localStorage.getItem('token');

        // VALIDATE IF THERE ARE CLIENTS
        if (clientIds.length === 0) {
            toast.error(t('noClients'));
            return;
        }

        // MAKE THE REQUEST TO THE API
        axios
            .put(
                `${process.env.API_URL}/set/all/meals/delivered`,
                {
                    clients: clientIds || []
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            .then((res) => {
                toast.success(res.data?.message || t('allMealsDelivered'));
                getMeals();
            })
            .catch((error) => {
                toast.error(error?.response?.data?.message || t('errorMarkingDelivered'));
            });
    }

    // EFFECT TO GET THE MEALS
    useEffect(() => {
        getMeals();
    }, [date]);

    return (
        <>
            <div className="grid mb-3" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="col-12">
                    <Calendar
                        value={date}
                        onChange={(e) => {
                            setDate(e.value);
                        }}
                        dateFormat="dd/mm/yy"
                        showIcon
                        style={{
                            width: '100%',
                            height: '100%'
                        }}
                    />
                </div>
                <div className="col-12 grid gap-1 justify-content-end" style={{ padding: '5px 0' }}>
                    <Button dir="ltr" label={t('printLabels')} icon="pi pi-print" size={'small'} severity="info" onClick={printLabels} />
                    <Button dir="ltr" label={t('markAllAsDelivered')} icon="pi pi-check" size={'small'} severity="success" onClick={markAllAsDelivered} />
                </div>
            </div>

            <DataTable
                dir={isRTL ? 'rtl' : 'ltr'}
                value={meals || []}
                style={{ width: '100%' }}
                paginator={true}
                rows={10}
                rowsPerPageOptions={[5, 10, 20]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                emptyMessage={t('noMealsFound')}
            >
                <Column field="clientName" header={t('clientName')} sortable filter />
                <Column field="phoneNumber" header={t('phoneNumber')} sortable filter />
                <Column field="mealTitle" header={t('title')} sortable filter />
                <Column field="mealType" header={t('type')} sortable filter />
            </DataTable>
        </>
    );
}
