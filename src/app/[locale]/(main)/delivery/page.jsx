'use client';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import Link from 'next/link';

export default function DeliveryZones({ params: { locale } }) {
    const isRTL = locale === 'ar';

    // Get the router object
    const router = useRouter();

    const t = useTranslations('delivery');
    const [zones, setZones] = useState([]);
    const [visible, setVisible] = useState(false);
    const [zoneIdToDelete, setZoneIdToDelete] = useState(null);
    const [first, setFirst] = useState(() => {
        if (typeof window !== 'undefined') {
            return parseInt(localStorage.getItem('zonesTablePageFirst')) || 0;
        }
        return 0;
    });

    function getZones() {
        const token = localStorage.getItem('token');
        axios
            .get(`${process.env.API_URL}/delivery/zones`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((res) => {
                setZones(res.data?.zones || []);
            })
            .catch((error) => {
                toast.error(error?.response?.data?.message || t('fetchError'));
            });
    }

    useEffect(() => {
        getZones();
    }, []);

    const deleteHandler = async () => {
        const token = localStorage.getItem('token');
        await axios
            .delete(`${process.env.API_URL}/remove/zone`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    zoneId: zoneIdToDelete
                }
            })
            .then((_) => {
                toast.success(t('zoneDeletedSuccess'));
                setVisible(false);
                getZones();
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || err?.message || t('deleteError'));
            });
    };

    const regionsTemplate = (rowData) => {
        return (
            <div className="grid grid-cols-2 gap-2">
                {rowData.regions.map((region, index) => (
                    <span key={index} className="px-2 py-1 text-sm rounded-full bg-primary/10 text-primary">
                        {region}
                    </span>
                ))}
            </div>
        );
    };

    const timestampTemplate = (rowData, field) => {
        return new Date(rowData[field]).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const actionsTemplate = (rowData) => {
        return (
            <div className="flex justify-center gap-2">
                <Link href={`/${locale}/delivery/${rowData._id}`} className="editButton">
                    {t('edit')}
                </Link>
                <button
                    className="deleteButton"
                    onClick={() => {
                        setVisible(true);
                        setZoneIdToDelete(rowData._id);
                    }}
                >
                    {t('delete')}
                </button>
            </div>
        );
    };

    const footerContent = (
        <div dir="ltr">
            <Button label={t('no')} icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
            <Button
                label={t('yes')}
                icon="pi pi-check"
                onClick={deleteHandler}
                style={{
                    backgroundColor: '#dc3545',
                    color: '#fff'
                }}
                autoFocus
            />
        </div>
    );

    return (
        <div className="card" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{t('deliveryZones')}</h1>
            </div>
            <DataTable
                dir={isRTL ? 'rtl' : 'ltr'}
                value={zones}
                paginator
                rows={25}
                first={first}
                onPage={(e) => {
                    setFirst(e.first);
                    localStorage.setItem('zonesTablePageFirst', e.first.toString());
                }}
                rowsPerPageOptions={[25, 50, 100]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                emptyMessage={t('noZonesFound')}
                className="mt-4"
            >
                <Column field="zoneName" header={t('zoneName')} sortable filter />
                <Column field="regions" header={t('regions')} body={regionsTemplate} />
                <Column field="createdAt" header={t('createdAt')} sortable body={(rowData) => timestampTemplate(rowData, 'createdAt')} />
                <Column field="updatedAt" header={t('updatedAt')} sortable body={(rowData) => timestampTemplate(rowData, 'updatedAt')} />
                <Column field="_id" header={t('actions')} body={actionsTemplate} />
            </DataTable>

            <Dialog header={t('deleteZone')} visible={visible} position="top" style={{ width: '90%', maxWidth: '650px' }} onHide={() => setVisible(false)} footer={footerContent} draggable={false} resizable={false}>
                <p className="m-0">{t('deleteConfirmation')}</p>
            </Dialog>
        </div>
    );
}
