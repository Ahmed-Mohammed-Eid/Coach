'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import Image from 'next/image';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { toast } from 'react-hot-toast';

export default function SliderList({ locale, isRTL }) {
    const t = useTranslations('slider');
    const [ads, setAds] = useState([]);
    const [visible, setVisible] = React.useState(false);
    const [adIdToDelete, setAdIdToDelete] = React.useState(null);

    function getAds() {
        axios
            .get(`${process.env.API_URL}/home/ads`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then((response) => {
                console.log(response.data);
                const ads = response.data?.homeAds;
                const adsArray = [];

                // Add the ads to the adsArray
                ads?.carousel.forEach((carousel) => {
                    adsArray.push({ image: carousel, type: 'carousel' });
                });

                setAds(adsArray);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    // DELETE THE PACKAGE HANDLER
    const deleteHandler = async () => {
        //GET THE TOKEN
        const token = localStorage.getItem('token');

        await axios
            .delete(`${process.env.API_URL}/delete/carousel/ad`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    adId: adIdToDelete
                }
            })
            .then((_) => {
                // Show notification
                toast.success(t('deleteSuccess'));
                // Hide the dialog
                setVisible(false);
                // Update the State
                getAds();
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || t('deleteError'));
            });
    };

    const footerContent = (
        <div dir="ltr">
            <Button label={t('no')} icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
            <Button
                label={t('yes')}
                icon="pi pi-check"
                onClick={() => {
                    deleteHandler();
                }}
                style={{
                    backgroundColor: '#dc3545',
                    color: '#fff'
                }}
                autoFocus
            />
        </div>
    );

    useEffect(() => {
        getAds();
    }, []);

    return (
        <div className={'card mb-0'}>
            <DataTable
                dir={isRTL ? 'rtl' : 'ltr'}
                value={ads}
                style={{ width: '100%' }}
                paginator={true}
                rows={10}
                rowsPerPageOptions={[5, 10, 20]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                emptyMessage={t('noCategoriesFound')}
            >
                <Column
                    field={'image.url'}
                    header={t('image')}
                    body={(rowData) => {
                        return <Image src={rowData?.image?.url || ''} alt={rowData.type} width={50} height={50} style={{ borderRadius: '50%', border: '1px solid #CCCCCC' }} />;
                    }}
                />
                <Column
                    field="type"
                    header={t('type')}
                    body={(rowData) => {
                        return <Tag value={rowData.type} severity={rowData.type === 'carousel' ? 'success' : rowData.type === 'second' ? 'primary' : 'info'} style={{ textTransform: 'capitalize' }}></Tag>;
                    }}
                />

                {/*clickable*/}
                <Column
                    field="clickable"
                    header={t('clickable')}
                    body={(rowData) => {
                        return <Tag value={rowData?.image?.clickable ? t('yes') : t('no')} severity={rowData?.image?.clickable ? 'success' : 'danger'} style={{ textTransform: 'capitalize' }}></Tag>;
                    }}
                />

                <Column
                    field="actions"
                    header={t('actions')}
                    style={{ width: '10%' }}
                    body={(rowData) => {
                        const isButtonVisible = rowData.type === 'carousel' ? true : false;

                        const deleteButton = (
                            <button
                                className="deleteButton"
                                onClick={() => {
                                    setVisible(true);
                                    setAdIdToDelete(rowData.image._id);
                                }}
                            >
                                {t('delete')}
                            </button>
                        );

                        if (!isButtonVisible) {
                            return '';
                        }

                        return <div>{deleteButton}</div>;
                    }}
                />
            </DataTable>
            <Dialog dir={isRTL ? 'rtl' : 'ltr'} header={t('deleteAd')} visible={visible} position={'top'} style={{ width: '90%', maxWidth: '650px' }} onHide={() => setVisible(false)} footer={footerContent} draggable={false} resizable={false}>
                <p className="m-0">{t('deleteConfirmation')}</p>
            </Dialog>
        </div>
    );
}
