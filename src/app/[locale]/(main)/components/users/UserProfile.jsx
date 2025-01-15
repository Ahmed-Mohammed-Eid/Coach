'use client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import toast from 'react-hot-toast';
import { Sidebar } from 'primereact/sidebar';
import { Dropdown } from 'primereact/dropdown';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Checkbox } from 'primereact/checkbox';
import { RadioButton } from 'primereact/radiobutton';

export default function UserProfile({ id, locale }) {
    // ROUTER
    const router = useRouter();
    const t = useTranslations('userProfile');
    const isRTL = locale === 'ar';

    // STATE
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRenewDialog, setShowRenewDialog] = useState(false);
    const [showFreezeDialog, setShowFreezeDialog] = useState(false);
    const [showUnfreezeDialog, setShowUnfreezeDialog] = useState(false);
    const [renewalDate, setRenewalDate] = useState(null);
    const [freezeDate, setFreezeDate] = useState(null);
    const [unfreezeDate, setUnfreezeDate] = useState(null);
    const [freezePeriod, setFreezePeriod] = useState(1);
    const [showEditSidebar, setShowEditSidebar] = useState(false);
    const [editFormData, setEditFormData] = useState({
        clientName: '',
        phoneNumber: '',
        gender: '',
        governorate: '',
        region: '',
        block: '',
        street: '',
        alley: '',
        building: '',
        floor: '',
        appartment: '',
        carb: '',
        protine: ''
    });
    const [showModifyDaysDialog, setShowModifyDaysDialog] = useState(false);
    const [modifyDaysData, setModifyDaysData] = useState({
        numberOfDays: 1,
        action: 'add'
    });
    const [bundles, setBundles] = useState([]);
    const [renewForm, setRenewForm] = useState({
        bundleId: '',
        bundlePeriod: '',
        hasCoupon: false,
        couponCode: '',
        requirePayment: false,
        startingAt: null
    });
    const [renewType, setRenewType] = useState('same'); // 'same' or 'new'

    // get user data handler
    const getUserData = async () => {
        setLoading(true);
        // GET TOKEN
        const token = localStorage.getItem('token');

        try {
            const response = await axios.get(`${process.env.API_URL}/client/details?clientId=${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUserData(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch user data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUserData();
    }, []);

    useEffect(() => {
        if (userData?.clientData) {
            const { clientData } = userData;
            setEditFormData({
                clientName: clientData.clientName,
                phoneNumber: clientData.phoneNumber,
                gender: clientData.gender,
                governorate: clientData.governorate,
                region: clientData.region,
                block: clientData.block,
                street: clientData.street,
                alley: clientData.alley || '',
                building: clientData.building,
                floor: clientData.floor,
                appartment: clientData.appartment,
                carb: clientData.carb,
                protine: clientData.protine
            });
        }
    }, [userData]);

    const confirmDelete = () => {
        confirmDialog({
            message: t('dialogs.delete.message', 'Are you sure you want to delete this user?'),
            header: t('dialogs.delete.header', 'Delete Confirmation'),
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: handleDelete,
            reject: () => {
                toast.error(t('dialogs.delete.cancelled', 'User deletion cancelled'));
            }
        });
    };

    const handleFreeze = () => {
        setShowFreezeDialog(true);
    };

    const submitFreeze = async () => {
        if (!freezeDate || !freezePeriod) {
            toast.error('Please select both date and period');
            return;
        }

        const token = localStorage.getItem('token');

        try {
            // Format date to MM-DD-YYYY
            const formattedDate = freezeDate
                .toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                })
                .replace(/\//g, '-');

            const response = await axios.post(
                `${process.env.API_URL}/pause/client/subscription`,
                {
                    clientId: id,
                    pauseDate: formattedDate,
                    period: freezePeriod
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                toast.success('Subscription frozen successfully');
                setShowFreezeDialog(false);
                getUserData(); // Refresh user data
            } else {
                toast.error(response.data.message || 'Failed to freeze subscription');
            }
        } catch (error) {
            console.error('Freeze error:', error);
            toast.error(error.response?.data?.message || 'Failed to freeze subscription');
        }
    };

    const freezeDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label={t('actions.cancel')} icon="pi pi-times" onClick={() => setShowFreezeDialog(false)} className="p-button-outlined flex-1" />
            <Button label={t('actions.freeze')} icon="pi pi-check" onClick={submitFreeze} severity="warning" autoFocus className="flex-1" />
        </div>
    );

    const handleDelete = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.delete(`${process.env.API_URL}/admin/remove/client`, {
                params: {
                    clientId: id
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                toast.success('User deleted successfully');
                // Optionally redirect to users list or handle navigation
                window.history.back(); // Go back to previous page
            } else {
                toast.error(response.data.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleUnfreeze = () => {
        setShowUnfreezeDialog(true);
    };

    const submitUnfreeze = async () => {
        if (!unfreezeDate) {
            toast.error('Please select activation date');
            return;
        }

        const token = localStorage.getItem('token');

        try {
            // Format date to M-D-YYYY
            const formattedDate = unfreezeDate
                .toLocaleDateString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric'
                })
                .replace(/\//g, '-');

            const response = await axios.put(
                `${process.env.API_URL}/activate/client/subscription`,
                {
                    clientId: id,
                    activationDate: formattedDate
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                toast.success('Subscription activated successfully');
                setShowUnfreezeDialog(false);
                getUserData(); // Refresh user data
            } else {
                toast.error(response.data.message || 'Failed to activate subscription');
            }
        } catch (error) {
            console.error('Unfreeze error:', error);
            toast.error(error.response?.data?.message || 'Failed to activate subscription');
        }
    };

    const unfreezeDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label={t('actions.cancel')} icon="pi pi-times" onClick={() => setShowUnfreezeDialog(false)} className="p-button-outlined flex-1" />
            <Button label={t('actions.activate')} icon="pi pi-check" onClick={submitUnfreeze} severity="success" autoFocus className="flex-1" />
        </div>
    );

    const handleRenew = () => {
        // Set initial values when opening the dialog
        const currentBundle = userData?.clientData?.subscripedBundle;

        setRenewType('same'); // Default to renewing same package
        setRenewForm({
            bundleId: currentBundle?.bundleId?._id || '',
            bundlePeriod: currentBundle?.bundlePeriod || '',
            hasCoupon: false,
            couponCode: '',
            requirePayment: false,
            startingAt: null
        });
        setShowRenewDialog(true);
    };

    const handleRenewSubmit = async () => {
        if (!renewForm.bundleId || !renewForm.bundlePeriod || !renewForm.startingAt) {
            toast.error(t('dialogs.renew.fillAllFields', 'Please fill all required fields'));
            return;
        }

        const token = localStorage.getItem('token');

        try {
            const formattedDate = renewForm.startingAt
                .toLocaleDateString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric'
                })
                .replace(/\//g, '-');

            const response = await axios.post(
                `${process.env.API_URL}/renew/subscription`,
                {
                    clientId: id,
                    bundleId: renewForm.bundleId,
                    bundlePeriod: renewForm.bundlePeriod,
                    hasCoupon: renewForm.hasCoupon,
                    couponCode: renewForm.couponCode,
                    requirePayment: renewForm.requirePayment,
                    startingAt: formattedDate
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                toast.success(t('dialogs.renew.success', 'Subscription renewed successfully'));
                setShowRenewDialog(false);
                getUserData(); // Refresh user data
            } else {
                toast.error(response.data.message || t('dialogs.renew.error', 'Failed to renew subscription'));
            }
        } catch (error) {
            console.error('Renew error:', error);
            toast.error(error.response?.data?.message || t('dialogs.renew.error', 'Failed to renew subscription'));
        }
    };

    const renewDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label={t('actions.cancel')} icon="pi pi-times" onClick={() => setShowRenewDialog(false)} className="p-button-outlined flex-1" />
            <Button label={t('actions.renewPackage')} icon="pi pi-check" onClick={handleRenewSubmit} autoFocus className="flex-1" />
        </div>
    );

    const handleUnsubscribe = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.patch(
                `${process.env.API_URL}/unsubscribe/client`,
                {
                    clientId: id
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                toast.success('Client unsubscribed successfully');
                getUserData(); // Refresh user data
            } else {
                toast.error(response.data.message || 'Failed to unsubscribe client');
            }
        } catch (error) {
            console.error('Unsubscribe error:', error);
            toast.error(error.response?.data?.message || 'Failed to unsubscribe client');
        }
    };

    const confirmUnsubscribe = () => {
        confirmDialog({
            message: t('dialogs.unsubscribe.message', 'Are you sure you want to unsubscribe this client?'),
            header: t('dialogs.unsubscribe.header', 'Unsubscribe Confirmation'),
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: handleUnsubscribe,
            reject: () => {
                toast.error(t('dialogs.unsubscribe.cancelled', 'Client unsubscription cancelled'));
            }
        });
    };

    const handleEditSubmit = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.put(
                `${process.env.API_URL}/edit/client/profile`,
                {
                    ...editFormData,
                    clientId: id
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                toast.success('Profile updated successfully');
                setShowEditSidebar(false);
                getUserData(); // Refresh user data
            } else {
                toast.error(response.data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Edit error:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const genderOptions = [
        { label: t('gender.male'), value: 'male' },
        { label: t('gender.female'), value: 'female' }
    ];

    const governorateOptions = [
        { label: t('governorates.jahra'), value: 'الجهراء' },
        { label: t('governorates.hawally'), value: 'حولي' },
        { label: t('governorates.capital'), value: 'العاصمة' },
        { label: t('governorates.farwaniya'), value: 'الفروانيه' },
        { label: t('governorates.mubarakAlKabeer'), value: 'مبارك الكبير' },
        { label: t('governorates.ahmadi'), value: 'الاحمدي' }
    ];

    const getPaymentHistory = async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.API_URL}/report`, {
            params: {
                reportName: 'clientHistory',
                clientId: id
            },
            headers: { Authorization: `Bearer ${token}` }
        });

        const timer = setTimeout(() => {
            window.open(response.data?.url, '_blank');
            clearTimeout(timer);
        }, 1000);
    };

    const handleModifyDays = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post(
                `${process.env.API_URL}/modify/subscription/days`,
                {
                    ...modifyDaysData,
                    clientId: id
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                toast.success(`Successfully ${modifyDaysData.action}ed ${modifyDaysData.numberOfDays} days`);
                setShowModifyDaysDialog(false);
                getUserData(); // Refresh user data
            } else {
                toast.error(response.data.message || 'Failed to modify subscription days');
            }
        } catch (error) {
            console.error('Modify days error:', error);
            toast.error(error.response?.data?.message || 'Failed to modify subscription days');
        }
    };

    const modifyDaysDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label={t('actions.cancel')} severity="danger" icon="pi pi-times" onClick={() => setShowModifyDaysDialog(false)} className="p-button-outlined flex-1" />
            <Button label={t('actions.apply')} icon="pi pi-check" onClick={handleModifyDays} severity={modifyDaysData.action === 'add' ? 'success' : 'danger'} autoFocus className="flex-1" />
        </div>
    );

    // Fetch bundles on component mount
    useEffect(() => {
        const fetchBundles = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`${process.env.API_URL}/get/bundles`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBundles(response.data?.bundles || []);
            } catch (error) {
                console.error('Error fetching bundles:', error);
                toast.error(error?.response?.data?.message || 'Failed to fetch bundles');
            }
        };
        fetchBundles();
    }, []);

    if (loading || !userData) {
        return (
            <div className="flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
            </div>
        );
    }

    const { clientData, bundleName, bundleNameEn, startDate, endDate, remainingDays } = userData;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: locale === 'ar' ? 'long' : 'short',
            day: 'numeric',
            calendar: locale === 'ar' ? 'gregory' : undefined,
            numberingSystem: locale === 'ar' ? 'arab' : undefined
        };

        return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', options);
    };

    return (
        <div className="py-2" dir={isRTL ? 'rtl' : 'ltr'}>
            <ConfirmDialog />

            {/* Freeze Dialog */}
            <Dialog header={t('dialogs.freeze.title')} visible={showFreezeDialog} style={{ width: '450px' }} dir={isRTL ? 'rtl' : 'ltr'} modal footer={freezeDialogFooter} onHide={() => setShowFreezeDialog(false)} className="p-fluid">
                <div className="flex flex-column gap-4 pt-4">
                    <div className="field">
                        <label htmlFor="freezeDate" className="font-medium mb-2 block">
                            {t('dialogs.freeze.startDate')}
                        </label>
                        <Calendar id="freezeDate" value={freezeDate} onChange={(e) => setFreezeDate(e.value)} showIcon className="w-full" minDate={new Date()} />
                    </div>
                    <div className="field">
                        <label htmlFor="freezePeriod" className="font-medium mb-2 block">
                            {t('dialogs.freeze.period')}
                        </label>
                        <InputNumber id="freezePeriod" value={freezePeriod} onValueChange={(e) => setFreezePeriod(e.value)} min={1} max={30} showButtons className="w-full" />
                    </div>
                    <div className="surface-100 border-round p-3">
                        <p className="text-600 text-sm m-0">{t('dialogs.freeze.remainingPauseDays', { count: userData?.clientData?.clientStatus?.pauseCounter || 0 })}</p>
                    </div>
                </div>
            </Dialog>

            {/* Unfreeze Dialog */}
            <Dialog header={t('dialogs.unfreeze.title')} visible={showUnfreezeDialog} style={{ width: '450px' }} dir={isRTL ? 'rtl' : 'ltr'} modal footer={unfreezeDialogFooter} onHide={() => setShowUnfreezeDialog(false)} className="p-fluid">
                <div className="flex flex-column gap-4 pt-4">
                    <div className="field">
                        <label htmlFor="unfreezeDate" className="font-medium mb-2 block">
                            {t('dialogs.unfreeze.activationDate')}
                        </label>
                        <Calendar id="unfreezeDate" value={unfreezeDate} onChange={(e) => setUnfreezeDate(e.value)} showIcon className="w-full" minDate={new Date()} />
                    </div>
                    <div className="surface-100 border-round p-3">
                        <p className="text-600 text-sm m-0">
                            {t('dialogs.unfreeze.currentStatus')}: <Tag severity="warning" value={t('status.paused')} className="ml-2" />
                        </p>
                    </div>
                </div>
            </Dialog>

            {/* Renew Dialog */}
            <Dialog header={t('dialogs.renew.title')} visible={showRenewDialog} style={{ width: '500px' }} modal footer={renewDialogFooter} onHide={() => setShowRenewDialog(false)} className="p-fluid" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex flex-column gap-4 pt-4">
                    <div className="field">
                        <div className="flex gap-3 mb-4">
                            <div className="field-radiobutton flex-1">
                                <RadioButton
                                    inputId="samePackage"
                                    name="renewType"
                                    value="same"
                                    onChange={(e) => {
                                        setRenewType(e.value);
                                        const currentBundle = userData?.clientData?.subscripedBundle;
                                        console.log(currentBundle);
                                        setRenewForm((prev) => ({
                                            ...prev,
                                            bundleId: currentBundle?.bundleId?._id || '',
                                            bundlePeriod: currentBundle?.bundlePeriod || ''
                                        }));
                                    }}
                                    checked={renewType === 'same'}
                                />
                                <label htmlFor="samePackage" className={`${isRTL ? 'mr-2' : 'ml-2'}`}>
                                    {t('dialogs.renew.samePackage')}
                                </label>
                            </div>
                            <div className="field-radiobutton flex-1">
                                <RadioButton
                                    inputId="newPackage"
                                    name="renewType"
                                    value="new"
                                    onChange={(e) => {
                                        setRenewType(e.value);
                                        setRenewForm((prev) => ({
                                            ...prev,
                                            bundleId: '',
                                            bundlePeriod: ''
                                        }));
                                    }}
                                    checked={renewType === 'new'}
                                />
                                <label htmlFor="newPackage" className={`${isRTL ? 'mr-2' : 'ml-2'}`}>
                                    {t('dialogs.renew.newPackage')}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="startingAt" className="font-medium mb-2 block">
                            {t('dialogs.renew.startDate')}
                        </label>
                        <Calendar id="startingAt" placeholder={t('dialogs.renew.selectStartDate')} value={renewForm.startingAt} onChange={(e) => setRenewForm({ ...renewForm, startingAt: e.value })} showIcon className="w-full" minDate={new Date()} />
                    </div>

                    <div className="field">
                        <label htmlFor="bundleId" className="font-medium mb-2 block">
                            {t('dialogs.renew.bundle')}
                        </label>
                        <Dropdown
                            id="bundleId"
                            value={renewForm.bundleId}
                            options={bundles.map((bundle) => ({
                                label: isRTL ? bundle.bundleName : bundle.bundleNameEn,
                                value: bundle._id
                            }))}
                            placeholder={t('dialogs.renew.selectBundle')}
                            onChange={(e) => setRenewForm({ ...renewForm, bundleId: e.value, bundlePeriod: '' })}
                            disabled={renewType === 'same'}
                            className="w-full"
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="bundlePeriod" className="font-medium mb-2 block">
                            {t('dialogs.renew.period')}
                        </label>
                        <Dropdown
                            id="bundlePeriod"
                            value={renewForm.bundlePeriod}
                            options={
                                renewForm?.bundleId
                                    ? bundles
                                          ?.find((bundle) => bundle?._id === renewForm?.bundleId)
                                          ?.periodPrices.map((pp) => ({
                                              label: `${pp.period} - ${pp.price} KWD`,
                                              value: pp.period
                                          }))
                                    : []
                            }
                            onChange={(e) => setRenewForm({ ...renewForm, bundlePeriod: e.value })}
                            placeholder={t('dialogs.renew.selectPeriod')}
                            className="w-full"
                        />
                    </div>

                    <div className="field-checkbox">
                        <Checkbox inputId="requirePayment" checked={renewForm.requirePayment} onChange={(e) => setRenewForm({ ...renewForm, requirePayment: e.checked })} />
                        <label htmlFor="requirePayment" className={`${isRTL ? 'mr-2' : 'ml-2'} font-medium`}>
                            {t('dialogs.renew.requirePayment')}
                        </label>
                    </div>

                    <div className="field-checkbox">
                        <Checkbox inputId="hasCoupon" checked={renewForm.hasCoupon} onChange={(e) => setRenewForm({ ...renewForm, hasCoupon: e.checked })} />
                        <label htmlFor="hasCoupon" className={`${isRTL ? 'mr-2' : 'ml-2'} font-medium`}>
                            {t('dialogs.renew.hasCoupon')}
                        </label>
                    </div>

                    {renewForm.hasCoupon && (
                        <div className="field">
                            <label htmlFor="couponCode" className="font-medium mb-2 block">
                                {t('dialogs.renew.couponCode')}
                            </label>
                            <InputText id="couponCode" value={renewForm.couponCode} onChange={(e) => setRenewForm({ ...renewForm, couponCode: e.target.value })} className="w-full" />
                        </div>
                    )}
                </div>
            </Dialog>

            {/* Modify Days Dialog */}
            <Dialog header={t('dialogs.modifyDays.title')} dir={isRTL ? 'rtl' : 'ltr'} visible={showModifyDaysDialog} style={{ width: '450px' }} modal footer={modifyDaysDialogFooter} onHide={() => setShowModifyDaysDialog(false)} className="p-fluid">
                <div className="flex flex-column gap-4 pt-4">
                    <div className="field">
                        <label className="font-medium mb-2 block">{t('dialogs.modifyDays.action')}</label>
                        <div className="flex gap-2">
                            <Button
                                label={t('dialogs.modifyDays.addDays')}
                                icon="pi pi-plus"
                                onClick={() => setModifyDaysData((prev) => ({ ...prev, action: 'add' }))}
                                severity="success"
                                outlined={modifyDaysData.action !== 'add'}
                                className="flex-1 p-button-outlined"
                            />
                            <Button
                                label={t('dialogs.modifyDays.removeDays')}
                                icon="pi pi-minus"
                                onClick={() => setModifyDaysData((prev) => ({ ...prev, action: 'remove' }))}
                                severity="warning"
                                outlined={modifyDaysData.action !== 'remove'}
                                className="flex-1 p-button-outlined"
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label htmlFor="numberOfDays" className="font-medium mb-2 block">
                            {t('dialogs.modifyDays.numberOfDays')}
                        </label>
                        <InputNumber id="numberOfDays" value={modifyDaysData.numberOfDays} onChange={(e) => setModifyDaysData((prev) => ({ ...prev, numberOfDays: e.value }))} min={1} showButtons className="w-full" />
                    </div>
                    <div className="surface-100 border-round p-3">
                        <p className="text-600 text-sm m-0">
                            {t('dialogs.modifyDays.currentDays')}: {remainingDays}
                        </p>
                        <p className="text-600 text-sm m-0 mt-2">
                            {t('dialogs.modifyDays.afterChange')}: {modifyDaysData.action === 'add' ? remainingDays + (modifyDaysData.numberOfDays || 0) : remainingDays - (modifyDaysData.numberOfDays || 0)}
                        </p>
                    </div>
                </div>
            </Dialog>

            {/* Edit Profile Sidebar */}
            <Sidebar visible={showEditSidebar} dir={isRTL ? 'rtl' : 'ltr'} position={isRTL ? 'right' : 'left'} onHide={() => setShowEditSidebar(false)} className="w-full md:w-30rem" header={t('dialogs.edit.title')}>
                <div className="flex flex-column gap-4 p-4">
                    <div className="field">
                        <label htmlFor="clientName" className="font-medium mb-2 block">
                            {t('dialogs.edit.clientName')}
                        </label>
                        <InputText id="clientName" value={editFormData.clientName} onChange={(e) => setEditFormData({ ...editFormData, clientName: e.target.value })} className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="phoneNumber" className="font-medium mb-2 block">
                            {t('dialogs.edit.phoneNumber')}
                        </label>
                        <InputText id="phoneNumber" value={editFormData.phoneNumber} onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })} className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="gender" className="font-medium mb-2 block">
                            {t('dialogs.edit.gender')}
                        </label>
                        <Dropdown id="gender" value={editFormData.gender} options={genderOptions} onChange={(e) => setEditFormData({ ...editFormData, gender: e.value })} className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="governorate" className="font-medium mb-2 block">
                            {t('dialogs.edit.governorate')}
                        </label>
                        <Dropdown id="governorate" value={editFormData.governorate} options={governorateOptions} onChange={(e) => setEditFormData({ ...editFormData, governorate: e.value })} className="w-full" />
                    </div>

                    <div className="grid">
                        <div className="col-6">
                            <div className="field">
                                <label htmlFor="region" className="font-medium mb-2 block">
                                    {t('dialogs.edit.region')}
                                </label>
                                <InputText id="region" value={editFormData.region} onChange={(e) => setEditFormData({ ...editFormData, region: e.target.value })} className="w-full" />
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="field">
                                <label htmlFor="block" className="font-medium mb-2 block">
                                    {t('dialogs.edit.block')}
                                </label>
                                <InputText id="block" value={editFormData.block} onChange={(e) => setEditFormData({ ...editFormData, block: e.target.value })} className="w-full" />
                            </div>
                        </div>
                    </div>

                    <div className="grid">
                        <div className="col-6">
                            <div className="field">
                                <label htmlFor="street" className="font-medium mb-2 block">
                                    {t('dialogs.edit.street')}
                                </label>
                                <InputText id="street" value={editFormData.street} onChange={(e) => setEditFormData({ ...editFormData, street: e.target.value })} className="w-full" />
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="field">
                                <label htmlFor="alley" className="font-medium mb-2 block">
                                    {t('dialogs.edit.alley')}
                                </label>
                                <InputText id="alley" value={editFormData.alley} onChange={(e) => setEditFormData({ ...editFormData, alley: e.target.value })} className="w-full" />
                            </div>
                        </div>
                    </div>

                    <div className="grid">
                        <div className="col-4">
                            <div className="field">
                                <label htmlFor="building" className="font-medium mb-2 block">
                                    {t('dialogs.edit.building')}
                                </label>
                                <InputText id="building" value={editFormData.building} onChange={(e) => setEditFormData({ ...editFormData, building: e.target.value })} className="w-full" />
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="field">
                                <label htmlFor="floor" className="font-medium mb-2 block">
                                    {t('dialogs.edit.floor')}
                                </label>
                                <InputText id="floor" value={editFormData.floor} onChange={(e) => setEditFormData({ ...editFormData, floor: e.target.value })} className="w-full" />
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="field">
                                <label htmlFor="appartment" className="font-medium mb-2 block">
                                    {t('dialogs.edit.apartment')}
                                </label>
                                <InputText id="appartment" value={editFormData.appartment} onChange={(e) => setEditFormData({ ...editFormData, appartment: e.target.value })} className="w-full" />
                            </div>
                        </div>
                    </div>

                    <div className="grid formgrid p-fluid">
                        <div className="col-6">
                            <div className="field">
                                <label htmlFor="protine" className="font-medium mb-2 block">
                                    {t('dialogs.edit.protein')}
                                </label>
                                <InputNumber id="protine" value={editFormData.protine} onValueChange={(e) => setEditFormData({ ...editFormData, protine: e.value })} className="w-full" min={0} />
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="field">
                                <label htmlFor="carb" className="font-medium mb-2 block">
                                    {t('dialogs.edit.carbs')}
                                </label>
                                <InputNumber id="carb" value={editFormData.carb} onValueChange={(e) => setEditFormData({ ...editFormData, carb: e.value })} className="w-full" min={0} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2">
                        <Button label={t('actions.cancel')} icon="pi pi-times" severity="danger" onClick={() => setShowEditSidebar(false)} className="p-button-outlined flex-1" />
                        <Button label={t('actions.save')} icon="pi pi-check" onClick={handleEditSubmit} severity="success" className="flex-1" />
                    </div>
                </div>
            </Sidebar>

            {/* Action Buttons */}
            <div className="mb-4">
                <div className="card border-round-xl">
                    <div className="flex flex-wrap gap-3 justify-content-between align-items-center">
                        <div className="flex gap-2">
                            <Button icon="pi pi-trash" severity="danger" onClick={confirmDelete} tooltip={t('actions.delete')} className="p-button-rounded p-button-outlined" />
                            {clientData.clientStatus.paused ? (
                                <Button icon="pi pi-play" severity="success" onClick={handleUnfreeze} tooltip={t('actions.activate')} className="p-button-rounded p-button-outlined" />
                            ) : (
                                <Button icon="pi pi-pause" severity="warning" onClick={handleFreeze} tooltip={t('actions.freeze')} disabled={clientData.clientStatus.pauseCounter <= 0} className="p-button-rounded p-button-outlined" />
                            )}
                            <Button icon="pi pi-ban" severity="danger" onClick={confirmUnsubscribe} tooltip={t('actions.unsubscribe')} className="p-button-rounded p-button-outlined" disabled={!clientData.subscriped} />
                            <Button icon="pi pi-pencil" severity="info" onClick={() => setShowEditSidebar(true)} tooltip={t('actions.edit')} className="p-button-rounded p-button-outlined" />
                            <Button icon="pi pi-wallet" severity="info" onClick={() => router.push(`/${locale}/users/wallet/${id}`)} tooltip={t('actions.wallet')} className="p-button-rounded p-button-outlined" />
                            <Button icon="pi pi-calendar-plus" severity="help" onClick={() => setShowModifyDaysDialog(true)} tooltip={t('actions.modifyDays')} className="p-button-rounded p-button-outlined" disabled={!clientData.subscriped} />
                            {/* GET THE PAYMENT HISTORY */}
                            <Button icon="pi pi-history" severity="info" onClick={getPaymentHistory} tooltip={t('actions.paymentHistory')} className="p-button-rounded p-button-outlined" />
                        </div>
                        <div className="flex gap-2">
                            <Button label={t('actions.renewPackage')} icon="pi pi-refresh" onClick={handleRenew} className="p-button-outlined" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                {/* Client Info div */}
                <div className="card mb-0 flex-1">
                    <div className="h-full">
                        <div className="flex align-items-center text-center mb-4 gap-3">
                            <div className="bg-primary p-4 mb-3" style={{ borderRadius: '6px' }}>
                                <i className="pi pi-user text-4xl text-white"></i>
                            </div>
                            <div className="flex flex-column align-items-start">
                                <h2 className="text-2xl font-semibold m-0">{clientData.clientName}</h2>
                                <p className="text-600 mb-1">{clientData.email}</p>
                                <Tag severity={clientData.clientStatus.paused ? 'warning' : 'success'} value={clientData.clientStatus.paused ? t('status.paused') : t('status.active')} size="small" />
                            </div>
                        </div>
                        <Divider className="my-4" />
                        <div className="flex flex-wrap">
                            <div className="w-6 mb-3">
                                <p className="text-600 mb-1 text-sm">{t('dialogs.edit.phoneNumber')}</p>
                                <p className="text-900 font-medium">{clientData.phoneNumber}</p>
                            </div>
                            <div className="w-6 mb-3">
                                <p className="text-600 mb-1 text-sm">{t('dialogs.edit.gender')}</p>
                                <p className="text-900 font-medium capitalize">{clientData.gender}</p>
                            </div>
                            <div className="w-6 mb-3">
                                <p className="text-600 mb-1 text-sm">{t('dialogs.edit.governorate')}</p>
                                <p className="text-900 font-medium">{clientData.governorate}</p>
                            </div>
                            <div className="w-6 mb-3">
                                <p className="text-600 mb-1 text-sm">{t('dialogs.edit.region')}</p>
                                <p className="text-900 font-medium">{clientData.region}</p>
                            </div>
                            <div className="w-6 mb-3">
                                <p className="text-600 mb-1 text-sm">{t('dialogs.edit.block')}</p>
                                <p className="text-900 font-medium">{clientData.block}</p>
                            </div>
                            <div className="w-6 mb-3">
                                <p className="text-600 mb-1 text-sm">{t('dialogs.edit.street')}</p>
                                <p className="text-900 font-medium">{clientData.street}</p>
                            </div>
                            <div className="w-6 mb-3">
                                <p className="text-600 mb-1 text-sm">{t('dialogs.edit.building')}</p>
                                <p className="text-900 font-medium">{clientData.building}</p>
                            </div>
                            <div className="w-6 mb-3">
                                <p className="text-600 mb-1 text-sm">{t('dialogs.edit.floor')}</p>
                                <p className="text-900 font-medium">{clientData.floor}</p>
                            </div>
                            <div className="w-6 mb-3">
                                <p className="text-600 mb-1 text-sm">{t('dialogs.edit.apartment')}</p>
                                <p className="text-900 font-medium">{clientData.appartment}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscription Info div */}
                <div className="card mb-0 flex-1">
                    <div className="h-full">
                        <div className="flex align-items-center mb-4">
                            <i className={`pi pi-calendar text-xl text-primary`}></i>
                            <h3 className={`text-xl font-semibold m-0 ${isRTL ? 'text-right mr-2' : 'text-left ml-2'}`}>{t('info.subscriptionDetails')}</h3>
                        </div>
                        <div className="mb-4 p-3 surface-50 border-round">
                            <p className="text-600 mb-2 text-sm">{t('info.bundleName')}</p>
                            <p className="text-900 font-medium text-xl">{locale === 'ar' ? userData?.clientData?.subscripedBundle?.bundleId?.bundleName : userData?.clientData?.subscripedBundle?.bundleId?.bundleNameEn}</p>
                        </div>
                        <div className="mb-4">
                            <p className="text-600 mb-2 text-sm">{t('info.duration')}</p>
                            <div className="flex gap-2 align-items-center">
                                <i className={`pi pi-calendar-range text-primary`}></i>
                                <p className={`text-900 m-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {formatDate(userData?.clientData?.subscripedBundle?.startingDate)} - {formatDate(userData?.clientData?.subscripedBundle?.endingDate)}
                                </p>
                            </div>
                        </div>
                        <div className="mb-4 p-3 surface-50 border-round">
                            <p className="text-600 mb-2 text-sm">{t('info.remainingDays')}</p>
                            <div className="flex align-items-center">
                                <i className={`pi pi-clock text-primary`}></i>
                                <p className={`text-900 font-bold text-2xl text-primary m-0 ${isRTL ? 'text-right mr-2' : 'text-left ml-2'}`}>
                                    {remainingDays} {t('info.days')}
                                </p>
                            </div>
                        </div>
                        <Divider className="my-4" />
                        <div>
                            <p className="text-600 mb-3 font-medium text-sm">{t('info.subscriptionStatus')}</p>
                            <div className="flex flex-column gap-3">
                                <div className="flex justify-content-between align-items-center p-2 surface-50 border-round">
                                    <span className="text-700">{t('info.pauseCount')}</span>
                                    <Tag severity="info" value={clientData.clientStatus.numPause} rounded />
                                </div>
                                <div className="flex justify-content-between align-items-center p-2 surface-50 border-round">
                                    <span className="text-700">{t('info.activeCount')}</span>
                                    <Tag severity="success" value={clientData.clientStatus.numActive} rounded />
                                </div>
                                <div className="flex justify-content-between align-items-center p-2 surface-50 border-round">
                                    <span className="text-700">{t('info.remainingPauses')}</span>
                                    <Tag severity="warning" value={clientData.clientStatus.pauseCounter} rounded />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nutrition Info div */}
                <div className="card w-full">
                    <div className="h-full">
                        <div className="flex align-items-center mb-4">
                            <i className={`pi pi-chart-bar text-xl text-primary`}></i>
                            <h3 className={`text-xl font-semibold m-0 ${isRTL ? 'text-right mr-2' : 'text-left ml-2'}`}>{t('info.nutritionPlan')}</h3>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-center flex-1 p-4 border-round shadow-1">
                                <div className="bg-primary inline-flex align-items-center justify-content-center border-circle mb-3" style={{ width: '3.5rem', height: '3.5rem' }}>
                                    <i className="pi pi-heart-fill text-2xl text-white"></i>
                                </div>
                                <p className="text-600 mb-2 font-medium text-sm">{t('info.protein')}</p>
                                <div className="text-primary text-5xl font-bold mb-2">{clientData.protine}</div>
                                <span className="text-600 text-sm">{t('info.grams')}</span>
                            </div>
                            <div className="text-center flex-1 p-4 border-round shadow-1">
                                <div className="bg-primary inline-flex align-items-center justify-content-center border-circle mb-3" style={{ width: '3.5rem', height: '3.5rem' }}>
                                    <i className="pi pi-bolt text-2xl text-white"></i>
                                </div>
                                <p className="text-600 mb-2 font-medium text-sm">{t('info.carbs')}</p>
                                <div className="text-primary text-5xl font-bold mb-2">{clientData.carb}</div>
                                <span className="text-600 text-sm">{t('info.grams')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
