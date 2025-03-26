'use client';

import React, { useState } from 'react';
import CustomFileUpload from '../../../../../components/customFileUpload/customFileUpload';
import { Button } from 'primereact/button';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';

export default function UploadMealsByExcel({ params: { locale } }) {
    const t = useTranslations('meals');
    const isRTL = locale === 'ar';

    const [files, setFiles] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!files) {
            toast.error(t('noFileSelected'));
            return;
        }

        // GET THE TOKEN FROM THE LOCAL STORAGE
        const token = localStorage.getItem('token');

        const formData = new FormData();
        formData.append('files', files[0]);

        try {
            const response = await fetch(`${process.env.API_URL}/upload/meals/file`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            toast.success(t('uploadMealsByExcelSuccess'));
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error(t('uploadMealsByExcelError'));
        }
    }

    return (
        <form onSubmit={handleSubmit} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={`card`}>
                <h1 className={'text-2xl mb-5 uppercase'}>{t('uploadMealsByExcel')}</h1>

                <div className={'p-fluid formgrid grid'}>
                    <div className={'field col-12'} dir={'ltr'}>
                        <label htmlFor="files">{t('ExcelFile')}</label>
                        <CustomFileUpload
                            setFiles={(files) => {
                                setFiles(files);
                            }}
                            multiple={false}
                            accept=".xls,.xlsx"
                        />
                    </div>
                </div>
            </div>
            <div className={'flex justify-center mt-5'}>
                <Button
                    label={t('uploadFile')}
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
