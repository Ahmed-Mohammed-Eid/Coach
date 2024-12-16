'use client';
import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Image from 'next/image';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useTranslations } from 'next-intl';

export default function DefaultSelectedPage({ params: { locale } }) {
    const t = useTranslations('defaultMenu');
    const isRTL = locale === 'ar';
    // STATES
    const [menu, setMenu] = useState([]);

    // FUNCTION TO GET THE MEALS
    const getMeals = async () => {
        // GET TOKEN FROM LOCAL STORAGE
        const token = localStorage.getItem('token');

        // SET DYNAMIC URL BASED ON THE ROLE
        let url = `${process.env.API_URL}/get/menu`;

        try {
            const res = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const menu = res.data.menu;

            // LOOP THROUGH THE MENU AND SORT IT BASED ON THE KEY day FROM THE OBJECT SROM 'Sat' To 'Fri' even if the menu is not having all the days of the week just ignore the missing days
            // THE DAY VALUE WILL BE ONE OF THESE VALUES ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
            const sortedMenu = menu.sort((a, b) => {
                const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                return days.indexOf(a.day) - days.indexOf(b.day);
            });

            setMenu(sortedMenu);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    // EFFECT TO GEY MENU
    useEffect(() => {
        // GET THE MEALS
        getMeals();
    }, []);

    // FUNCTION TO GET THE FULL NAME OF THE DAY
    const getDayName = (day) => {
        // EXTRACT THE FIRST 3 LETTERS OF THE DAY
        let dayWithoutNumber = day.substring(0, 3);
        // MAKE THE FIRST LETTER UPPERCASE
        dayWithoutNumber = dayWithoutNumber.charAt(0).toUpperCase() + dayWithoutNumber.slice(1);

        // GET THE DATE AND FORMAT IT TO SHOW THE FULL NAME BASED ON THE SHORT NAME FOR EXAMPLE 'Sat' TO 'Saturday'
        const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        // GET THE DATE WITH THE FIRST 3 LETTERS OF THE DAY
        const resultDay = days.find((d) => d.startsWith(dayWithoutNumber));
        // ADD THE DAY NUMBER TO THE DAY
        return resultDay + ' ' + day.substring(3);
    };

    return (
        <>
            <div className={'card mb-0'} dir={isRTL ? 'rtl' : 'ltr'}>
                <h3 className={'mb-4 uppercase'}>{t('defaultMenuTitle')}</h3>
                <hr />
                <DataTable value={menu || []}>
                    <Column
                        field="day"
                        header={t('day')}
                        sortable
                        filter
                        body={(rowData) => {
                            return <span className="text-center font-bold">{getDayName(rowData.day)}</span>;
                        }}
                    />
                    <Column
                        field="breakfast"
                        header={t('breakfast')}
                        body={(rowData) => {
                            return rowData.breakfast.map((meal, index) => {
                                return (
                                    <p className={'text-sm mb-0'} key={index}>
                                        {meal.mealId.mealTitle}
                                    </p>
                                );
                            });
                        }}
                        sortable
                        filter
                    />
                    <Column
                        field="lunch"
                        header={t('lunch')}
                        body={(rowData) => {
                            return rowData.lunch.map((meal, index) => {
                                return (
                                    <p className={'text-sm mb-0'} key={index}>
                                        {meal.mealId.mealTitle}
                                    </p>
                                );
                            });
                        }}
                        sortable
                        filter
                    />
                    <Column
                        field="dinner"
                        header={t('dinner')}
                        body={(rowData) => {
                            return rowData.dinner.map((meal, index) => {
                                return (
                                    <p className={'text-sm mb-0'} key={index}>
                                        {meal.mealId.mealTitle}
                                    </p>
                                );
                            });
                        }}
                        sortable
                        filter
                    />
                    {/*    SNACK*/}
                    <Column
                        field="snack"
                        header={t('snack')}
                        body={(rowData) => {
                            return rowData.snack.map((meal, index) => {
                                return (
                                    <p className={'text-sm mb-0'} key={index}>
                                        {meal.mealId.mealTitle}
                                    </p>
                                );
                            });
                        }}
                        sortable
                        filter
                    />
                </DataTable>
            </div>
        </>
    );
}
