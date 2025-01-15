'use client';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
// TOAST
import { toast } from 'react-hot-toast';

export default function EmployeesTable({ locale, isRTL }) {
    const t = useTranslations('users');

    //ROUTER
    const router = useRouter();

    //STATE FOR THE USERS
    const [page, setPage] = React.useState(1);
    const [users, setUsers] = React.useState([]);
    const [employeeIdToDelete, setEmployeeIdToDelete] = React.useState(null);
    // LOAD MORE STATES
    const [loadDataOption, setLoadDataOption] = useState('saveOldData');
    const [hasNextPage, setHasNextPage] = useState(false);
    const [loading, setLoading] = useState(false);
    // SEARCH STATE
    const [globalFilter, setGlobalFilter] = useState('');

    // GET THE EMPLOYEES FROM THE API
    async function getEmployees() {
        // GET THE TOKEN FROM THE LOCAL STORAGE
        const token = localStorage.getItem('token');
        setLoading(true);

        try {
            const res = await axios.get(`${process.env.API_URL}/get/all/users`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    page: page,
                    search: globalFilter
                }
            });

            if (loadDataOption === 'saveOldData' && page > 1) {
                setUsers((prev) => [...prev, ...res.data.users]);
            } else {
                setUsers(res.data.users);
            }

            setHasNextPage(res.data.hasNextPage || false);
            setLoadDataOption(null);
        } catch (error) {
            toast.error(error?.response?.data?.message || t('errorGettingUsers'));
        } finally {
            setLoading(false);
        }
    }

    // EFFECT TO GET THE USERS
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setPage(1); // Reset page when search changes
            getEmployees();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [globalFilter]);

    useEffect(() => {
        if (page > 1) {
            getEmployees();
        }
    }, [page]);

    // DELETE THE EMPLOYEE HANDLER
    const deleteEmployeeHandler = async () => {
        //GET THE TOKEN
        const token = localStorage.getItem('token');

        await axios
            .delete(`${process.env.API_URL}/delete/user`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    userId: employeeIdToDelete
                }
            })
            .then((_) => {
                // Show notification
                toast.success(t('employeeDeleted'));
                // Hide the dialog
                setEmployeeIdToDelete(null);
                // Update the State
                getEmployees();
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || t('errorDeletingEmployee'));
            });
    };

    // DELETE EMPLOYEE DIALOG FOOTER
    const employeeFooterContent = (
        <div dir="ltr">
            <Button label={t('no')} icon="pi pi-times" onClick={() => setEmployeeIdToDelete(null)} className="p-button-text" />
            <Button
                label={t('yes')}
                icon="pi pi-check"
                onClick={() => {
                    deleteEmployeeHandler();
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
                <Column
                    field="userImage"
                    header={t('employeeImage')}
                    body={(rowData) => (
                        <Image
                            src={rowData.userImage}
                            alt={rowData.fullName}
                            width={50}
                            height={50}
                            style={{
                                borderRadius: '50%',
                                objectFit: 'cover'
                            }}
                        />
                    )}
                />
                <Column field="fullName" header={t('employeeName')} sortable filter />
                <Column field="username" header={t('employeeUsername')} sortable filter />
                <Column field="phoneNumber" header={t('employeePhone')} sortable filter />
                <Column field="address" header={t('employeeAddress')} sortable filter />
                <Column
                    field={'_id'}
                    header={t('actions')}
                    body={(rowData) => (
                        <div className="flex justify-center gap-2">
                            <button
                                className="editButton"
                                onClick={() => {
                                    router.push(`/${locale}/users/${rowData._id}`);
                                }}
                            >
                                {t('edit')}
                            </button>

                            <button
                                className="deleteButton"
                                onClick={() => {
                                    setEmployeeIdToDelete(rowData._id);
                                }}
                            >
                                {t('delete')}
                            </button>
                        </div>
                    )}
                />
            </DataTable>

            {/* DELETE EMPLOYEE DIALOG */}
            <Dialog
                dir={isRTL ? 'rtl' : 'ltr'}
                header={t('deleteEmployee')}
                visible={employeeIdToDelete !== null}
                position={'top'}
                style={{ width: '90%', maxWidth: '650px' }}
                onHide={() => setEmployeeIdToDelete(null)}
                footer={employeeFooterContent}
                draggable={false}
                resizable={false}
            >
                <p className="m-0">{t('deleteEmployeeConfirmation')}</p>
            </Dialog>
        </>
    );
}
