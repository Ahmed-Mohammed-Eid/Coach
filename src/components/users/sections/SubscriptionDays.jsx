'use client';

import React, { useState } from 'react';
import { formatDate } from '../../../utils/helpers';
import { InputText } from 'primereact/inputtext';
import styles from './SubscriptionDays.module.scss';
import toast from 'react-hot-toast';
import axios from 'axios';

function SubscriptionDays({ isRTL, planDays, setSelectedDayToEdit, clientId, fetchClientData }) {
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);

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

    const freezeHandle = async (dayId) => {
        if (!clientId || !dayId) return toast.error(isRTL ? 'معرف العميل أو اليوم غير صالح.' : 'Invalid client or day ID.');
        setLoading(true);
        try {
            const response = await axios.post(
                `${process.env.API_URL}/freez/subscription`,
                {
                    dateIds: [dayId],
                    clientId
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (response.data.success) {
                toast.success(isRTL ? 'تم تجميد اليوم بنجاح.' : 'Day frozen successfully.');
            }

            // Refresh the plan days after freezing/unfreezing
            if (fetchClientData) {
                await fetchClientData();
            }
        } catch (error) {
            console.error('Error freezing day:', error);
            toast.error(error.response?.data?.message || (isRTL ? 'حدث خطأ أثناء تجميد اليوم.' : 'Error freezing the day.'));
        } finally {
            setLoading(false);
        }
    };

    const unfreezeHandle = async (dayId) => {
        if (!clientId || !dayId) return toast.error(isRTL ? 'معرف العميل أو اليوم غير صالح.' : 'Invalid client or day ID.');
        setLoading(true);
        try {
            const response = await axios.post(
                `${process.env.API_URL}/unfreez/subscription`,
                {
                    dateIds: [dayId],
                    clientId
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (response.data.success) {
                toast.success(isRTL ? 'تم إلغاء تجميد اليوم بنجاح.' : 'Day unfreezed successfully.');
            }

            // Refresh the plan days after freezing/unfreezing
            if (fetchClientData) {
                await fetchClientData();
            }
        } catch (error) {
            console.error('Error unfreezing day:', error);
            toast.error(error.response?.data?.message || (isRTL ? 'حدث خطأ أثناء إلغاء تجميد اليوم.' : 'Error unfreezing the day.'));
        } finally {
            setLoading(false);
        }
    };

    const freeze_unfreeze_day = (dayId, isSuspended) => {
        if (!dayId) return toast.error(isRTL ? 'معرف اليوم غير صالح.' : 'Invalid day ID.');
        if (isSuspended) {
            unfreezeHandle(dayId);
        } else {
            freezeHandle(dayId);
        }
    };

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
                                    // Using submitted property to determine if day is selected
                                    const isSubmitted = day?.submitted === true;
                                    const isSuspended = day?.suspended === true;
                                    const isDelivered = day?.delivered === true;

                                    const statusText = isSubmitted ? (isRTL ? 'محدد' : 'Submitted') : isRTL ? 'غير محدد' : 'Not Submitted';
                                    const deliveredText = isDelivered ? (isRTL ? 'تم التسليم' : 'Delivered') : isRTL ? 'لم يتم التسليم' : 'Not Delivered';
                                    const suspendedText = isSuspended ? (isRTL ? 'معلق' : 'Suspended') : isRTL ? 'غير معلق' : 'Not Suspended';

                                    return (
                                        <li key={index} className={styles.gridItem}>
                                            <div className={`${styles.itemContent} ${isSubmitted ? styles.selected : styles.notSelected}`}>
                                                <div>
                                                    <div className={styles.dateSection}>
                                                        <i className={`pi ${isSubmitted ? 'pi-check-circle' : 'pi-clock'} ${isSubmitted ? styles.selected : styles.notSelected}`}></i>
                                                        <div className={styles.date}>{day?.date ? formatDate(day.date) : isRTL ? 'تاريخ غير محدد' : 'No date'}</div>
                                                    </div>
                                                    <div className="flex gap-2 mt-2 flex-wrap">
                                                        <span className={`${styles.statusBadge} ${isSubmitted ? styles.selected : styles.notSelected}`}>
                                                            <i className={`pi ${isSubmitted ? 'pi-check' : 'pi-times'}`}></i>
                                                            {statusText}
                                                        </span>
                                                        <span className={`${styles.statusBadge} ${isSubmitted ? styles.selected : styles.notSelected}`}>
                                                            <i className={`pi ${isSubmitted ? 'pi-check' : 'pi-times'}`}></i>
                                                            {deliveredText}
                                                        </span>
                                                        <span className={`${styles.statusBadge} ${isSubmitted ? styles.selected : styles.notSelected}`}>
                                                            <i className={`pi ${isSubmitted ? 'pi-check' : 'pi-times'}`}></i>
                                                            {suspendedText}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEditDay(day._id || index)} className={styles.editButton}>
                                                        <i className="pi pi-pencil"></i>
                                                        {isRTL ? 'تعديل' : 'Edit'}
                                                    </button>
                                                    {/* FREEZE || UNFREEZE */}
                                                    <button className={[styles.freezeButton, isSuspended ? styles.unfreeze : ''].join(' ')} onClick={() => freeze_unfreeze_day(day._id, isSuspended)}>
                                                        <i className="pi pi-ban"></i>
                                                        {isRTL ? (isSuspended ? 'إلغاء التجميد' : 'تجميد') : isSuspended ? 'Unfreeze' : 'Freeze'}
                                                    </button>
                                                </div>
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
