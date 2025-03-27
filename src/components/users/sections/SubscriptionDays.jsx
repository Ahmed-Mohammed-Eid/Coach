'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { formatDate } from '../../../utils/helpers';
import { InputText } from 'primereact/inputtext';
import styles from './SubscriptionDays.module.scss';

function SubscriptionDays({ isRTL, planDays, setSelectedDayToEdit }) {
    const [globalFilter, setGlobalFilter] = useState('');

    const handleEditDay = (dayId) => {
        setSelectedDayToEdit(dayId);
    };

    const filterDays = (days) => {
        if (!globalFilter.trim()) return days;

        return days.filter((day) => {
            const dateStr = day?.date ? formatDate(day.date).toLowerCase() : '';
            const statusStr = day.isSelected ? (isRTL ? 'محدد' : 'selected').toLowerCase() : (isRTL ? 'غير محدد' : 'not selected').toLowerCase();
            const searchStr = globalFilter.toLowerCase();

            return dateStr.includes(searchStr) || statusStr.includes(searchStr);
        });
    };

    const renderHeader = () => {
        return (
            <div className={styles.headerContainer}>
                <div className={styles.titleSection}>
                    <i className="pi pi-calendar"></i>
                    <h2>{isRTL ? 'أيام الاشتراك' : 'Subscription Days'}</h2>
                </div>
                <div className={styles.searchSection}>
                    <span className="p-input-icon-left">
                        <i className="pi pi-search"></i>
                        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder={isRTL ? 'البحث...' : 'Search...'} className={styles.searchInput} dir={isRTL ? 'rtl' : 'ltr'} />
                    </span>
                </div>
            </div>
        );
    };

    const filteredDays = planDays ? filterDays(planDays) : [];

    return (
        <div className={styles.subscriptionDays}>
            <div className={styles.card}>
                {renderHeader()}
                <hr />

                {planDays && planDays.length > 0 ? (
                    <>
                        {filteredDays.length > 0 ? (
                            <ul className={styles.gridList}>
                                {filteredDays.map((day, index) => {
                                    const selectedNumber = day?.dayMeals?.length ?? 0;
                                    const dayMealsNumber = day?.mealsNumber * 1 + day?.snacksNumber * 1;

                                    /*
                                        - IF SELECTED IS 0 THEN NOT SELECTED IF BETWEEN 0 AND DAY MEALS NUMBER THEN SELECTED SOME IF BETWEEN DAY MEALS NUMBER AND DAY MEALS NUMBER + SNACKS NUMBER THEN SELECTED ALL
                                    */

                                    let selectedStatus =
                                        selectedNumber === 0
                                            ? 'notSelected'
                                            : selectedNumber > 0 && selectedNumber < dayMealsNumber
                                            ? 'selectedSome'
                                            : selectedNumber >= dayMealsNumber && selectedNumber <= dayMealsNumber + day?.snacksNumber
                                            ? 'selectedAll'
                                            : 'notSelected';

                                    const statusText = {
                                        notSelected: isRTL ? 'غير محدد' : 'Not Selected',
                                        selectedSome: isRTL ? 'محدد جزئياً' : 'Partially Selected',
                                        selectedAll: isRTL ? 'محدد بالكامل' : 'Fully Selected'
                                    };

                                    return (
                                        <li key={index} className={styles.gridItem}>
                                            <div className={`${styles.itemContent} ${day.isSelected ? styles.selected : styles.notSelected}`}>
                                                <div>
                                                    <div className={styles.dateSection}>
                                                        <i className={`pi ${day.isSelected ? 'pi-check-circle' : 'pi-clock'} ${day.isSelected ? styles.selected : styles.notSelected}`}></i>
                                                        <div className={styles.date}>{day?.date ? formatDate(day.date) : isRTL ? 'تاريخ غير محدد' : 'No date'}</div>
                                                    </div>
                                                    <div>
                                                        <span className={`${styles.statusBadge} ${day.isSelected ? styles.selected : styles.notSelected}`}>
                                                            <i className={`pi ${day.isSelected ? 'pi-check' : 'pi-times'}`}></i>
                                                            {statusText[selectedStatus]}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleEditDay(day._id || index)} className={styles.editButton}>
                                                    <i className="pi pi-pencil"></i>
                                                    {isRTL ? 'تعديل' : 'Edit'}
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className={styles.emptyState}>
                                <i className="pi pi-search"></i>
                                <p>{isRTL ? 'لا توجد نتائج للبحث' : 'No search results found'}</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <i className="pi pi-calendar-times"></i>
                        <p>{isRTL ? 'لا توجد أيام خطة متاحة.' : 'No plan days available.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SubscriptionDays;
