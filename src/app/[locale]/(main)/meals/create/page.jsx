'use client';
import React, { useState, useEffect } from 'react';
import CustomFileUpload from '../../../../../components/customFileUpload';
import ChooseExtra from '../../../../../components/ChooseExtra';
import ChooseTypes from '../../../../../components/ChooseTypes';
import MealVariations from '../../../../../components/MealVariations';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { MultiSelect } from 'primereact/multiselect';
import { InputTextarea } from 'primereact/inputtextarea';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function CreateMeal({ params: { locale } }) {
    const t = useTranslations('createMeal');
    const isRTL = locale === 'ar';

    // GET THE ROUTER
    const router = useRouter();

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
    function createMeal(event) {
        // PREVENT THE DEFAULT BEHAVIOUR
        event.preventDefault();

        // GET THE TOKEN FROM THE LOCAL STORAGE
        const token = localStorage.getItem('token');

        // VALIDATE THE FORM
        if (!form.mealTitle || !form.mealTitleEn || !form.mealCategory || !form.mealType || !form.mealDescription || !mealImage) {
            return toast.error(t('fillAllFields'));
        }

        // VALIDATE THE MEAL CATEGORY AND PRICE FOR SUBSCRIPTIONS
        if (form?.mealCategory === 'orders' && !form.mealPrice) {
            return toast.error(t('fillMealPriceAndFoodicsId'));
        }

        // LOOP THROUGH THE VARIATIONS AND VALIDATE THEM THAT EVERY VARIATION HAS 6 FIELDS [title, protine, carbohydrates, fats, calories, sugar] AND THEY ARE NOT EMPTY
        if (variations) {
            for (let i = 0; i < variations.length; i++) {
                if (!variations[i].title || !variations[i].protine || !variations[i].carbohydrates || !variations[i].fats || !variations[i].calories || !variations[i].sugar) {
                    return toast.error(t('fillAllFieldsInVariations'));
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
        formData.append('mealTitle', form.mealTitle);
        formData.append('mealTitleEn', form.mealTitleEn);
        formData.append('mealTypes', JSON.stringify(form.mealType));
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
            .post(`${process.env.API_URL}/create/meal`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                toast.success(response.data?.message || t('mealCreatedSuccessfully'));
                setLoading(false);

                // REDIRECT TO THE MEALS PAGE
                router.push(`/${locale}/meals`);
            })
            .catch((error) => {
                toast.error(error?.response?.data?.message || t('errorCreatingMeal'));
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

    return (
        <form onSubmit={createMeal} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={'card mb-2'}>
                <h1 className={'text-2xl font-bold mb-4 uppercase'}>{t('createMeal')}</h1>
                <div className="grid formgrid p-fluid " onSubmit={createMeal}>
                    <div className="col-12 mb-2 lg:mb-2">
                        <label className={'mb-2 block'} htmlFor="female-image">
                            {t('mealImage')}
                        </label>
                        <CustomFileUpload
                            multiple={true}
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
                            placeholder={t('mealFoodCategory')}
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
                                { label: t('orders'), value: 'orders' },
                                { label: t('subscriptions'), value: 'subscriptions' }
                            ]}
                            value={form.mealCategory}
                            onChange={(e) => setForm({ ...form, mealCategory: e.target.value })}
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="mealType">{t('mealType')}</label>
                        <MultiSelect
                            id={'mealType'}
                            multiple={true}
                            value={form.mealType}
                            onChange={(e) => setForm({ ...form, mealType: e.value })}
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
                            optionLabel="label"
                            display="chip"
                            filter={true}
                            placeholder={t('selectType')}
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
                getExtra={(extra, maximumNumber) => {
                    setExtra(extra);
                    setMaximumExtraNumber(maximumNumber);
                }}
            />

            <ChooseTypes
                getType={(types) => {
                    setTypes(types);
                }}
            />

            <MealVariations
                getVariation={(variation) => {
                    setVariations(variation);
                }}
            />

            <div
                className="mt-4"
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}
            >
                <Button type={'submit'} style={{ width: '100%', textTransform: 'uppercase' }} label={loading ? <ProgressSpinner fill={'#fff'} strokeWidth={'4'} style={{ width: '2rem', height: '2rem' }} /> : t('createMeal')} disabled={loading} />
            </div>
        </form>
    );
}
