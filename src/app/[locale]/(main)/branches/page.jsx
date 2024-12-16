'use client';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
// AXIOS
import axios from 'axios';
// TOAST
import { toast } from 'react-hot-toast';
// COMPONENTS
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';

export default function Branches({ params: { locale } }) {
    const t = useTranslations('branches');
    const isRTL = locale === 'ar';

    // VARIABLES
    let page = 1;
    let rowsPerPage = 25;

    // STATES
    const [branches, setBranches] = useState([]);
    const [visible, setVisible] = React.useState(false);
    const [branchIdToDelete, setBranchIdToDelete] = React.useState(null);
    const [loading, setLoading] = useState(false);
    const [branch, setBranch] = useState({
        branchName: '',
        branchId: ''
    });

    // SUBMIT HANDLER
    const submitHandler = (e) => {
        e.preventDefault();
        // VALIDATION
        if (!branch.branchName) {
            toast.error(t('branchNameRequired'));
            return;
        }

        if (!branch.branchId) {
            toast.error(t('branchIdRequired'));
            return;
        }

        // GET THE TOKEN
        const token = localStorage.getItem('token');

        if (!token) {
            toast.error(t('loginFirst'));
            return;
        }

        // SUBMIT
        setLoading(true);

        axios
            .post(
                `${process.env.API_URL}/create/branch`,
                {
                    branchName: branch.branchName,
                    branchFoodicsId: branch.branchId
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            .then((_) => {
                setLoading(false);
                toast.success(t('branchSetSuccess'));
                setBranch({
                    branchName: '',
                    branchId: ''
                });
                getBranches();
            })
            .catch((_) => {
                setLoading(false);
                toast.error(t('somethingWentWrong'));
            });
    };

    // FUNCTION TO GET THE SHIFTS
    const getBranches = () => {
        // GET THE TOKEN FROM LOCAL STORAGE
        const token = localStorage.getItem('token');

        // GET SHIFTS
        if (token) {
            axios
                .get(`${process.env.API_URL}/all/branches`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                .then((res) => {
                    setBranches(res.data?.branches);
                })
                .catch((err) => {
                    toast.error(err.response?.data?.message || t('somethingWentWrong'));
                });
        } else {
            toast.error(t('notAuthorized'));
        }
    };

    // FETCH SHIFTS
    useEffect(() => {
        getBranches();
    }, []);

    // DELETE THE BRANCH HANDLER
    const deleteHandler = async () => {
        //GET THE TOKEN
        const token = localStorage.getItem('token');

        await axios
            .delete(`${process.env.API_URL}/delete/branch`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    branchId: branchIdToDelete
                }
            })
            .then((_) => {
                // Show notification
                toast.success(t('mealDeletedSuccess'));
                // Hide the dialog
                setVisible(false);
                // Update the State
                getBranches();
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || t('somethingWentWrong'));
            });
    };

    const footerContent = (
        <div dir="ltr">
            <Button label="No" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
            <Button
                label="Yes"
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
            <div className="card" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="card-header">
                    <h5 className="card-title uppercase">{t('setBranch')}</h5>
                </div>
                <form className={'p-fluid formgrid grid'} onSubmit={submitHandler}>
                    <div className="field col-12">
                        <label htmlFor="branchName" className={'font-bold'}>
                            {t('branchName')}
                        </label>
                        <InputText id="branchName" value={branch.branchName} onChange={(e) => setBranch({ ...branch, branchName: e.target.value })} placeholder={t('branchName')} />
                    </div>

                    <div className="field col-12">
                        <label htmlFor="branchId" className={'font-bold'}>
                            {t('branchId')}
                        </label>
                        <InputText id="branchId" value={branch.branchId} onChange={(e) => setBranch({ ...branch, branchId: e.target.value })} placeholder={t('branchId')} />
                    </div>

                    <div className="col-12">
                        <Button
                            type="submit"
                            className="bg-slate-500 w-full"
                            style={{
                                width: '100%',
                                background: loading ? '#dcdcf1' : 'var(--primary-color)'
                            }}
                            label={
                                loading ? (
                                    <ProgressSpinner
                                        strokeWidth="4"
                                        style={{
                                            width: '1.5rem',
                                            height: '1.5rem'
                                        }}
                                    />
                                ) : (
                                    t('submit')
                                )
                            }
                        />
                    </div>
                </form>
            </div>
            <div className="card" dir={isRTL ? 'rtl' : 'ltr'}>
                <h3 className="text-2xl mb-5 uppercase">{t('branchesList')}</h3>
                <hr />
                <DataTable
                    value={branches}
                    paginator
                    first={page * rowsPerPage}
                    rows={rowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    sortMode="multiple"
                    emptyMessage={t('noRecordsFound')}
                    // Max height of the table container
                    scrollable
                    scrollHeight="calc(100vh - 370px)"
                >
                    <Column field="branchName" header={t('branchName')} sortable filter filterPlaceholder={t('branchName')} />
                    <Column
                        field="branchFoodicsId"
                        header={t('branchId')}
                        sortable
                        filter
                        filterPlaceholder={t('branchId')}
                        body={(rowData) => {
                            // ADD COPY FUNCTIONALITY WHEN CLICKING ON THE ID
                            return (
                                <div className="flex items-center">
                                    <span
                                        className="mr-2"
                                        onClick={() => {
                                            navigator.clipboard.writeText(rowData.branchFoodicsId);
                                            toast.success(t('copiedToClipboard'));
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                            color: 'var(--primary-color)'
                                        }}
                                    >
                                        {rowData.branchFoodicsId}
                                    </span>
                                </div>
                            );
                        }}
                    />
                    <Column
                        field={'_id'}
                        header={t('actions')}
                        body={(rowData) => {
                            return (
                                <button
                                    className="deleteButton"
                                    onClick={() => {
                                        setVisible(true);
                                        setBranchIdToDelete(rowData._id);
                                    }}
                                >
                                    {t('delete')}
                                </button>
                            );
                        }}
                    />
                </DataTable>
            </div>
            <Dialog dir={isRTL ? 'rtl' : 'ltr'} header={t('deleteBranch')} visible={visible} position={'top'} style={{ width: '90%', maxWidth: '650px' }} onHide={() => setVisible(false)} footer={footerContent} draggable={false} resizable={false}>
                <p className="m-0">{t('deleteConfirmation')}</p>
            </Dialog>
        </>
    );
}
