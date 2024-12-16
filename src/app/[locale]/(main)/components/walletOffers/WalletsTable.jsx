'use client';
import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

export default function OffersTable({ locale, isRTL }) {
    const t = useTranslations('walletsOffer');

    //ROUTER
    const router = useRouter();

    //STATE FOR THE OFFERS
    const [offers, setOffers] = React.useState([]);
    const [visible, setVisible] = React.useState(false);
    const [offerIdToDelete, setOfferIdToDelete] = React.useState(null);

    // GET THE OFFERS FROM THE API
    function getOffers() {
        // GET THE TOKEN FROM THE LOCAL STORAGE
        const token = localStorage.getItem('token');

        axios
            .get(`${process.env.API_URL}/wallet/offers`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                setOffers(response.data?.offers || []);
            })
            .catch((error) => {
                toast.error(error?.response?.data?.message || t('errorGettingOffers'));
            });
    }

    // EFFECT TO GET THE OFFERS
    useEffect(() => {
        getOffers();
    }, []);

    // DELETE THE OFFER HANDLER
    const deleteHandler = async () => {
        //GET THE TOKEN
        const token = localStorage.getItem('token');

        await axios
            .delete(`${process.env.API_URL}/delete/offer`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    offerId: offerIdToDelete
                }
            })
            .then((_) => {
                // Show notification
                toast.success(t('offerDeletedSuccess'));
                // Hide the dialog
                setVisible(false);
                // Update the State
                getOffers();
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || t('errorDeletingOffer'));
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

    return (
        <>
            <DataTable
                dir={isRTL ? 'rtl' : 'ltr'}
                value={offers || []}
                style={{ width: '100%' }}
                paginator={true}
                rows={10}
                rowsPerPageOptions={[5, 10, 20]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                emptyMessage={t('noOffersFound')}
            >
                {/*IMAGE*/}
                <Column
                    field={'offerImage'}
                    header={t('image')}
                    body={(rowData) => {
                        return (
                            <Image
                                style={{
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                    width: '50px',
                                    height: '50px'
                                }}
                                src={rowData?.offerImage || '/img-not_found.jpg'}
                                alt={rowData.title}
                                width={50}
                                height={50}
                            />
                        );
                    }}
                />
                {/*TITLE*/}
                <Column field={'title'} header={t('title')} filter={true} sortable={true} />
                {/*CHARGE AMOUNT*/}
                <Column field={'chargeAmount'} header={t('chargeAmount')} filter={true} sortable={true} />
                {/*OFFER AMOUNT*/}
                <Column field={'offerAmount'} header={t('offerAmount')} filter={true} sortable={true} />
                {/*EXPIRY DATE*/}
                <Column
                    field={'expiryDate'}
                    header={t('expiryDate')}
                    body={(rowData) => {
                        return (
                            <p>
                                {new Date(rowData.expiryDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        );
                    }}
                    filter={true}
                    sortable={true}
                />
                {/*IS BLOCKED*/}
                <Column
                    field={'isBlocked'}
                    header={t('blocked')}
                    body={(rowData) => {
                        return <p>{rowData.isBlocked ? t('yes') : t('no')}</p>;
                    }}
                    filter={true}
                    sortable={true}
                />
                {/*CREATED AT*/}
                <Column
                    field={'createdAt'}
                    header={t('createdAt')}
                    body={(rowData) => {
                        return (
                            <p>
                                {new Date(rowData.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        );
                    }}
                    filter={true}
                    sortable={true}
                />
                {/*ACTIONS*/}
                <Column
                    field={'_id'}
                    header={t('actions')}
                    body={(rowData) => {
                        return (
                            <div className="flex justify-center gap-2">
                                <button
                                    className="editButton"
                                    onClick={() => {
                                        router.push(`/${locale}/walletOffers/${rowData._id}`);
                                    }}
                                >
                                    {t('edit')}
                                </button>
                                <button
                                    className="deleteButton"
                                    onClick={() => {
                                        setVisible(true);
                                        setOfferIdToDelete(rowData._id);
                                    }}
                                >
                                    {t('delete')}
                                </button>
                            </div>
                        );
                    }}
                />
            </DataTable>
            <Dialog dir={isRTL ? 'rtl' : 'ltr'} header={t('deleteOffer')} visible={visible} position={'top'} style={{ width: '90%', maxWidth: '650px' }} onHide={() => setVisible(false)} footer={footerContent} draggable={false} resizable={false}>
                <p className="m-0">{t('deleteConfirmation')}</p>
            </Dialog>
        </>
    );
}
