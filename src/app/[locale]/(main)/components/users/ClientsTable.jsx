'use client';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
// TOAST
import { toast } from 'react-hot-toast';

export default function ClientsTable({ locale, isRTL }) {
    const t = useTranslations('users');

    //ROUTER
    const router = useRouter();

    //STATE FOR THE USERS
    const [page, setPage] = React.useState(1);
    const [users, setUsers] = React.useState([]);
    const [clientIdToDelete, setClientIdToDelete] = React.useState(null);
    // LOAD MORE STATES
    const [loadDataOption, setLoadDataOption] = useState('saveOldData');
    const [hasNextPage, setHasNextPage] = useState(false);
    const [loading, setLoading] = useState(false);
    // SEARCH STATE
    const [globalFilter, setGlobalFilter] = useState('');

    // GET THE CLIENTS FROM THE API
    async function getClients() {
        // GET THE TOKEN FROM THE LOCAL STORAGE
        const token = localStorage.getItem('token');
        setLoading(true);

        try {
            const res = await axios.get(`${process.env.API_URL}/all/clients`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    page: page,
                    search: globalFilter // Add search param
                }
            });

            if (loadDataOption === 'saveOldData' && page > 1) {
                setUsers((prev) => [...prev, ...res.data.data.clients]);
            } else {
                setUsers(res.data.data.clients);
            }

            setHasNextPage(res.data.data.hasNextPage || false);
            setLoadDataOption(null);
        } catch (error) {
            toast.error(error?.response?.data?.data?.message || t('errorGettingUsers'));
        } finally {
            setLoading(false);
        }
    }

    // EFFECT TO GET THE USERS
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setPage(1); // Reset page when search changes
            getClients();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [globalFilter]);

    useEffect(() => {
        if (page > 1) {
            getClients();
        }
    }, [page]);

    // DELETE THE PACKAGE HANDLER
    const deleteClientHandler = async () => {
        //GET THE TOKEN
        const token = localStorage.getItem('token');

        await axios
            .delete(`${process.env.API_URL}/admin/remove/client`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    clientId: clientIdToDelete
                }
            })
            .then((_) => {
                // Show notification
                toast.success(t('clientDeleted'));
                // Hide the dialog
                setClientIdToDelete(null);
                // Update the State
                getClients();
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || t('errorDeletingClient'));
            });
    };

    // DELETE CLIENT DIALOG FOOTER
    const clientFooterContent = (
        <div dir="ltr">
            <Button label={t('no')} icon="pi pi-times" onClick={() => setClientIdToDelete(null)} className="p-button-text" />
            <Button
                label={t('yes')}
                icon="pi pi-check"
                onClick={() => {
                    deleteClientHandler();
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
            {/* TOP BAR */}
            <div className="flex flex-column md:flex-row gap-3 md:items-center justify-between mb-3" dir={isRTL ? 'rtl' : 'ltr'}>
                {/* SEARCH BAR */}
                <div className="w-full md:w-6">
                    <span className="p-input-icon-left w-full">
                        <i className="pi pi-search" />
                        <InputText className="w-full" placeholder={t('search')} value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
                    </span>
                </div>

                {/* LOAD MORE SECTION */}
                {hasNextPage && (
                    <div className="flex gap-2 items-center">
                        <Dropdown
                            value={loadDataOption}
                            options={[
                                { label: t('dontSaveOldOrders'), value: 'dontSaveOldData' },
                                { label: t('saveOldOrders'), value: 'saveOldData' }
                            ]}
                            onChange={(e) => setLoadDataOption(e.value)}
                            placeholder={t('loadMore')}
                        />
                        <Button
                            icon={!isRTL ? 'pi pi-angle-double-right' : 'pi pi-angle-double-left'}
                            label={t('nextPart')}
                            loading={loading}
                            disabled={!loadDataOption}
                            onClick={() => {
                                if (!hasNextPage) {
                                    return toast.error(t('noMoreOrders'));
                                }
                                if (!loadDataOption) {
                                    return toast.error(t('selectLoadOption'));
                                }
                                setPage(page + 1);
                            }}
                            severity="success"
                        />
                    </div>
                )}
            </div>

            <DataTable
                dir={isRTL ? 'rtl' : 'ltr'}
                value={users || []}
                style={{ width: '100%' }}
                paginator={true}
                rows={25}
                rowsPerPageOptions={[5, 10, 20, 25, 30, 40, 50]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                emptyMessage={t('noUsersFound')}
                loading={loading}
                globalFilter={globalFilter}
            >
                <Column field="subscriptionId" header={t('membershipId')} sortable filter />
                <Column field="clientName" header={t('name')} sortable filter />
                <Column field="phoneNumber" header={t('mobile')} sortable filter />
                <Column
                    field="subscriped"
                    header={t('subscribed')}
                    sortable
                    body={(rowData) => {
                        // IT SHOULD BE SUBSCRIBED OR NOT
                        return (
                            <span
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    color: rowData.subscriped ? '#28a745' : '#dc3545',
                                    cursor: 'pointer'
                                }}
                            >
                                {rowData.subscriped ? t('subscribed') : t('notSubscribed')}
                            </span>
                        );
                    }}
                />
                <Column
                    field={'_id'}
                    header={t('actions')}
                    body={(rowData) => {
                        return (
                            <div className="flex justify-center gap-2">
                                <button
                                    className="editButton"
                                    onClick={() => {
                                        router.push(`/${locale}/users/wallet/${rowData._id}`);
                                    }}
                                >
                                    {t('wallet')}
                                </button>

                                <button
                                    className="viewButton"
                                    onClick={() => {
                                        router.push(`/${locale}/users/view/${rowData._id}`);
                                    }}
                                >
                                    {t('view')}
                                </button>

                                <button
                                    className="deleteButton"
                                    onClick={() => {
                                        setClientIdToDelete(rowData._id);
                                    }}
                                >
                                    {t('delete')}
                                </button>
                            </div>
                        );
                    }}
                />
            </DataTable>

            {/*  DELETE CLIENT DIALOG  */}
            <Dialog
                dir={isRTL ? 'rtl' : 'ltr'}
                header={t('deleteClient')}
                visible={clientIdToDelete !== null}
                position={'top'}
                style={{ width: '90%', maxWidth: '650px' }}
                onHide={() => setClientIdToDelete(null)}
                footer={clientFooterContent}
                draggable={false}
                resizable={false}
            >
                <p className="m-0">{t('deleteClientConfirmation')}</p>
            </Dialog>
        </>
    );
}
