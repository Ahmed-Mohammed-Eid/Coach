'use client';
import React, { useState, useEffect } from 'react';
import CustomFileUpload from '../../components/customFileUpload';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { InputTextarea } from 'primereact/inputtextarea';
import ChooseExtra from '../ChooseExtra';
import ChooseTypes from '../ChooseTypes';
import MealVariations from '../MealVariations';
import { useTranslations } from 'next-intl';

export default function EditMeal({ meal, id, locale, isRTL }) {
    const t = useTranslations('editMeal');

    // LOADING STATE
    const [loading, setLoading] = useState(false);

    // STATE
    const [mealImage, setMealImage] = useState([]);
    const [extra, setExtra] = useState();
    const [maximumExtraNumber, setMaximumExtraNumber] = useState(0);
    const [types, setTypes] = useState();
    const [variations, setVariations] = useState();

    // CATEGORIES STATE
    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState({
        mealTitle: '',
        mealTitleEn: '',
        mealPrice: '',
        mealCategory: '',
        mealFoodCategory: '',
        mealType: '',
        carbohydrate: '',
        fat: '',
        calories: '',
        protein: '',
        sugar: '',
        mealDescription: '',
        blockMeal: false
    });

    // HANDLERS
    function editMeal(event) {
        // PREVENT THE DEFAULT BEHAVIOUR
        event.preventDefault();

        // GET THE TOKEN FROM THE LOCAL STORAGE
        const token = localStorage.getItem('token');

        // ID VALIDATION
        if (!id) {
            return toast.error('No id found.');
        }

        // VALIDATE THE FORM
        if (!form.mealTitle || !form.mealTitleEn || !form.mealCategory || !form.mealType || !form.mealDescription) {
            return toast.error(t('pleaseFillAllFields'));
        }

        // VALIDATE THE MEAL CATEGORY AND PRICE FOR SUBSCRIPTIONS
        if (form?.mealCategory === 'orders' && !form.mealPrice) {
            return toast.error(t('pleaseFillAllFields'));
        }

        // LOOP THROUGH THE VARIATIONS AND VALIDATE THEM THAT EVERY VARIATION HAS 6 FIELDS [title, protine, carbohydrates, fats, calories, sugar] AND THEY ARE NOT EMPTY
        if (variations) {
            for (let i = 0; i < variations.length; i++) {
                if (!variations[i].title || !variations[i].protine || !variations[i].carbohydrates || !variations[i].fats || !variations[i].calories || !variations[i].sugar) {
                    return toast.error(t('pleaseFillAllFields'));
                }
            }
        }

        // SET THE LOADING TO TRUE
        setLoading(true);

        // CREATE THE FORM DATA
        const formData = new FormData();

        // Set the loading state for the spinner
        setLoading(true);

        // APPEND THE IMAGES
        formData.append('mealId', id);
        formData.append('mealTitle', form.mealTitle);
        formData.append('mealTitleEn', form.mealTitleEn);
        formData.append('mealType', form.mealType);
        formData.append('menuType', form.mealCategory);
        formData.append('mealDescription', form.mealDescription);
        formData.append('mealBlocked', form.blockMeal);
        formData.append('mealPrice', form.mealCategory === 'orders' ? form.mealPrice : 0);
        formData.append('allowedExtras', maximumExtraNumber);
        formData.append('extras', JSON.stringify(extra));
        formData.append('options', JSON.stringify(types));
        formData.append('nutritions', JSON.stringify(variations));

        // LOOP THROUGH THE FILES AND APPEND THEM TO THE FORM DATA
        for (let i = 0; i < mealImage.length; i++) {
            formData.append('files', mealImage[i]);
        }

        // SEND THE REQUEST
        axios
            .put(`${process.env.API_URL}/edit/meal`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                toast.success(t('mealCreatedSuccessfully'));
                setLoading(false);
            })
            .catch((error) => {
                toast.error(t('errorCreatingMeal'));
                setLoading(false);
            });
    }

    // GET CATEGORIES LIST HANDLER
    const getCategoriesList = () => {
        // GET THE TOKEN FROM LOCAL STORAGE
        const token = localStorage.getItem('token');

        // API CALL /categories
        axios
            .get(`${process.env.API_URL}/food/category/list`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((res) => {
                console.log(res.data);
                setCategories(res.data?.categories || []);
            })
            .catch((err) => {
                console.log(err);
                toast.error(t('fetchCategoriesError'));
            });
    };

    // EFFECT TO FETCH DATA
    useEffect(() => {
        // GET CATEGORIES LIST
        getCategoriesList();
    }, []);

    // EFFECT TO SET THE FORM DATA
    React.useEffect(() => {
        setForm({
            mealTitle: meal?.mealTitle || '',
            mealTitleEn: meal?.mealTitleEn || '',
            mealPrice: meal?.mealPrice || '',
            mealCategory: meal?.menuType || '',
            mealType: meal?.mealType || '',
            mealDescription: meal?.mealDescription || '',
            blockMeal: meal?.mealBlocked || false
        });
    }, [meal]);

    return (
        <form onSubmit={editMeal} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={'card mb-2'}>
                <h1 className={'text-2xl font-bold mb-4 uppercase'}>{t('editMeal')}</h1>
                <div className="grid formgrid p-fluid">
                    <div className="col-12 mb-2 lg:mb-2">
                        <label className={'mb-2 block'} htmlFor="female-image">
                            {t('mealImage')}
                        </label>
                        <CustomFileUpload
                            setFiles={(files) => {
                                setMealImage(files);
                            }}
                            removeThisItem={(index) => {
                                // ITEMS COPY
                                const items = [...(mealImage || [])];
                                // FILTER THE ITEMS
                                const newItems = items.filter((item, i) => {
                                    return i !== index;
                                });
                                setMealImage(newItems);
                            }}
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="mealTitle">{t('mealArabicName')}</label>
                        <InputText id="mealTitle" type="text" placeholder={t('enterMealArabicName')} value={form.mealTitle} onChange={(e) => setForm({ ...form, mealTitle: e.target.value })} />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="mealTitleEn">{t('mealEnglishName')}</label>
                        <InputText id="mealTitleEn" type="text" placeholder={t('enterMealEnglishName')} value={form.mealTitleEn} onChange={(e) => setForm({ ...form, mealTitleEn: e.target.value })} />
                    </div>

                    {/* FOOD CATEGORY */}
                    <div className="field col-12">
                        <label htmlFor="mealCategory">{t('mealFoodCategory')}</label>
                        <Dropdown
                            id="mealCategory"
                            placeholder={t('selectMealCategory')}
                            options={
                                categories?.map((category) => {
                                    return { label: locale === 'ar' ? category.categoryNameAR : category.categoryNameEN, value: category._id };
                                }) || []
                            }
                            value={form.mealFoodCategory}
                            onChange={(e) => setForm({ ...form, mealFoodCategory: e.target.value })}
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="mealCategory">{t('mealCategory')}</label>
                        <Dropdown
                            id="mealCategory"
                            placeholder={t('selectMealCategory')}
                            options={[
                                { label: 'Orders', value: 'orders' },
                                { label: 'Subscriptions', value: 'subscriptions' }
                            ]}
                            value={form.mealCategory}
                            onChange={(e) => setForm({ ...form, mealCategory: e.target.value })}
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="mealType">{t('mealType')}</label>
                        <Dropdown
                            id={'mealType'}
                            value={form.mealType}
                            onChange={(e) => setForm({ ...form, mealType: e.value })}
                            options={[
                                { value: 'افطار', label: 'فطور' },
                                { value: 'غداء', label: 'غداء' },
                                { value: 'عشاء', label: 'عشاء' },
                                { value: 'سناك', label: 'وجبات خفيفة' },
                                { value: 'مقبلات', label: 'مقبلات' },
                                { value: 'سلطة', label: 'سلطة' },
                                { value: 'قليل الكربوهيدرات', label: 'قليل الكربوهيدرات' },
                                { value: 'الأطباق', label: 'الأطباق' },
                                { value: 'البرجر الصحي', label: 'البرجر الصحي' },
                                { value: 'التورتيلا الصحي', label: 'التورتيلا الصحي' },
                                { value: 'البيتزا الصحية', label: 'البيتزا الصحية' },
                                { value: 'طلبات الطاقة الجانبية', label: 'طلبات الطاقة الجانبية' },
                                { value: 'طلبات البروتين الجانبية', label: 'طلبات البروتين الجانبية' },
                                { value: 'معكرونة', label: 'معكرونة' },
                                { value: 'سمــوثــي & بروتين شيك', label: 'سمــوثــي & بروتين شيك' },
                                { value: 'حلويات', label: 'حلويات' }
                            ]}
                            optionLabel="label"
                            display="chip"
                            filter={true}
                            placeholder={t('selectMealType')}
                            maxSelectedLabels={3}
                            className="w-full"
                        />
                    </div>
                    {form?.mealCategory === 'orders' && (
                        <div className="field col-12">
                            <label htmlFor="mealPrice">{t('mealPrice')}</label>
                            <InputNumber id="mealPrice" placeholder={t('enterMealPrice')} mode="currency" currency="KWD" locale="en-US" currencyDisplay="symbol" value={form.mealPrice} onChange={(e) => setForm({ ...form, mealPrice: e.value })} />
                        </div>
                    )}
                    <div className="field col-12">
                        <label htmlFor="mealDescription">{t('mealDescription')}</label>
                        <InputTextarea id="mealDescription" value={form.mealDescription} onChange={(e) => setForm({ ...form, mealDescription: e.target.value })} rows={5} cols={30} autoResize={true} placeholder={t('enterMealDescription')} />
                    </div>

                    <div className="field col-12 md:col-6">
                        <div className="flex flex-wrap justify-content-start gap-3">
                            <div className="flex align-items-center">
                                <InputSwitch
                                    inputId="blockMeal"
                                    name="blockMeal"
                                    value="blockMeal"
                                    onChange={(event) => {
                                        setForm({
                                            ...form,
                                            blockMeal: event.value
                                        });
                                    }}
                                    checked={form.blockMeal}
                                />
                                <label htmlFor="blockMeal" className="ml-2">
                                    {t('blockMeal')}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ChooseExtra
                selectedExtra={meal?.extras}
                allowedExtras={meal?.allowedExtras}
                getExtra={(extra, maximumNumber) => {
                    setExtra(extra);
                    setMaximumExtraNumber(maximumNumber);
                }}
            />

            <ChooseTypes
                selectedOptions={meal?.options}
                getType={(types) => {
                    setTypes(types);
                }}
            />

            <MealVariations
                getVariation={(variations) => {
                    setVariations(variations);
                }}
                selectedVariation={meal?.nutritions}
            />

            <div
                className="mt-4"
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}
            >
                <Button type={'submit'} style={{ width: '100%', textTransform: 'uppercase' }} label={loading ? <ProgressSpinner fill={'#fff'} strokeWidth={'4'} style={{ width: '2rem', height: '2rem' }} /> : t('editMeal')} disabled={loading} />
            </div>
        </form>
    );
}
