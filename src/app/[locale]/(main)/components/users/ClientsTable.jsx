'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
// TOAST
import { toast } from 'react-hot-toast';

export default function ClientsTable({ locale, isRTL }) {
    const t = useTranslations('users');

    //ROUTER
    const router = useRouter();

    //STATE FOR THE USERS
    const [page, setPage] = React.useState(1);
    const [users, setUsers] = React.useState([]);
    const [filteredUsers, setFilteredUsers] = React.useState([]);
    const [clientIdToDelete, setClientIdToDelete] = React.useState(null);
    // LOAD MORE STATES
    const [loadDataOption, setLoadDataOption] = useState('saveOldData');
    const [hasNextPage, setHasNextPage] = useState(false);
    const [loading, setLoading] = useState(false);
    // SEARCH STATES
    const [searchInput, setSearchInput] = useState('');
    const [globalFilter, setGlobalFilter] = useState('');
    // FILTER STATES
    const [filters, setFilters] = useState({
        subscriped: null,
        paused: null,
        bundlePeriod: null,
        startDate: null,
        endDate: null
    });
    // Draft filter states (to store values before applying)
    const [draftFilters, setDraftFilters] = useState({
        subscriped: null,
        paused: null,
        bundlePeriod: null,
        startDate: null,
        endDate: null
    });
    const [draftSearchInput, setDraftSearchInput] = useState('');

    // Debounced search handler
    const debouncedSearch = useCallback(
        debounce((value) => {
            setGlobalFilter(value);
        }, 500),
        []
    );

    // Search input change handler
    const handleSearchChange = (e) => {
        setDraftSearchInput(e.target.value);
    };

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // GET THE CLIENTS FROM THE API
    async function getClients() {
        // GET THE TOKEN FROM THE LOCAL STORAGE
        const token = localStorage.getItem('token');
        setLoading(true);

        try {
            // Format dates for API
            const formattedFilters = {
                ...filters,
                startDate: filters.startDate ? filters.startDate.toISOString() : null,
                endDate: filters.endDate ? filters.endDate.toISOString() : null
            };

            // Debug log to check what's being sent to API
            console.log('Sending filters to API:', {
                page,
                search: globalFilter,
                subscriped: formattedFilters.subscriped,
                paused: formattedFilters.paused,
                bundlePeriod: formattedFilters.bundlePeriod,
                startDate: formattedFilters.startDate,
                endDate: formattedFilters.endDate
            });

            const res = await axios.get(`${process.env.API_URL}/all/clients`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    page: page,
                    search: globalFilter,
                    subscriped: formattedFilters.subscriped,
                    paused: formattedFilters.paused,
                    bundlePeriod: formattedFilters.bundlePeriod,
                    startDate: formattedFilters.startDate,
                    endDate: formattedFilters.endDate
                }
            });

            // Debug log to check API response
            console.log('API Response:', res.data);

            let clientsData = [];
            if (loadDataOption === 'saveOldData' && page > 1) {
                clientsData = [...users, ...res.data.data.clients];
                setUsers(clientsData);
            } else {
                clientsData = res.data.data.clients;
                setUsers(clientsData);
            }

            // Apply client-side filtering as a fallback
            applyClientSideFilters(clientsData);

            setHasNextPage(res.data.data.hasNextPage || false);
            setLoadDataOption(null);
        } catch (error) {
            console.error('API Error:', error);
            toast.error(error?.response?.data?.data?.message || t('errorGettingUsers'));
        } finally {
            setLoading(false);
        }
    }

    // Apply client-side filtering
    const applyClientSideFilters = (data) => {
        if (!data) return;

        let result = [...data];

        // Apply subscription filter
        if (filters.subscriped !== null) {
            result = result.filter((client) => client.subscriped === filters.subscriped);
        }

        // Apply pause filter
        if (filters.paused !== null) {
            result = result.filter((client) => client.clientStatus && client.clientStatus.paused === filters.paused);
        }

        // Apply bundle period filter
        if (filters.bundlePeriod) {
            result = result.filter((client) => client.subscripedBundle && client.subscripedBundle.bundlePeriod === filters.bundlePeriod);
        }

        // Apply date filters
        if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            result = result.filter((client) => client.subscripedBundle && client.subscripedBundle.startingDate && new Date(client.subscripedBundle.startingDate) >= startDate);
        }

        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            result = result.filter((client) => client.subscripedBundle && client.subscripedBundle.endingDate && new Date(client.subscripedBundle.endingDate) <= endDate);
        }

        // Apply global search filter
        if (globalFilter) {
            const searchLower = globalFilter.toLowerCase();
            result = result.filter(
                (client) =>
                    (client.clientName && client.clientName.toLowerCase().includes(searchLower)) ||
                    (client.phoneNumber && client.phoneNumber.toLowerCase().includes(searchLower)) ||
                    (client.email && client.email.toLowerCase().includes(searchLower)) ||
                    (client.subscriptionId && String(client.subscriptionId).toLowerCase().includes(searchLower))
            );
        }

        setFilteredUsers(result);
    };

    // Apply filters and search function
    const applyFiltersAndSearch = () => {
        setGlobalFilter(draftSearchInput);
        setSearchInput(draftSearchInput);
        setFilters(draftFilters);
        setPage(1); // Reset page when applying new filters
    };

    // EFFECT TO GET THE USERS
    useEffect(() => {
        console.log('Filters changed:', filters, 'Global filter:', globalFilter);
        getClients();
    }, [globalFilter, filters]);

    // Apply client-side filtering when filters change
    useEffect(() => {
        applyClientSideFilters(users);
    }, [filters, globalFilter, users]);

    useEffect(() => {
        if (page > 1) {
            getClients();
        }
    }, [page]);

    // Initialize draft filters with current filters on component mount
    useEffect(() => {
        setDraftFilters(filters);
        setDraftSearchInput(searchInput);
    }, []);

    // CLEAR FILTERS FUNCTION
    const clearFilters = () => {
        const emptyFilters = {
            subscriped: null,
            paused: null,
            bundlePeriod: null,
            startDate: null,
            endDate: null
        };

        // Update both draft and actual filters
        setDraftFilters(emptyFilters);
        setDraftSearchInput('');

        // Apply changes immediately
        setFilters(emptyFilters);
        setSearchInput('');
        setGlobalFilter('');
    };

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

    // SUBSCRIPTION STATUS TEMPLATE
    const subscriptionStatusTemplate = (rowData) => {
        const severity = rowData.subscriped ? 'success' : 'danger';
        return <Tag severity={severity} value={rowData.subscriped ? t('subscribed') : t('notSubscribed')} />;
    };

    // PAUSE STATUS TEMPLATE
    const pauseStatusTemplate = (rowData) => {
        if (!rowData.clientStatus) return null;
        const severity = rowData.clientStatus.paused ? 'warning' : 'success';
        return <Tag severity={severity} value={rowData.clientStatus.paused ? t('paused') : t('active')} />;
    };

    // BUNDLE PERIOD TEMPLATE
    const bundlePeriodTemplate = (rowData) => {
        if (!rowData.subscripedBundle) return <span>-</span>;
        return <span>{rowData.subscripedBundle.bundlePeriod || '-'}</span>;
    };

    // DATE TEMPLATE
    const dateTemplate = (rowData, field) => {
        if (!rowData.subscripedBundle) return <span>-</span>;
        const date = rowData.subscripedBundle[field];
        if (!date) return <span>-</span>;
        return <span>{new Date(date).toLocaleDateString()}</span>;
    };

    // MEALS SUBMITTED TEMPLATE
    const mealsSubmittedTemplate = (rowData) => {
        if (!rowData.mealsPlan || !rowData.mealsPlan.meals) return <span>0</span>;
        const submittedMeals = rowData.mealsPlan.meals.filter((meal) => meal.submitted).length;
        return <span>{submittedMeals}</span>;
    };

    // MEALS DELIVERED TEMPLATE
    const mealsDeliveredTemplate = (rowData) => {
        if (!rowData.mealsPlan || !rowData.mealsPlan.meals) return <span>0</span>;
        const deliveredMeals = rowData.mealsPlan.meals.filter((meal) => meal.delivered).length;
        return <span>{deliveredMeals}</span>;
    };

    // MEALS SUSPENDED TEMPLATE
    const mealsSuspendedTemplate = (rowData) => {
        if (!rowData.mealsPlan || !rowData.mealsPlan.meals) return <span>0</span>;
        const suspendedMeals = rowData.mealsPlan.meals.filter((meal) => meal.suspended).length;
        return <span>{suspendedMeals}</span>;
    };

    // FILTER OPTIONS
    const subscriptionOptions = [
        { label: 'All', value: null },
        { label: t('subscribed'), value: true },
        { label: t('notSubscribed'), value: false }
    ];

    const pauseOptions = [
        { label: 'All', value: null },
        { label: t('paused'), value: true },
        { label: t('active'), value: false }
    ];

    // BUNDLE PERIOD OPTIONS
    const bundlePeriodOptions = [
        { label: 'All', value: null },
        { label: '1 week', value: '1 week' },
        { label: '3 weeks', value: '3 weeks' },
        { label: '1 month (24)', value: '1 month (24)' },
        { label: '1 month (26)', value: '1 month (26)' }
    ];

    return (
        <>
            {/* TOP BAR */}
            <div className="card mb-4">
                <div className="flex flex-column md:flex-row gap-3 md:items-center justify-between p-3" dir={isRTL ? 'rtl' : 'ltr'}>
                    {/* SEARCH BAR */}
                    <div className="w-full md:w-6">
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-search" />
                            <InputText className="w-full" placeholder={t('search')} value={draftSearchInput} onChange={handleSearchChange} />
                        </span>
                    </div>

                    {/* FILTERS */}
                    <div className="flex flex-column md:flex-row gap-2">
                        <Dropdown value={draftFilters.subscriped} options={subscriptionOptions} onChange={(e) => setDraftFilters({ ...draftFilters, subscriped: e.value })} placeholder="Subscription Status" className="w-full md:w-auto" />
                        <Dropdown value={draftFilters.paused} options={pauseOptions} onChange={(e) => setDraftFilters({ ...draftFilters, paused: e.value })} placeholder="Pause Status" className="w-full md:w-auto" />
                        <Dropdown value={draftFilters.bundlePeriod} options={bundlePeriodOptions} onChange={(e) => setDraftFilters({ ...draftFilters, bundlePeriod: e.value })} placeholder={t('bundlePeriod')} className="w-full md:w-auto" />
                    </div>

                    {/* DATE FILTERS */}
                    <div className="flex flex-column md:flex-row gap-2">
                        <Calendar value={draftFilters.startDate} onChange={(e) => setDraftFilters({ ...draftFilters, startDate: e.value })} placeholder={t('startingDate')} showIcon className="w-full md:w-auto" />
                        <Calendar value={draftFilters.endDate} onChange={(e) => setDraftFilters({ ...draftFilters, endDate: e.value })} placeholder={t('endingDate')} showIcon className="w-full md:w-auto" />
                        <Button icon="pi pi-filter-slash" tooltip="Clear Filters" tooltipOptions={{ position: 'top' }} onClick={clearFilters} className="p-button-outlined p-button-danger" />
                        <Button icon="pi pi-filter" tooltip="Apply Filters" tooltipOptions={{ position: 'top' }} onClick={applyFiltersAndSearch} className="p-button-success" />
                    </div>
                </div>
            </div>

            {/* LOAD MORE SECTION */}
            {hasNextPage && (
                <div className="flex gap-2 items-center mb-3 justify-content-end">
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

            <div className="card">
                <div className="flex justify-content-between align-items-center mb-2 px-3 pt-3">
                    <h2 className="text-xl font-bold m-0">{t('clients')}</h2>
                    <div className="flex gap-2">
                        <Button icon="pi pi-refresh" tooltip="Refresh" tooltipOptions={{ position: 'left' }} onClick={() => getClients()} className="p-button-outlined" />
                    </div>
                </div>
                <DataTable
                    dir={isRTL ? 'rtl' : 'ltr'}
                    value={filteredUsers.length > 0 ? filteredUsers : users}
                    style={{ width: '100%' }}
                    paginator={true}
                    rows={50}
                    rowsPerPageOptions={[5, 10, 20, 25, 30, 40, 50]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    emptyMessage={t('noUsersFound')}
                    loading={loading}
                    globalFilter={null} // We're handling filtering ourselves
                    resizableColumns
                    columnResizeMode="fit"
                    scrollable
                    scrollHeight="flex"
                    stripedRows
                    showGridlines
                    className="p-datatable-sm"
                >
                    <Column field="subscriptionId" header={t('membershipId')} sortable filter style={{ minWidth: '8rem' }} />
                    <Column field="clientName" header={t('name')} sortable filter style={{ minWidth: '12rem' }} />
                    <Column field="phoneNumber" header={t('mobile')} sortable filter style={{ minWidth: '10rem' }} />
                    <Column field="email" header={t('clientEmail')} sortable filter style={{ minWidth: '12rem' }} />
                    <Column field="subscriped" header="Subscription Status" body={subscriptionStatusTemplate} sortable style={{ minWidth: '10rem' }} />
                    <Column field="clientStatus.paused" header="Pause Status" body={pauseStatusTemplate} sortable style={{ minWidth: '8rem' }} />
                    <Column field="subscripedBundle.bundlePeriod" header={t('bundlePeriod')} body={bundlePeriodTemplate} sortable style={{ minWidth: '10rem' }} />
                    <Column field="subscripedBundle.startingDate" header={t('startingDate')} body={(rowData) => dateTemplate(rowData, 'startingDate')} sortable style={{ minWidth: '10rem' }} />
                    <Column field="subscripedBundle.endingDate" header={t('endingDate')} body={(rowData) => dateTemplate(rowData, 'endingDate')} sortable style={{ minWidth: '10rem' }} />
                    <Column header="Meals Submitted" body={mealsSubmittedTemplate} style={{ minWidth: '8rem' }} />
                    <Column header="Meals Delivered" body={mealsDeliveredTemplate} style={{ minWidth: '8rem' }} />
                    <Column header="Meals Suspended" body={mealsSuspendedTemplate} style={{ minWidth: '8rem' }} />
                    <Column
                        field={'_id'}
                        header={t('actions')}
                        body={(rowData) => {
                            return (
                                <div className="flex justify-center gap-2">
                                    <Button
                                        icon="pi pi-wallet"
                                        tooltip={t('wallet')}
                                        outlined
                                        tooltipOptions={{ position: 'top' }}
                                        className="p-button-success p-button-sm"
                                        onClick={() => {
                                            router.push(`/${locale}/users/wallet/${rowData._id}`);
                                        }}
                                    />

                                    <Button
                                        icon="pi pi-eye"
                                        tooltip={t('view')}
                                        outlined
                                        tooltipOptions={{ position: 'top' }}
                                        className="p-button-info p-button-sm"
                                        onClick={() => {
                                            router.push(`/${locale}/users/view/${rowData._id}`);
                                        }}
                                    />

                                    <Button
                                        icon="pi pi-trash"
                                        tooltip={t('delete')}
                                        outlined
                                        tooltipOptions={{ position: 'top' }}
                                        className="p-button-danger p-button-sm"
                                        onClick={() => {
                                            setClientIdToDelete(rowData._id);
                                        }}
                                    />
                                </div>
                            );
                        }}
                        style={{ minWidth: '12rem' }}
                    />
                </DataTable>
            </div>

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
                className="border-round-xl shadow-8"
            >
                <div className="flex align-items-center gap-3 p-3">
                    <i className="pi pi-exclamation-triangle text-yellow-500 text-4xl"></i>
                    <p className="m-0 text-lg">{t('deleteClientConfirmation')}</p>
                </div>
            </Dialog>
        </>
    );
}
