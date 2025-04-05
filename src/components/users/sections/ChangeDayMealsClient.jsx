'use client';

import React, { useCallback, useState } from 'react';
import SubscriptionDays from './SubscriptionDays';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Sidebar } from 'primereact/sidebar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import Image from 'next/image';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

function ChangeDayMealsClient({ isRTL, id }) {
    const [planDays, setPlanDays] = useState(null);
    const [selectedDayToEdit, setSelectedDayToEdit] = useState(null);
    const [deliveryNote, setDeliveryNote] = useState('');
    const [dayMeals, setDayMeals] = useState(null);
    const [menuType, setMenuType] = useState(''); // Assuming you have a menu type state
    const [mealNoteObject, setMealNoteObject] = useState({
        mealId: null,
        note: ''
    });

    const [selectedMealsToSend, setSelectedMealsToSend] = useState([]);

    const fetchClientData = useCallback(async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.get(`${process.env.API_URL}/client/details?clientId=${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching client data:', error);
            return null;
        }
    }, [id]);

    React.useEffect(() => {
        const getClientData = async () => {
            const data = await fetchClientData();
            if (data) {
                setPlanDays(data.planDays);
            } else {
                toast.error(isRTL ? 'فشل في جلب بيانات العميل أو لا توجد أيام خطة متاحة.' : 'Failed to fetch client data or no plan days available.');
            }
        };

        getClientData();
    }, [fetchClientData, isRTL]);

    // GET DAY MEALS
    const getDayMeals = useCallback(async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.get(`${process.env.API_URL}/client/menu`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                params: {
                    dateId: selectedDayToEdit,
                    clientId: id,
                    mealType: menuType
                }
            });
            setDayMeals(response?.data ?? {});
            // Update selected meals while preserving notes
            const selectedMeals = response?.data?.selectedMeals?.map((meal) => {
                return {
                    id: meal?._id,
                    note: meal?.note || ''
                };
            });
            setSelectedMealsToSend(selectedMeals || []);
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || isRTL ? 'فشل في جلب بيانات الوجبات.' : 'Failed to fetch meal data.');
            console.error('Error fetching day meals:', error);
            return null;
        }
    }, [id, selectedDayToEdit, isRTL, menuType]);

    // EFFECT TO GET DAY MEALS
    React.useEffect(() => {
        if (selectedDayToEdit) {
            getDayMeals();
        }
    }, [selectedDayToEdit, id, isRTL, getDayMeals]);

    // SELECT MEAL TO SEND
    const handleSelectMeal = (mealId) => {
        setSelectedMealsToSend((prev) => {
            // Check if meal already exists
            if (prev.some((meal) => meal.id === mealId)) {
                return prev;
            }
            // Add new meal
            return [...prev, { id: mealId, note: '' }];
        });
        toast.success(isRTL ? 'تم إضافة الوجبة بنجاح' : 'Meal added successfully');
    };

    // SEND UPDATE REQUEST
    const handleSaveAndSendRequest = async () => {
        const token = localStorage.getItem('token');
        const data = {
            meals: selectedMealsToSend.map((meal) => ({
                mealId: meal.id,
                note: meal.note || ''
            })),
            dateId: selectedDayToEdit,
            flag: 'edit',
            clientId: id
        };

        try {
            const response = await axios.post(`${process.env.API_URL}/set/client/meals`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success(response?.data?.message || isRTL ? 'تم تحديث الوجبات بنجاح.' : 'Meals updated successfully.');

            // SEND DELIVERY NOTE IF EXISTS
            if (deliveryNote) {
                await handleSendDeliveryNote();
            }

            resetStates(); // Reset states after successful update
        } catch (error) {
            toast.error(error.response?.data?.message || isRTL ? 'فشل في تحديث الوجبات.' : 'Failed to update meals.');
            console.error('Error updating meals:', error);
        }
    };

    // SEND DELIVERY NOTE
    const handleSendDeliveryNote = async () => {
        const token = localStorage.getItem('token');
        const data = {
            clientId: id,
            dateId: selectedDayToEdit,
            deliveryNote: deliveryNote
        };

        try {
            const response = await axios.post(`${process.env.API_URL}/set/admin/delivery/note`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success(response?.data?.message || isRTL ? 'تم تحديث ملاحظة التوصيل بنجاح.' : 'Delivery note updated successfully.');
        } catch (error) {
            toast.error(error.response?.data?.message || isRTL ? 'فشل في تحديث ملاحظة التوصيل.' : 'Failed to update delivery note.');
            console.error('Error updating delivery note:', error);
        }
    };

    // RESET STATES HANDLER
    const resetStates = () => {
        setSelectedDayToEdit(null);
        setSelectedMealsToSend([]);
        setDeliveryNote('');
        setMealNoteObject({ mealId: null, note: '' });
        setMenuType('');
        setDayMeals(null);
    };

    return (
        <div>
            <SubscriptionDays isRTL={isRTL} clientId={id} planDays={planDays} setPlanDays={setPlanDays} setSelectedDayToEdit={setSelectedDayToEdit} />
            <Sidebar visible={!!selectedDayToEdit} onHide={resetStates} position={isRTL ? 'right' : 'left'} className="sidebar" dismissable={true} showCloseIcon={true} closeOnEscape={true} style={{ width: '50vw' }}>
                {/* SELECTED DAY INFO */}
                <h2>{isRTL ? 'تفاصيل اليوم المحدد' : 'Selected Day Details'}</h2>
                <div className="grid grid-nogutter mt-3">
                    <div className="col-6">
                        <span className="text-500 font-medium">{isRTL ? 'تاريخ اليوم' : 'Day Date'}: </span>
                        <span className="text-600 font-medium">
                            {planDays?.find((day) => day._id === selectedDayToEdit)?.date
                                ? new Date(planDays.find((day) => day._id === selectedDayToEdit).date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit'
                                  })
                                : ''}
                        </span>
                    </div>
                    <div className="col-6">
                        {/* ALLOWED MEALS TYPES */}
                        <span className="text-500 font-medium">{isRTL ? 'نوع الوجبات المسموح بها' : 'Allowed Meals Types'}: </span>
                        <span className="text-600 font-medium">
                            {dayMeals?.bundleMealsTypes?.map((mealType, index) => {
                                return (
                                    <span key={mealType}>
                                        {mealType} {index < dayMeals?.bundleMealsTypes?.length - 1 ? ', ' : ''}
                                    </span>
                                );
                            })}
                        </span>
                    </div>
                    <div className="col-6 mt-2">
                        <span className="text-500 font-medium">{isRTL ? 'عدد الوجبات' : 'Meals Number'}</span>
                        <span className="text-600 font-medium">: {dayMeals?.numberOfMeals}</span>
                    </div>
                    <div className="col-6 mt-2">
                        <span className="text-500 font-medium">{isRTL ? 'عدد الوجبات الخفيفة' : 'Snacks Number'}</span>
                        <span className="text-600 font-medium">: {dayMeals?.numberOfSnacks}</span>
                    </div>
                </div>
                <hr />
                <h4 className="mt-2">{isRTL ? 'الوجبات المختارة' : 'Selected Meals'}</h4>
                <div className="grid">
                    {selectedMealsToSend.map((selectedMeal) => {
                        console.log('selectedMeal', selectedMeal);
                        const meal = dayMeals?.filter?.find((m) => m.mealId?._id === selectedMeal.id);
                        console.log('meal', meal);
                        if (!meal) return null;

                        return (
                            <div key={selectedMeal.id} className="col-12 md:col-6">
                                <div className="card p-3 mb-2">
                                    <div className="flex align-items-center">
                                        <Image
                                            src={meal?.mealId?.imagePath ?? '/img-not_found.jpg'}
                                            alt={meal?.mealId?.mealTitle}
                                            width={50}
                                            height={50}
                                            style={{
                                                objectFit: 'cover',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <div className="ml-3 flex-1">
                                            <h6 className="mb-1" dir={isRTL ? 'rtl' : 'ltr'}>
                                                {isRTL ? meal?.mealId?.mealTitle : meal?.mealId?.mealTitleEn}
                                            </h6>
                                            {selectedMeal.note && (
                                                <small className="text-500">
                                                    {isRTL ? 'ملاحظة: ' : 'Note: '}
                                                    {selectedMeal.note}
                                                </small>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                icon="pi pi-file-edit"
                                                outlined
                                                size="small"
                                                className="p-button-rounded"
                                                onClick={() =>
                                                    setMealNoteObject({
                                                        mealId: selectedMeal.id,
                                                        note: selectedMeal.note || ''
                                                    })
                                                }
                                            />
                                            <Button
                                                icon="pi pi-trash"
                                                severity="danger"
                                                outlined
                                                size="small"
                                                className="p-button-rounded"
                                                onClick={() => {
                                                    setSelectedMealsToSend((prev) => prev.filter((m) => m.id !== selectedMeal.id));
                                                    toast.success(isRTL ? 'تم حذف الوجبة بنجاح' : 'Meal removed successfully');
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <hr />
                {/* FILTER FOR MENY TYPE */}
                <div className="grid grid-nogutter mt-3">
                    <h4>
                        {isRTL ? 'اختر نوع الوجبة' : 'Select Menu Type'}
                        <span className="text-500 font-medium">{isRTL ? ' (وجبة رئيسية أو وجبة خفيفة)' : ' (Main Meal or Snack)'}</span>
                    </h4>
                    <div className="col-12">
                        <Dropdown
                            value={menuType}
                            className="w-full"
                            options={[
                                // [افطار - غداء - عشاء - سناك - ""]values are
                                { label: isRTL ? 'الكل' : 'All', value: '' },
                                { label: isRTL ? 'افطار' : 'Breakfast', value: 'افطار' },
                                { label: isRTL ? 'غداء' : 'Lunch', value: 'غداء' },
                                { label: isRTL ? 'عشاء' : 'Dinner', value: 'عشاء' },
                                { label: isRTL ? 'وجبة خفيفة' : 'Snack', value: 'سناك' }
                            ]}
                            onChange={(e) => setMenuType(e.value)}
                            placeholder={isRTL ? 'اختر نوع الوجبة' : 'Select Menu Type'}
                            optionLabel="label"
                            optionValue="value"
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>
                </div>
                <hr />
                {/* MEALS TO ACT WITH */}
                <h4 className="mt-2 ml-3">{isRTL ? 'الوجبات المتاحة' : 'Available Meals'}</h4>
                <div className="flex justify-content-start align-items-strech flex-wrap mt-3 overflow-auto" style={{ maxHeight: '320px' }}>
                    {dayMeals?.filter && dayMeals?.filter?.length > 0 ? (
                        dayMeals?.filter?.map((meal, index) => {
                            // Check if the meal is already selected
                            const isMealSelected = selectedMealsToSend?.some((selectedMeal) => selectedMeal.id === meal?.mealId?._id);
                            return (
                                <div key={index} className="card flex flex-column mb-2 p-2 flex-1 mx-2" style={{ minWidth: '150px', maxWidth: '166px', height: 'auto' }}>
                                    <div className="top-container">
                                        <Image
                                            src={meal?.mealId?.imagePath ?? '/img-not_found.jpg'}
                                            alt={meal?.mealId?.mealTitle}
                                            width={200}
                                            height={200}
                                            style={{
                                                objectFit: 'cover',
                                                width: '100%',
                                                height: '100px',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <h5 className="text-sm mt-2" dir={isRTL ? 'rtl' : 'ltr'}>
                                            {isRTL ? meal?.mealId?.mealTitle : meal?.mealId?.mealTitleEn}
                                        </h5>
                                    </div>
                                    <div className="flex justify-content-between gap-1 align-items-center mt-auto">
                                        {/* SELECT WITH NOTE */}
                                        <Button disabled={!isMealSelected} outlined className="w-full" size="small" label={!isRTL ? 'Note' : 'ملاحظة'} onClick={() => setMealNoteObject({ mealId: meal?.mealId?._id, note: '' })} />
                                        {/* NORMAL SELECT */}
                                        <Button outlined disabled={isMealSelected} className="w-full" size="small" label={!isRTL ? 'Select' : 'اختر'} onClick={() => handleSelectMeal(meal?.mealId?._id)} />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-12 text-center">{isRTL ? 'لا توجد وجبات متاحة' : 'No available meals'}</div>
                    )}
                </div>
                {/* DELIVERY NOTE */}
                <div className="field mt-3">
                    <label htmlFor="note" className="text-500 font-medium">
                        {isRTL ? 'ملاحظة التوصيل' : 'Delivery Note'}
                    </label>
                    <InputTextarea
                        id="note"
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                        rows={5}
                        cols={30}
                        className="w-full p-inputtext-sm"
                        placeholder={isRTL ? 'اكتب ملاحظتك هنا...' : 'Write your note here...'}
                        autoResize
                        dir={isRTL ? 'rtl' : 'ltr'}
                    />
                </div>
                {/* SAVE AND SEND REQUEST */}
                <Button label={isRTL ? 'حفظ' : 'Save'} icon="pi pi-check" autoFocus className="p-button-sm mt-2 w-full" onClick={handleSaveAndSendRequest} />
            </Sidebar>

            {/* DIALOG FOR MEALS NOTE */}
            <Dialog header={isRTL ? 'ملاحظة الوجبة' : 'Meal Note'} visible={!!mealNoteObject?.mealId} onHide={() => setMealNoteObject({ mealId: null, note: '' })} style={{ width: '50vw' }}>
                <div className="field">
                    <label htmlFor="note" className="text-500 font-medium">
                        {isRTL ? 'ملاحظة' : 'Note'}
                    </label>

                    <InputTextarea
                        id="note"
                        value={mealNoteObject?.note}
                        onChange={(e) => setMealNoteObject({ ...mealNoteObject, note: e.target.value })}
                        rows={5}
                        cols={30}
                        className="w-full p-inputtext-sm"
                        placeholder={isRTL ? 'اكتب ملاحظتك هنا...' : 'Write your note here...'}
                        autoResize
                        dir={isRTL ? 'rtl' : 'ltr'}
                    />
                </div>
                <Button
                    label={isRTL ? 'إضافة' : 'Add'}
                    icon="pi pi-check"
                    onClick={() => {
                        const updatedMeals = selectedMealsToSend.map((meal) => (meal.id === mealNoteObject?.mealId ? { ...meal, note: mealNoteObject?.note } : meal));
                        setSelectedMealsToSend(updatedMeals);
                        setMealNoteObject({ mealId: null, note: '' });
                        toast.success(isRTL ? 'تم إضافة الملاحظة بنجاح' : 'Note added successfully');
                    }}
                    autoFocus
                    className="p-button-sm mt-2"
                />
            </Dialog>
        </div>
    );
}

export default ChangeDayMealsClient;
