'use client';
import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { toast } from 'react-hot-toast';
import { Tag } from 'primereact/tag';
import { useTranslations } from 'next-intl';

export default function Wallets({ wallet: serverWallet, id, locale, isRTL }) {
    const t = useTranslations('userWallets');

    // STATES
    const [wallet, setWallet] = useState(serverWallet || {});
    const [addBonusAmount, setAddBonusAmount] = useState(0);
    const [deductBalanceAmount, setDeductBalanceAmount] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [dialogsState, setDialogsState] = useState({
        addBonus: false,
        deductBalance: false,
        blockWallet: false
    });

    // GET TRANSACTIONS FUNCTION
    const getTransactions = async () => {
        // GET THE TRANSACTIONS
        const token = localStorage.getItem('token');

        return await axios
            .get(`${process.env.API_URL}/wallet/transactions`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    walletId: wallet?._id,
                    // || DATE BEFORE 30 DAYS
                    dateFrom: startDate || new Date(new Date().setDate(new Date().getDate() - 30)),
                    // || CURRENT DATE + 1 DAY
                    dateTo: endDate || new Date(new Date().setDate(new Date().getDate() + 1))
                }
            })
            .then((response) => {
                setTransactions(response.data?.walletMovements?.movements || []);
            })
            .catch((error) => {
                console.log(error?.response?.data?.message);
            });
    };

    // ADD BONUS FUNCTION
    const addBonus = async () => {
        // VALIDATE THE AMOUNT
        if (isNaN(+addBonusAmount)) {
            toast.error('Amount should be a number');
            return;
        }

        if (Number(addBonusAmount) <= 0) {
            toast.error('Amount should be greater than 0');
            return;
        }

        // ADD BONUS
        const token = localStorage.getItem('token');

        return await axios
            .post(
                `${process.env.API_URL}/add/wallet/bonus`,
                {
                    walletId: wallet?._id,
                    amount: addBonusAmount
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            .then((_) => {
                // CLOSE THE DIALOG
                setDialogsState({ ...dialogsState, addBonus: false });

                // SHOW SUCCESS MESSAGE
                toast.success('Bonus Added');
                // GET THE WALLET INFO
                getUserWallet(id);
                // GET THE TRANSACTIONS
                getTransactions();
            })
            .catch((error) => {
                console.log(error?.response?.data?.message);
                toast(error?.response?.data?.message);
            });
    };

    // DEDUCT BALANCE FUNCTION
    const deductBalance = async () => {
        // DEDUCT BALANCE
        const token = localStorage.getItem('token');

        // VALIDATE THE AMOUNT
        if (isNaN(+deductBalanceAmount)) {
            toast.error('Amount should be a number');
            return;
        }

        if (Number(deductBalanceAmount) <= 0) {
            toast.error('Amount should be greater than 0');
            return;
        }

        if (Number(deductBalanceAmount) > wallet?.balance) {
            toast.error('Amount should be less than the balance');
            return;
        }

        return await axios
            .post(
                `${process.env.API_URL}/deduct/wallet/balance`,
                {
                    walletId: wallet?._id,
                    amount: deductBalanceAmount
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            .then((response) => {
                console.log(response.data);
                // CLOSE THE DIALOG
                setDialogsState({ ...dialogsState, deductBalance: false });
                // SHOW SUCCESS MESSAGE
                toast.success('Balance Deducted');
                // GET THE WALLET INFO
                getUserWallet(id);
                // GET THE TRANSACTIONS
                getTransactions();
            })
            .catch((error) => {
                console.log(error?.response?.data?.message);
                toast.error(error?.response?.data?.message);
            });
    };

    // BLOCK AND UNBLOCK WALLET FUNCTION
    const blockAndUnblockWallet = async (status) => {
        // BLOCK AND UNBLOCK WALLET
        const token = localStorage.getItem('token');

        return await axios
            .post(
                `${process.env.API_URL}/block/wallet`,
                {
                    walletId: wallet?._id,
                    status
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            .then((_) => {
                // SHOW SUCCESS MESSAGE
                toast.success('Wallet Status Changed');
                // GET THE WALLET INFO
                getUserWallet(id);
                // CLOSE THE DIALOG
                setDialogsState({ ...dialogsState, blockWallet: false });
            })
            .catch((error) => {
                console.log(error?.response?.data?.message);
                toast.error(error?.response?.data?.message);
            });
    };

    // GET USER WALLET FUNCTION
    const getUserWallet = async (id) => {
        // GET THE TOKEN FROM THE COOKIE
        const token = localStorage.getItem('token');
        axios
            .get(`${process.env.API_URL}/show/client/wallet?clientId=${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                console.log(response.data);
                setWallet(response.data?.wallet || {});
            })
            .catch((error) => {
                console.log(error?.response?.data?.message);
            });
    };

    // EFFECT TO GET THE TRANSACTIONS
    useEffect(() => {
        // GET THE TRANSACTIONS
        getTransactions();
    }, []);

    return (
        <>
            <div dir={isRTL ? 'rtl' : 'ltr'}>
                {/*  ACTIONS PART  */}
                <div className={'card'}>
                    <h3 className={'uppercase'}>{t('walletActions')}</h3>
                    <hr />
                    <div className={'grid formgrid'}>
                        <div className={'col-12 md:col-4'}>
                            <Button
                                label={t('addBonus')}
                                icon={'pi pi-plus'}
                                className={'btn btn-primary mb-2'}
                                style={{ width: '100%' }}
                                onClick={() => {
                                    setDialogsState({ ...dialogsState, addBonus: true });
                                }}
                            />
                        </div>
                        <div className={'col-12 md:col-4'}>
                            <Button label={t('deductBalance')} icon={'pi pi-minus'} className={'btn btn-danger mb-2'} severity={'danger'} style={{ width: '100%' }} onClick={() => setDialogsState({ ...dialogsState, deductBalance: true })} />
                        </div>
                        <div className={'col-12 md:col-4'}>
                            <Button label={t('changeStatus')} icon={'pi pi-ban'} className={'btn btn-warning mb-2'} severity={'warning'} style={{ width: '100%' }} onClick={() => setDialogsState({ ...dialogsState, blockWallet: true })} />
                        </div>
                    </div>
                </div>

                {/*  USER INFO  */}
                <div className={'card'}>
                    <h3 className={'uppercase'}>{t('userInfo')}</h3>
                    <hr />
                    <div className={'grid'}>
                        {/*BALANCE*/}
                        <div className={'col-12 md:col-6'}>
                            <h5 className={'text-gray-700 uppercase text-md'}>{t('balance')}</h5>
                            <p className={'text-green-500 font-bold text-4xl uppercase'}>{wallet?.balance}</p>
                        </div>

                        {/*IS BLOCKED*/}
                        <div className={'col-12 md:col-6'}>
                            <h5 className={'text-gray-700 uppercase text-md'}>{t('status')}</h5>
                            <p className={wallet?.isBlocked ? 'text-red-500 font-bold uppercase text-2xl' : 'text-green-500 font-bold uppercase text-2xl'}>{wallet?.isBlocked ? t('blocked') : t('active')}</p>
                        </div>

                        <div className={'col-12 md:col-6'}>
                            <h5 className={'text-gray-700 uppercase text-md'}>{t('name')}</h5>
                            <p>{wallet?.clientId?.clientName}</p>
                        </div>
                        <div className={'col-12 md:col-6'}>
                            <h5 className={'text-gray-700 uppercase text-md'}>{t('phoneNumber')}</h5>
                            <p>{wallet?.clientId?.phoneNumber}</p>
                        </div>
                        <div className={'col-12 md:col-6'}>
                            <h5 className={'text-gray-700 uppercase text-md'}>{t('email')}</h5>
                            <p>{wallet?.clientId?.email}</p>
                        </div>
                        <div className={'col-12 md:col-6'}>
                            <h5 className={'text-gray-700 uppercase text-md'}>{t('governorate')}</h5>
                            <p>{wallet?.clientId?.governorate}</p>
                        </div>
                        <div className={'col-12 md:col-6'}>
                            <h5 className={'text-gray-700 uppercase text-md'}>{t('region')}</h5>
                            <p>{wallet?.clientId?.region}</p>
                        </div>
                        <div className={'col-12 md:col-6'}>
                            <h5 className={'text-gray-700 uppercase text-md'}>{t('buildingblock')}</h5>
                            <p>{wallet?.clientId?.block}</p>
                        </div>
                        <div className={'col-12 md:col-6'}>
                            <h5 className={'text-gray-700 uppercase text-md'}>{t('street')}</h5>
                            <p>{wallet?.clientId?.street}</p>
                        </div>
                        <div className={'col-12 md:col-6'}>
                            <h5 className={'text-gray-700 uppercase text-md'}>{t('alley')}</h5>
                            <p>{wallet?.clientId?.alley}</p>
                        </div>
                        <div className={'col-12 md:col-6'}>
                            <h5 className={'text-gray-700 uppercase text-md'}>{t('building')}</h5>
                            <p>{wallet?.clientId?.building}</p>
                        </div>
                        <div className={'col-12 md:col-6'}>
                            <h5 className={'text-gray-700 uppercase text-md'}>{t('floor')}</h5>
                            <p>{wallet?.clientId?.floor}</p>
                        </div>
                        <div className={'col-12 md:col-6'}>
                            <h5 className={'text-gray-700 uppercase text-md'}>{t('apartment')}</h5>
                            <p>{wallet?.clientId?.apartment}</p>
                        </div>
                        <div className={'col-12 md:col-6'}>
                            <h5 className={'text-gray-700 uppercase text-md'}>{t('gender')}</h5>
                            <p>{wallet?.clientId?.gender}</p>
                        </div>
                    </div>
                </div>

                {/*  TRANSACTION HISTORY  */}
                <div className={'card'}>
                    <h3 className={'uppercase'}>{t('transactionHistory')}</h3>
                    <hr />
                    <div className={'grid'}>
                        <div className={'col-12 grid'}>
                            <div className={'col-12 md:col-5'}>
                                <Calendar value={startDate || null} onChange={(e) => setStartDate(e.value)} readOnly showIcon showButtonBar dateFormat={'dd/mm/yy'} placeholder={t('startDate')} style={{ width: '100%' }} />
                            </div>
                            <div className={'col-12 md:col-5'}>
                                <Calendar value={endDate || null} onChange={(e) => setEndDate(e.value)} readOnly showIcon showButtonBar dateFormat={'dd/mm/yy'} placeholder={t('endDate')} style={{ width: '100%' }} />
                            </div>
                            <div className={'col-12 md:col-2'}>
                                <Button label={t('filter')} icon={'pi pi-filter'} className={'btn btn-primary'} style={{ width: '100%', height: '100%' }} onClick={() => getTransactions()} />
                            </div>
                        </div>
                        <div className={'col-12'}>
                            <DataTable dir={isRTL ? 'rtl' : 'ltr'} value={transactions || []} paginator rows={25} rowsPerPageOptions={[5, 10, 15, 25, 50, 100]} emptyMessage={t('noTransactionsFound')}>
                                <Column
                                    field={'_id'}
                                    header={t('transactionId')}
                                    sortable
                                    filter={true}
                                    body={(rowData) => {
                                        // ADD COPY TO CLIPBOARD FUNCTION
                                        return (
                                            <span
                                                className={'text-blue-500 cursor-pointer'}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(rowData._id);
                                                    toast.success(t('transactionIdCopied'));
                                                }}
                                            >
                                                {rowData._id}
                                            </span>
                                        );
                                    }}
                                />
                                <Column field={'reason'} header={t('reason')} sortable filter={true} />
                                <Column
                                    field={'amount'}
                                    header={t('amount')}
                                    sortable
                                    filter={true}
                                    body={(rowData) => {
                                        const types = ['deposit', 'withdraw', 'bonus', 'balance deduction'];
                                        // TAGE WITH CUSTOM COLOR FOR EACH TYPE
                                        return (
                                            <span
                                                className={
                                                    types.indexOf(rowData.movementType) === 0
                                                        ? 'text-green-500 font-bold'
                                                        : types.indexOf(rowData.movementType) === 1
                                                        ? 'text-red-500 font-bold'
                                                        : types.indexOf(rowData.movementType) === 2
                                                        ? 'text-blue-500 font-bold'
                                                        : 'text-yellow-500 font-bold'
                                                }
                                            >
                                                {rowData.amount}
                                            </span>
                                        );
                                    }}
                                />
                                <Column
                                    field={'movementType'}
                                    header={t('type')}
                                    sortable
                                    filter={true}
                                    body={(rowData) => {
                                        const types = ['deposit', 'withdraw', 'bonus', 'balance deduction'];
                                        // TAGE WITH CUSTOM COLOR FOR EACH TYPE
                                        return (
                                            <Tag
                                                value={rowData.movementType}
                                                severity={types.indexOf(rowData.movementType) === 0 ? 'success' : types.indexOf(rowData.movementType) === 1 ? 'danger' : types.indexOf(rowData.movementType) === 2 ? 'info' : 'warning'}
                                            />
                                        );
                                    }}
                                />
                                <Column
                                    field={'date'}
                                    header={t('date')}
                                    sortable
                                    body={(rowData) => {
                                        return new Date(rowData.date).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        });
                                    }}
                                />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog dir={isRTL ? 'rtl' : 'ltr'} onHide={() => setDialogsState({ ...dialogsState, addBonus: false })} visible={dialogsState.addBonus} header={t('addBonusHeader')} className={'dialogSize'}>
                <div className={'grid formgrid gap-4 w-full'}>
                    <div className={'col-12'}>
                        <h5 className={'text-gray-700 uppercase text-md'}>{t('amount')}</h5>
                        <InputNumber value={addBonusAmount} onValueChange={(e) => setAddBonusAmount(e.value)} placeholder={t('amount')} className={'w-full mb-2'} />
                        <Button label={t('addBonus')} className={'btn btn-primary'} style={{ width: '100%' }} onClick={() => addBonus()} />
                    </div>
                </div>
            </Dialog>
            <Dialog dir={isRTL ? 'rtl' : 'ltr'} onHide={() => setDialogsState({ ...dialogsState, deductBalance: false })} visible={dialogsState.deductBalance} header={t('deductBalanceHeader')} className={'dialogSize'}>
                <div className={'grid formgrid gap-4 w-full'}>
                    <div className={'col-12'}>
                        <h5 className={'text-gray-700 uppercase text-md'}>{t('amount')}</h5>
                        <InputNumber value={deductBalanceAmount} onValueChange={(e) => setDeductBalanceAmount(e.value)} placeholder={t('amount')} className={'w-full mb-2'} />
                        <Button label={t('deductBalance')} className={'btn btn-danger'} severity={'danger'} style={{ width: '100%' }} onClick={() => deductBalance()} />
                    </div>
                </div>
            </Dialog>
            <Dialog dir={isRTL ? 'rtl' : 'ltr'} onHide={() => setDialogsState({ ...dialogsState, blockWallet: false })} visible={dialogsState.blockWallet} header={t('blockAndUnblockWalletHeader')} className={'dialogSize'}>
                <div className={'grid formgrid gap-4 w-full'}>
                    <div className={'col-12'}>
                        <h5 className={'text-gray-700 uppercase text-md mb-4'}>{t('chooseAction')}</h5>
                        <div className={'grid'}>
                            <div className={'col-12 md:col-6 mb-2'}>
                                <Button label={t('block')} className={'btn btn-danger'} severity={'danger'} style={{ width: '100%' }} onClick={() => blockAndUnblockWallet(true)} />
                            </div>
                            <div className={'col-12 md:col-6'}>
                                <Button label={t('unblock')} className={'btn btn-success'} severity={'success'} style={{ width: '100%' }} onClick={() => blockAndUnblockWallet(false)} />
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    );
}
