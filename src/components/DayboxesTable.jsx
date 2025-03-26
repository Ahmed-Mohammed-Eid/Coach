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

export default function DayboxesTable({ locale, isRTL }) {
    const t = useTranslations('dayBoxes');

    //ROUTER
    const router = useRouter();

    //STATE FOR THE BOXES
    const [boxes, setBoxes] = React.useState([]);
    const [visible, setVisible] = React.useState(false);
    const [boxIdToDelete, setPackageIdToDelete] = React.useState(null);

    // GET THE BOXES FROM THE API
    function getBoxes() {
        // GET THE TOKEN FROM THE LOCAL STORAGE
        const token = localStorage.getItem('token');

        axios
            .get(`${process.env.API_URL}/boxes`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                setBoxes(response.data?.boxes || []);
            })
            .catch((error) => {
                toast.error(error?.response?.data?.message || t('deleteError'));
            });
    }

    // EFFECT TO GET THE BOXES
    useEffect(() => {
        getBoxes();
    }, []);

    // DELETE THE BOXE HANDLER
    const deleteHandler = async () => {
        //GET THE TOKEN
        const token = localStorage.getItem('token');

        await axios
            .delete(`${process.env.API_URL}/delete/box`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    boxId: boxIdToDelete
                }
            })
            .then((_) => {
                // Show notification
                toast.success(t('deleteSuccess'));
                // Hide the dialog
                setVisible(false);
                // Update the State
                getBoxes();
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
                severity="danger"
                onClick={() => {
                    deleteHandler();
                }}
                style={{
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
                value={boxes || []}
                style={{ width: '100%' }}
                paginator={true}
                rows={10}
                rowsPerPageOptions={[5, 10, 20]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                emptyMessage={t('noBoxesFound')}
            >
                <Column
                    field="boxImage"
                    header={t('boxImage')}
                    body={(rowData) => {
                        return (
                            <Image
                                src={rowData.boxImage || '/img-not_found.jpg'}
                                alt={`${rowData.boxNameEn} - ${rowData.boxNameAr}`}
                                width={50}
                                height={50}
                                style={{
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                }}
                            />
                        );
                    }}
                />
                <Column field="boxNameAr" header={t('boxNameAr')} sortable filter />
                <Column field="boxNameEn" header={t('boxNameEn')} sortable filter />
                <Column
                    field="boxPrice"
                    header={t('boxPrice')}
                    sortable
                    filter
                    body={(rowData) => {
                        return <>{rowData?.boxPrice && <span className="text-center font-bold">{rowData.boxPrice} KWD</span>}</>;
                    }}
                />
                <Column field="mealsNumber" header={t('mealsNumber')} sortable filter />
                <Column field="snacksNumber" header={t('snacksNumber')} sortable filter />
                <Column
                    field={'_id'}
                    header={t('actions')}
                    body={(rowData) => {
                        return (
                            <div className="flex justify-center gap-2">
                                <button
                                    className="editButton"
                                    onClick={() => {
                                        router.push(`/${locale}/dayboxes/${rowData._id}`);
                                    }}
                                >
                                    {t('edit')}
                                </button>
                                <button
                                    className="deleteButton"
                                    onClick={() => {
                                        setVisible(true);
                                        setPackageIdToDelete(rowData._id);
                                    }}
                                >
                                    {t('delete')}
                                </button>
                            </div>
                        );
                    }}
                />
            </DataTable>
            <Dialog
                dir={isRTL ? 'rtl' : 'ltr'}
                header={t('deleteConfirmation')}
                visible={visible}
                position={'top'}
                style={{ width: '90%', maxWidth: '650px' }}
                onHide={() => setVisible(false)}
                footer={footerContent}
                draggable={false}
                resizable={false}
            >
                <p className="m-0">{t('deleteConfirmation')}</p>
            </Dialog>
        </>
    );
}
