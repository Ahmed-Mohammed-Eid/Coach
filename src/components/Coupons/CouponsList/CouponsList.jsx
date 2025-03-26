'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
// PRIME REACT
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Badge } from 'primereact/badge';
import { Tag } from 'primereact/tag';

// HELPERS
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function CouponsList({ locale, isRTL }) {
    const t = useTranslations('coupons');
    // STATES
    const [coupons, setCoupons] = useState([]);
    const [selectedCouponToDelete, setSelectedCouponToDelete] = useState(null);
    const [selectedCouponToEdit, setSelectedCouponToEdit] = useState(null);

    // EFFECT TO FETCH DATA
    useEffect(() => {
        // API CALL /coupons
        getCoupons();
    }, []);

    // GET THE COUPONS HANDLER
    const getCoupons = () => {
        // GET THE TOKEN FROM LOCAL STORAGE
        const token = localStorage.getItem('token');

        // API CALL /coupons
        axios
            .get(`${process.env.API_URL}/all/coupons?page=1`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((res) => {
                setCoupons(res.data?.coupons || []);
            })
            .catch((err) => {
                console.log(err);
                toast.error(t('failedToFetch'));
            });
    };

    // EDIT COUPON
    const editCoupon = (coupon) => {
        // GET THE TOKEN FROM LOCAL STORAGE
        const token = localStorage.getItem('token');

        // VALIDATE THE COUPON
        if (!coupon) {
            toast.error(t('couponNotFound'));
            return;
        }

        // API CALL /coupons
        axios
            .put(
                `${process.env.API_URL}/set/coupon/expired`,
                {
                    couponId: selectedCouponToEdit._id,
                    status: !selectedCouponToEdit.expired
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            .then((res) => {
                setSelectedCouponToEdit(null);
                toast.success(t('statusChanged'));
                // REFRESH THE COUPONS
                getCoupons();
            })
            .catch((err) => {
                console.log(err);
                toast.error(t('failedToChangeStatus'));
            });
    };

    // DELETE COUPON
    const deleteCoupon = (coupon) => {
        // GET THE TOKEN FROM LOCAL STORAGE
        const token = localStorage.getItem('token');

        // VALIDATE THE COUPON
        if (!coupon) {
            toast.error(t('couponNotFound'));
            return;
        }

        // API CALL /coupons
        axios
            .delete(`${process.env.API_URL}/delete/coupon`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    couponId: selectedCouponToDelete._id
                }
            })
            .then((res) => {
                setSelectedCouponToDelete(null);
                toast.success(t('deletedSuccessfully'));
                // REFRESH THE COUPONS
                getCoupons();
            })
            .catch((err) => {
                console.log(err);
                toast.error(t('failedToDelete'));
            });
    };

    return (
        <>
            <div className="card" dir={isRTL ? 'rtl' : 'ltr'}>
                <DataTable
                    value={coupons || []}
                    paginator
                    rows={25}
                    rowsPerPageOptions={[25, 50, 100]}
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} orders"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    header={t('header')}
                    emptyMessage={t('emptyMessage')}
                    className="p-datatable-sm"
                >
                    <Column
                        field={''}
                        header="#"
                        sortable
                        filter
                        filterPlaceholder={t('searchBy.number')}
                        style={{ whiteSpace: 'nowrap' }}
                        body={(rowData, index) => {
                            return <div>{index.rowIndex + 1}</div>;
                        }}
                    />
                    <Column
                        field="couponCode"
                        header={t('searchBy.couponText')}
                        sortable
                        filter
                        filterPlaceholder={t('searchBy.couponText')}
                        style={{ whiteSpace: 'nowrap' }}
                        body={(rowData) => {
                            return (
                                <div className={'flex justify-between'}>
                                    <p
                                        onClick={() => {
                                            navigator.clipboard.writeText(rowData.couponCode);
                                            toast.success(t('copiedToClipboard'));
                                        }}
                                        style={{ cursor: 'pointer', color: '#6f3ee6', fontWeight: 'bold' }}
                                    >
                                        {rowData.couponCode}
                                    </p>
                                </div>
                            );
                        }}
                    />
                    <Column
                        field="discountType"
                        header={t('searchBy.discountType')}
                        sortable
                        filter
                        filterPlaceholder={t('searchBy.discountType')}
                        style={{ whiteSpace: 'nowrap' }}
                        body={(rowData) => {
                            return <Tag value={rowData.discountType === 'amount' ? 'Amount' : 'Ratio'} severity={rowData.discountType === 'amount' ? 'success' : 'info'} style={{ fontSize: '12px', fontWeight: '400' }} />;
                        }}
                    />
                    <Column
                        field="discountAmount"
                        header={t('searchBy.discountAmount')}
                        sortable
                        filter
                        filterPlaceholder={t('searchBy.discountAmount')}
                        style={{ whiteSpace: 'nowrap' }}
                        body={(rowData) => {
                            return (
                                <div>
                                    {rowData.discountAmount} {rowData.discountType === 'amount' ? 'kwd' : '%'}
                                </div>
                            );
                        }}
                    />
                    <Column
                        field="hasExpiry"
                        header={t('searchBy.hasExpiry')}
                        sortable
                        filter
                        filterPlaceholder={t('searchBy.hasExpiry')}
                        style={{ whiteSpace: 'nowrap' }}
                        body={(rowData) => {
                            return <div>{rowData.hasExpiry ? '✅' : '❌'}</div>;
                        }}
                    />
                    <Column
                        field="expiryDate"
                        header={t('searchBy.expiryDate')}
                        sortable
                        filter
                        filterPlaceholder={t('searchBy.expiryDate')}
                        style={{ whiteSpace: 'nowrap' }}
                        body={(rowData) => {
                            return (
                                <div>
                                    {rowData.expiryDate
                                        ? new Date(rowData.expiryDate).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: '2-digit'
                                          })
                                        : 'N/A'}
                                </div>
                            );
                        }}
                    />
                    <Column
                        field="hasUsageNumber"
                        header={t('searchBy.hasUsageNumber')}
                        sortable
                        filter
                        filterPlaceholder={t('searchBy.hasUsageNumber')}
                        style={{ whiteSpace: 'nowrap' }}
                        body={(rowData) => {
                            return <div>{rowData.hasUsageNumber ? '✅' : '❌'}</div>;
                        }}
                    />
                    <Column field="usageNumber" header={t('searchBy.usageNumber')} sortable filter filterPlaceholder={t('searchBy.usageNumber')} style={{ whiteSpace: 'nowrap' }} />
                    <Column
                        field="expired"
                        header={t('searchBy.expired')}
                        sortable
                        filter
                        filterPlaceholder={t('searchBy.expired')}
                        style={{ whiteSpace: 'nowrap' }}
                        body={(rowData) => {
                            return (
                                <div>{rowData.expired ? <Tag value="Expired" severity={'danger'} style={{ fontSize: '12px', fontWeight: '400' }} /> : <Tag value="Active" severity={'success'} style={{ fontSize: '12px', fontWeight: '400' }} />}</div>
                            );
                        }}
                    />
                    {/*  ACTIONS  */}
                    <Column
                        body={(rowData) => {
                            return (
                                <div className={'flex justify-center gap-2'}>
                                    <button className={'editButton'} onClick={() => setSelectedCouponToEdit(rowData)}>
                                        {t('actions.changeStatus')}
                                    </button>
                                    <button className={'deleteButton'} onClick={() => setSelectedCouponToDelete(rowData)}>
                                        {t('actions.delete')}
                                    </button>
                                </div>
                            );
                        }}
                        header={t('actions.header')}
                        style={{ width: '10%' }}
                    />
                </DataTable>

                {/* DELETE DIALOG */}
                <Dialog
                    dir={isRTL ? 'rtl' : 'ltr'}
                    visible={selectedCouponToDelete}
                    onHide={() => setSelectedCouponToDelete(null)}
                    header={t('dialog.deleteHeader')}
                    footer={
                        <div className={'flex justify-center'}>
                            <button className={'deleteButton'} onClick={() => deleteCoupon(selectedCouponToDelete)}>
                                {t('dialog.deleteButton')}
                            </button>
                            <button className={'cancelButton'} onClick={() => setSelectedCouponToDelete(null)}>
                                {t('dialog.cancelButton')}
                            </button>
                        </div>
                    }
                    position={'center'}
                    style={{ width: '100%', maxWidth: '500px' }}
                    draggable={false}
                    resizable={false}
                >
                    <div className={'flex justify-center'}>
                        <p>{t('dialog.deleteMessage')}</p>
                    </div>
                </Dialog>

                {/* EDIT DIALOG */}
                <Dialog
                    dir={isRTL ? 'rtl' : 'ltr'}
                    visible={selectedCouponToEdit}
                    onHide={() => setSelectedCouponToEdit(null)}
                    header={t('dialog.editHeader')}
                    footer={
                        <div className={'flex justify-center'}>
                            <button className={'editButton'} onClick={() => editCoupon(selectedCouponToEdit)}>
                                {t('dialog.saveButton')}
                            </button>
                            <button className={'cancelButton'} onClick={() => setSelectedCouponToEdit(null)}>
                                {t('dialog.cancelButton')}
                            </button>
                        </div>
                    }
                    position={'center'}
                    style={{ width: '100%', maxWidth: '500px' }}
                    draggable={false}
                    resizable={false}
                >
                    <div className={'flex justify-center'}>
                        <p>{t('dialog.editMessage')}</p>
                    </div>
                </Dialog>
            </div>
        </>
    );
}
