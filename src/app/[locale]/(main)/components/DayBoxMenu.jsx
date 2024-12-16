import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import React, { useEffect, useState } from 'react';
import { MultiSelect } from 'primereact/multiselect';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useTranslations } from 'next-intl';

export default function DayBoxMenu({ getMenuAndTypes, boxMenu }) {
    const t = useTranslations('createDayBox');

    const [types, setTypes] = useState({
        number: 0,
        mealsArray: []
    });
    const [allMeals, setAllMeals] = useState([]);

    // FUNCTION TO GET THE MEALS BY TYPE
    function getAllMeals() {
        // GET THE TOKEN FROM THE LOCAL STORAGE
        const token = localStorage.getItem('token');

        // GET THE MEALS BY TYPE
        axios
            .get(`${process.env.API_URL}/get/menu/type?menuType=orders`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                setAllMeals(response.data?.meals || []);
            })
            .catch((error) => {
                toast.error(error?.response?.data?.message || 'An error occurred while getting the meals.');
            });
    }

    // SEND THE TYPES TO THE PARENT
    useEffect(() => {
        getMenuAndTypes(types);
    }, [types]);

    // EFFECT TO GET THE MEALS
    useEffect(() => {
        getAllMeals();
    }, []);

    // SET THE BOX MENU
    useEffect(() => {
        if (boxMenu && allMeals) {
            // LOOP THROUGH THE BOX MENU AND SET THE TYPES STATE
            const ArrayOfTypes = boxMenu.map((item, index) => {
                return {
                    menuType: item.mealType,
                    selectedMenu: item.mealsIds.map((item) => item._id),
                    MINMAX: item.allowedNumber
                };
            });

            // CREATE MENU OPTIONS FOR EACH TYPE
            ArrayOfTypes.forEach((item, index) => {
                // FILTER ALL MEALS AND RETURN ONLY THE MEALS WITH THE SELECTED TYPE
                const filteredMeals = allMeals.filter((meal, index) => {
                    if (meal.mealType === item.menuType) {
                        return {
                            value: meal._id,
                            label: meal.mealTitle
                        };
                    }
                });

                // CREATE ARRAY OF LABELS AND VALUES OBJECTS AND SET IT IN MENU
                const menu = filteredMeals.map((meal, index) => {
                    return {
                        value: meal._id,
                        label: meal.mealTitle
                    };
                });

                ArrayOfTypes[index] = {
                    ...ArrayOfTypes[index],
                    menu: menu
                };
            });

            setTypes({
                ...types,
                number: boxMenu.length,
                mealsArray: ArrayOfTypes
            });
        }
    }, [boxMenu, allMeals]);

    return (
        <>
            <div className={'card mb-2'}>
                <h1 className={'text-2xl font-bold mb-4 uppercase'}>{t('title')}</h1>
                <div className="grid formgrid p-fluid">
                    {new Array(types.number).fill(0).map((_, index) => {
                        return (
                            <>
                                <div className="field col-12 md:col-3">
                                    <label htmlFor={`menuType${index}`}>{t('menuTypeLabel')}</label>
                                    <Dropdown
                                        id={`menuType${index}`}
                                        placeholder={t('menuTypePlaceholder')}
                                        filter={true}
                                        options={[
                                            { value: 'افطار', label: t('breakfast') },
                                            { value: 'غداء', label: t('lunch') },
                                            { value: 'عشاء', label: t('dinner') },
                                            { value: 'سناك', label: t('snacks') },
                                            { value: 'مقبلات', label: t('appetizers') },
                                            { value: 'سلطة', label: t('salad') },
                                            { value: 'قليل الكربوهيدرات', label: t('lowCarb') },
                                            { value: 'الأطباق', label: t('dishes') },
                                            { value: 'البرجر الصحي', label: t('healthyBurger') },
                                            { value: 'التورتيلا الصحي', label: t('healthyTortilla') },
                                            { value: 'البيتزا الصحية', label: t('healthyPizza') },
                                            { value: 'طلبات الطاقة الجانبية', label: t('sideEnergyOrders') },
                                            { value: 'طلبات البروتين الجانبية', label: t('sideProteinOrders') },
                                            { value: 'معكرونة', label: t('pasta') },
                                            { value: 'سمــوثــي & بروتين شيك', label: t('smoothieProteinShake') },
                                            { value: 'حلويات', label: t('desserts') }
                                        ]}
                                        value={types.mealsArray[index]?.menuType}
                                        onChange={async (e) => {
                                            const ArrayOfTypes = [...types.mealsArray];
                                            // IF THE SAME VALUE IS EXIST SHOW A TOAST AND RETURN
                                            if (ArrayOfTypes.find((item) => item.menuType === e.value)) {
                                                return toast.error(t('menuTypeExists'));
                                            }
                                            ArrayOfTypes[index] = {
                                                ...ArrayOfTypes[index],
                                                menuType: e.value
                                            };
                                            setTypes({
                                                ...types,
                                                mealsArray: ArrayOfTypes
                                            });

                                            // SET THE MENU OPTIONS TO THE MEALS WITH THE SAME SELECTED TYPE
                                            // FILTER ALL MEALS AND RETURN ONLY THE MEALS WITH THE SELECTED TYPE
                                            const filteredMeals = allMeals.filter((meal, index) => {
                                                if (meal.mealType === e.value) {
                                                    console.log(meal.mealTitle, meal.mealType, e.value);
                                                    return {
                                                        value: meal._id,
                                                        label: meal.mealTitle
                                                    };
                                                }
                                            });

                                            // CREATE ARRAY OF LABELS AND VALUES OBJECTS AND SET IT IN MENU
                                            const menu = filteredMeals.map((meal, index) => {
                                                return {
                                                    value: meal._id,
                                                    label: meal.mealTitle
                                                };
                                            });

                                            ArrayOfTypes[index] = {
                                                ...ArrayOfTypes[index],
                                                menu: menu
                                            };
                                            setTypes({
                                                ...types,
                                                mealsArray: ArrayOfTypes
                                            });
                                        }}
                                    />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label htmlFor={`menu${index}`}>{t('menuLabel')}</label>
                                    <MultiSelect
                                        id={`menu${index}`}
                                        multiple={true}
                                        value={types.mealsArray[index]?.selectedMenu}
                                        onChange={(e) => {
                                            const ArrayOfTypes = [...types.mealsArray];
                                            ArrayOfTypes[index] = {
                                                ...ArrayOfTypes[index],
                                                selectedMenu: e.value
                                            };
                                            setTypes({
                                                ...types,
                                                mealsArray: ArrayOfTypes
                                            });
                                        }}
                                        options={types.mealsArray[index]?.menu || []}
                                        optionLabel="label"
                                        display="chip"
                                        filter={true}
                                        placeholder={t('menuPlaceholder')}
                                        maxSelectedLabels={3}
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label htmlFor={`MINMAX${index}`}>{t('minMaxLabel')}</label>
                                    <InputNumber
                                        id={`MINMAX${index}`}
                                        placeholder={t('minMaxPlaceholder')}
                                        value={types.mealsArray[index]?.MINMAX}
                                        onChange={(e) => {
                                            const ArrayOfTypes = [...types.mealsArray];
                                            ArrayOfTypes[index] = {
                                                ...ArrayOfTypes[index],
                                                MINMAX: e.value
                                            };
                                            setTypes({
                                                ...types,
                                                mealsArray: ArrayOfTypes
                                            });
                                        }}
                                    />
                                </div>
                                <div className="field col-12 md:col-3 flex justify-content-end align-items-end">
                                    <Button
                                        icon="pi pi-times"
                                        type={'button'}
                                        rounded
                                        text
                                        raised
                                        severity="danger"
                                        aria-label="Cancel"
                                        onClick={() => {
                                            const ArrayOfTypes = [...types.mealsArray];
                                            ArrayOfTypes.splice(index, 1);
                                            setTypes({
                                                ...types,
                                                number: types.number - 1,
                                                mealsArray: ArrayOfTypes
                                            });
                                        }}
                                    />
                                </div>
                            </>
                        );
                    })}
                </div>
                <div
                    style={{
                        width: `100%`,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        marginTop: '20px'
                    }}
                >
                    <Button
                        icon="pi pi-plus"
                        type={'button'}
                        rounded
                        text
                        raised
                        severity="help"
                        aria-label="add"
                        onClick={() => {
                            setTypes({
                                ...types,
                                number: types.number + 1
                            });
                        }}
                    />
                </div>
            </div>
        </>
    );
}
