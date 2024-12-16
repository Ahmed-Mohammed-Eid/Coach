'use client';
import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Image from 'next/image';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function ChefPage({ params: { locale } }) {
    const t = useTranslations('cheffMenu');
    const isRTL = locale === 'ar';

    // ROUTER
    const router = useRouter();

    // STATES
    const [menu, setMenu] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState([]);
    const [selectedMenuIds, setSelectedMenuIds] = useState([]);
    const [selectedDay, setSelectedDay] = useState(new Date());

    // FUNCTION TO GET THE MEALS
    const getMeals = async () => {
        // GET TOKEN FROM LOCAL STORAGE
        const token = localStorage.getItem('token');

        // SET DYNAMIC URL BASED ON THE ROLE
        let url = `${process.env.API_URL}/meals/filter`;

        try {
            const res = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    menuType: 'subscriptions',
                    mealsFilter: 'all'
                }
            });

            setMenu(res.data.meals);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    // EFFECT TO GEY MENU
    useEffect(() => {
        // GET THE DATE AND FORMAT IT TO RETURN THE DAY FIRST 3 LETTERS
        const day = selectedDay.toString().split(' ')[0];
        setSelectedDay(day);

        // GET THE MEALS
        getMeals();
    }, []);

    // SUBMIT HANDLER
    const handleSubmit = async () => {
        // GET TOKEN FROM LOCAL STORAGE
        const token = localStorage.getItem('token');

        // SET DYNAMIC URL BASED ON THE ROLE
        let url = `${process.env.API_URL}/add/chiff/menu/day`;

        try {
            const res = await axios.post(
                url,
                {
                    mealsIds: selectedMenuIds,
                    day: selectedDay
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // SHOW SUCCESS MESSAGE
            toast.success(res.data?.message || 'Menu Day Added Successfully');

            // RESET THE SELECTED MENU
            setSelectedMenu([]);
            setSelectedMenuIds([]);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    return (
        <>
            <form className={'card flex gap-2 justify-content-end flex-wrap mb-2'} onSubmit={(e) => e.preventDefault()}>
                <Button label={t('selectedDaysList')} severity={'help'} className={'mr-auto'} onClick={() => router.push(`/${locale}/menu/chef/selected`)} />
                <Button onClick={handleSubmit} label={t('addMenuDay')} className={'p-button-success'} />
                <Dropdown
                    value={selectedDay}
                    style={{ width: '100%', maxWidth: '200px' }}
                    filter={true}
                    options={[
                        { label: 'Saturday 1', value: 'sat1' },
                        { label: 'Sunday 1', value: 'sun1' },
                        { label: 'Monday 1', value: 'mon1' },
                        { label: 'Tuesday 1', value: 'tue1' },
                        { label: 'Wednesday 1', value: 'wed1' },
                        { label: 'Thursday 1', value: 'thu1' },
                        { label: 'Friday 1', value: 'fri1' },
                        { label: 'Saturday 2', value: 'sat2' },
                        { label: 'Sunday 2', value: 'sun2' },
                        { label: 'Monday 2', value: 'mon2' },
                        { label: 'Tuesday 2', value: 'tue2' },
                        { label: 'Wednesday 2', value: 'wed2' },
                        { label: 'Thursday 2', value: 'thu2' },
                        { label: 'Friday 2', value: 'fri2' },
                        { label: 'Saturday 3', value: 'sat3' },
                        { label: 'Sunday 3', value: 'sun3' },
                        { label: 'Monday 3', value: 'mon3' },
                        { label: 'Tuesday 3', value: 'tue3' },
                        { label: 'Wednesday 3', value: 'wed3' },
                        { label: 'Thursday 3', value: 'thu3' },
                        { label: 'Friday 3', value: 'fri3' },
                        { label: 'Saturday 4', value: 'sat4' },
                        { label: 'Sunday 4', value: 'sun4' },
                        { label: 'Monday 4', value: 'mon4' },
                        { label: 'Tuesday 4', value: 'tue4' },
                        { label: 'Wednesday 4', value: 'wed4' },
                        { label: 'Thursday 4', value: 'thu4' },
                        { label: 'Friday 4', value: 'fri4' }
                    ]}
                    onChange={(e) => {
                        setSelectedDay(e.value);
                    }}
                    placeholder={t('selectDay')}
                />
            </form>
            <div className={'card mb-0'} dir={isRTL ? 'rtl' : 'ltr'}>
                <h3 className={'mb-4 uppercase'}>{t('chefMenu')}</h3>
                <hr />
                <DataTable
                    dir={isRTL ? 'rtl' : 'ltr'}
                    value={menu || []}
                    selectionMode="checkbox"
                    selection={selectedMenu}
                    onSelectionChange={(e) => {
                        // SET THE SELECTED MENU
                        setSelectedMenu(e.value);
                        // SET THE SELECTED MENU IDS
                        setSelectedMenuIds(e.value.map((menu) => menu._id));
                    }}
                    dataKey="_id"
                    paginator
                    rows={10}
                >
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false}></Column>
                    <Column
                        field="imagePath"
                        header={t('image')}
                        body={(rowData) => {
                            return (
                                <Image
                                    src={rowData.imagePath}
                                    alt={rowData.mealTitle}
                                    width={50}
                                    height={50}
                                    style={{
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }}
                                />
                            );
                        }}
                    />
                    <Column field="mealTitle" header={t('nameAr')} sortable filter />
                    <Column field="mealTitleEn" header={t('nameEn')} sortable filter />
                    <Column
                        field="mealPrice"
                        header={t('price')}
                        sortable
                        filter
                        body={(rowData) => {
                            return <span className="text-center font-bold">{rowData.mealPrice} KWD</span>;
                        }}
                    />
                    <Column field="mealType" header={t('type')} sortable filter />
                </DataTable>
            </div>
        </>
    );
}
