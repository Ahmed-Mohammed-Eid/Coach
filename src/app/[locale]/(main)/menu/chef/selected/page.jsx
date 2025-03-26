'use client';
import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Image from 'next/image';
import { Button } from 'primereact/button';
import { useTranslations } from 'next-intl';
import { Sidebar } from 'primereact/sidebar';
import { InputText } from 'primereact/inputtext';

export default function ChefSelectedPage({ params: { locale } }) {
    const t = useTranslations('cheffMenu');
    const isRTL = locale === 'ar';
    // STATES
    const [menu, setMenu] = useState([]);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedDayData, setSelectedDayData] = useState(null);
    const [selectedMeals, setSelectedMeals] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [allMeals, setAllMeals] = useState([]);

    // FUNCTION TO GET ALL MEALS
    const getAllMeals = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${process.env.API_URL}/meals/filter`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    menuType: 'subscriptions',
                    mealsFilter: 'all'
                }
            });
            setAllMeals(res.data.meals);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    // FUNCTION TO HANDLE EDIT
    const handleEdit = async (rowData) => {
        setSelectedDay(rowData.day);
        setSelectedDayData(rowData);

        // Get all meals
        await getAllMeals();

        // Pre-select the current day's meals
        const currentMeals = [...rowData.breakfast.map((m) => m.mealId), ...rowData.lunch.map((m) => m.mealId), ...rowData.dinner.map((m) => m.mealId), ...rowData.snack.map((m) => m.mealId)];
        setSelectedMeals(currentMeals);

        setSidebarVisible(true);
    };

    // FUNCTION TO UPDATE MENU
    const handleUpdate = async () => {
        // GET TOKEN FROM LOCAL STORAGE
        const token = localStorage.getItem('token');

        try {
            const res = await axios.post(
                `${process.env.API_URL}/add/chiff/menu/day`,
                {
                    day: selectedDay,
                    mealsIds: selectedMeals.map((meal) => meal._id)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // SHOW SUCCESS MESSAGE
            toast.success(res.data?.message || 'Menu Updated Successfully');

            // REFRESH THE DATA
            getMeals();

            // CLOSE SIDEBAR
            setSidebarVisible(false);

            // RESET SELECTIONS
            setSelectedDay(null);
            setSelectedDayData(null);
            setSelectedMeals([]);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    // FUNCTION TO GET THE MEALS
    const getMeals = async () => {
        // GET TOKEN FROM LOCAL STORAGE
        const token = localStorage.getItem('token');

        // SET DYNAMIC URL BASED ON THE ROLE
        let url = `${process.env.API_URL}/get/chiff/menu`;

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
            <Sidebar visible={sidebarVisible} onHide={() => setSidebarVisible(false)} position={isRTL ? 'right' : 'left'} className="w-full md:w-4/5 lg:w-4/5">
                <div className="flex flex-column h-full" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div className="flex justify-content-between align-items-center mb-4">
                        <h3 className="m-0">
                            {t('editMenuFor')}{' '}
                            <span
                                style={{
                                    color: '#007bff',
                                    fontWeight: 'bold'
                                }}
                            >
                                &ldquo;{getDayName(selectedDay || '')} &rdquo;
                            </span>
                        </h3>
                        <Button icon="pi pi-check" label={t('update')} onClick={handleUpdate} />
                    </div>
                    <div className="flex-grow-1">
                        <DataTable
                            value={allMeals}
                            selection={selectedMeals}
                            onSelectionChange={(e) => setSelectedMeals(e.value)}
                            dataKey="_id"
                            paginator
                            rows={10}
                            globalFilter={globalFilter}
                            header={
                                <div className="flex justify-content-end">
                                    <span className="p-input-icon-left">
                                        <i className="pi pi-search" />
                                        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder={t('search')} />
                                    </span>
                                </div>
                            }
                        >
                            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                            <Column
                                field="imagePath"
                                header={t('image')}
                                body={(rowData) => (
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
                                )}
                            />
                            <Column field="mealTitle" header={t('nameAr')} sortable filter />
                            <Column field="mealTitleEn" header={t('nameEn')} sortable filter />
                            <Column field="mealType" header={t('type')} sortable filter />
                            <Column field="mealPrice" header={t('price')} sortable filter body={(rowData) => <span className="text-center font-bold">{rowData.mealPrice} KWD</span>} />
                        </DataTable>
                    </div>
                </div>
            </Sidebar>

            <div className={'card mb-0'} dir={isRTL ? 'rtl' : 'ltr'}>
                <h3 className={'mb-4 uppercase'}>{t('chefMenu')}</h3>
                <hr />
                <DataTable value={menu || []} className="mt-4">
                    <Column
                        dir={isRTL ? 'rtl' : 'ltr'}
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
                    <Column body={(rowData) => <Button icon="pi pi-pencil" className="p-button-rounded p-button-text" onClick={() => handleEdit(rowData)} tooltip={t('edit')} />} />
                </DataTable>
            </div>
        </>
    );
}
