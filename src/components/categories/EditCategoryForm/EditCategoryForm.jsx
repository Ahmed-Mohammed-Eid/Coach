'use client';
import React, { useEffect, useState } from 'react';
// PRIME REACT
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

// COMPONENTS
import CustomFileUpload from '../../customFileUpload/customFileUpload';

// HELPERS
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useTranslations, useLocale } from 'next-intl';

export default function EditCategoryForm({ id }) {
    const t = useTranslations('DashboardCategories');
    const locale = useLocale();
    const isRTL = locale === 'ar';

    // STATES
    const [categoryNameAR, setCategoryNameAR] = useState('');
    const [categoryNameEN, setCategoryNameEN] = useState('');
    const [files, setFiles] = useState(null);

    // HANDLERS
    function handleSubmit(e) {
        // PREVENT DEFAULT
        e.preventDefault();

        // GET THE TOKEN FROM LOCAL STORAGE
        const token = localStorage.getItem('token');

        // VALIDATE
        if (!categoryNameAR || !categoryNameEN || !id) {
            return toast.error(t('fillAllFields'));
        }

        // SUBMIT
        const data = new FormData();
        data.append('categoryNameAR', categoryNameAR);
        data.append('categoryNameEN', categoryNameEN);
        data.append('categoryId', id);

        if (files) {
            // LOOP THROUGH FILES
            for (let i = 0; i < files.length; i++) {
                data.append('files', files[i]);
            }
        }

        // API CALL /create/coupons
        axios
            .put(`${process.env.API_URL}/edit/category`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((res) => {
                if (res.status === 200) {
                    toast.success(t('categoryUpdatedSuccess'));
                }
            })
            .catch((err) => {
                console.log(err);
                toast.error(t('somethingWentWrong'));
            });
    }

    // EFFECT TO GET THE CATEGORY
    useEffect(() => {
        // GET THE TOKEN FROM LOCAL STORAGE
        const token = localStorage.getItem('token');

        // API CALL /get/category/:id
        axios
            .get(`${process.env.API_URL}/category?categoryId=${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((res) => {
                console.log(res.data);
                setCategoryNameAR(res.data?.category?.categoryNameAR || '');
                setCategoryNameEN(res.data?.category?.categoryNameEN || '');
            })
            .catch((err) => {
                console.log(err);
                toast.error(t('somethingWentWrong'));
            });
    }, [id]);

    return (
        <form onSubmit={handleSubmit} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={`card`}>
                <h1 className={'text-2xl mb-5 uppercase'}>{t('editCategory')}</h1>

                <div className={'p-fluid formgrid grid'}>
                    <div className={'field col-12 md:col-6'}>
                        <label htmlFor="couponCode">{t('categoryNameEN')}</label>
                        <InputText id="categoryNameEN" value={categoryNameEN} onChange={(e) => setCategoryNameEN(e.target.value)} placeholder={t('categoryNameEN')} />
                    </div>
                    <div className={'field col-12 md:col-6'}>
                        <label htmlFor="categoryNameAR">{t('categoryNameAR')}</label>
                        <InputText id="categoryNameAR" value={categoryNameAR} onChange={(e) => setCategoryNameAR(e.target.value)} placeholder={t('categoryNameAR')} />
                    </div>
                    <div className={'field col-12'}>
                        <label htmlFor="files">{t('categoryImage')}</label>
                        <CustomFileUpload
                            setFiles={(files) => {
                                setFiles(files);
                            }}
                            multiple={true}
                        />
                    </div>
                </div>
            </div>
            <div className={'flex justify-center mt-5'}>
                <Button
                    label={t('editCategory')}
                    icon="pi pi-plus"
                    style={{
                        width: '100%',
                        padding: '1rem'
                    }}
                />
            </div>
        </form>
    );
}
