'use client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// Import Components
import ActionButtons from './sections/ActionButtons';
import ChangeMealsDialog from './dialogs/ChangeMealsDialog';
import ClientInfo from './sections/ClientInfo';
import SubscriptionInfo from './sections/SubscriptionInfo';
import NutritionInfo from './sections/NutritionInfo';
import FreezeDialog from './dialogs/FreezeDialog';
import UnfreezeDialog from './dialogs/UnfreezeDialog';
import RenewDialog from './dialogs/RenewDialog';
import ModifyDaysDialog from './dialogs/ModifyDaysDialog';
import EditSidebar from './sidebars/EditSidebar';

export default function UserProfile({ id, locale }) {
    const router = useRouter();
    const t = useTranslations('userProfile');
    const isRTL = locale === 'ar';

    // State
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRenewDialog, setShowRenewDialog] = useState(false);
    const [showFreezeDialog, setShowFreezeDialog] = useState(false);
    const [showUnfreezeDialog, setShowUnfreezeDialog] = useState(false);
    const [showChangeMealsDialog, setShowChangeMealsDialog] = useState(false);
    const [mealsData, setMealsData] = useState({
        mealsNumber: '',
        snacksNumber: '',
        allowedBreakfast: '',
        allowedLunch: '',
        allowedDinner: ''
    });
    const [renewalDate, setRenewalDate] = useState(null);
    const [freezeDate, setFreezeDate] = useState(null);
    const [unfreezeDate, setUnfreezeDate] = useState(null);
    const [freezePeriod, setFreezePeriod] = useState(1);
    const [showEditSidebar, setShowEditSidebar] = useState(false);
    const [showModifyDaysDialog, setShowModifyDaysDialog] = useState(false);
    const [bundles, setBundles] = useState([]);
    const [renewType, setRenewType] = useState('same');

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

    const [modifyDaysData, setModifyDaysData] = useState({
        numberOfDays: 1,
        action: 'add'
    });

    const [renewForm, setRenewForm] = useState({
        bundleId: '',
        bundlePeriod: '',
        hasCoupon: false,
        couponCode: '',
        requirePayment: false,
        startingAt: null
    });

    // Options
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

    // Fetch Data
    const getUserData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const response = await axios.get(`${process.env.API_URL}/client/details?clientId=${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserData(response.data);
            // MEALS DATA
            const mealsNumber = response.data?.clientData?.subscripedBundle?.mealsNumber || 0;
            const snacksNumber = response.data?.clientData?.subscripedBundle?.snacksNumber || 0;
            const allowedBreakfast = response.data?.clientData?.subscripedBundle?.bundleId?.allowedBreakfast || 0;
            const allowedLunch = response.data?.clientData?.subscripedBundle?.bundleId?.allowedLunch || 0;
            const allowedDinner = response.data?.clientData?.subscripedBundle?.bundleId?.allowedDinner || 0;

            setMealsData({
                mealsNumber,
                snacksNumber,
                allowedBreakfast,
                allowedLunch,
                allowedDinner
            });
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

    // Handlers
    const handleDelete = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${process.env.API_URL}/admin/remove/client`, {
                params: { clientId: id },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success('User deleted successfully');
                window.history.back();
            } else {
                toast.error(response.data.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const confirmDelete = () => {
        confirmDialog({
            message: t('dialogs.delete.message'),
            header: t('dialogs.delete.header'),
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: handleDelete,
            reject: () => {
                toast.error(t('dialogs.delete.cancelled'));
            }
        });
    };

    const handleFreeze = async () => {
        if (!freezeDate || !freezePeriod) {
            toast.error('Please select both date and period');
            return;
        }

        const token = localStorage.getItem('token');
        try {
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
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                toast.success('Subscription frozen successfully');
                setShowFreezeDialog(false);
                getUserData();
            } else {
                toast.error(response.data.message || 'Failed to freeze subscription');
            }
        } catch (error) {
            console.error('Freeze error:', error);
            toast.error(error.response?.data?.message || 'Failed to freeze subscription');
        }
    };

    const handleUnfreeze = async () => {
        if (!unfreezeDate) {
            toast.error('Please select activation date');
            return;
        }

        const token = localStorage.getItem('token');
        try {
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
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                toast.success('Subscription activated successfully');
                setShowUnfreezeDialog(false);
                getUserData();
            } else {
                toast.error(response.data.message || 'Failed to activate subscription');
            }
        } catch (error) {
            console.error('Unfreeze error:', error);
            toast.error(error.response?.data?.message || 'Failed to activate subscription');
        }
    };

    const handleUnsubscribe = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.patch(`${process.env.API_URL}/unsubscribe/client`, { clientId: id }, { headers: { Authorization: `Bearer ${token}` } });

            if (response.data.success) {
                toast.success('Client unsubscribed successfully');
                getUserData();
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
            message: t('dialogs.unsubscribe.message'),
            header: t('dialogs.unsubscribe.header'),
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: handleUnsubscribe,
            reject: () => {
                toast.error(t('dialogs.unsubscribe.cancelled'));
            }
        });
    };

    const handleRenew = () => {
        const currentBundle = userData?.clientData?.subscripedBundle;
        setRenewType('same');
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
            toast.error(t('dialogs.renew.fillAllFields'));
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
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                toast.success(t('dialogs.renew.success'));
                setShowRenewDialog(false);
                getUserData();
            } else {
                toast.error(response.data.message || t('dialogs.renew.error'));
            }
        } catch (error) {
            console.error('Renew error:', error);
            toast.error(error.response?.data?.message || t('dialogs.renew.error'));
        }
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
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                toast.success('Profile updated successfully');
                setShowEditSidebar(false);
                getUserData();
            } else {
                toast.error(response.data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Edit error:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
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
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                toast.success(`Successfully ${modifyDaysData.action}ed ${modifyDaysData.numberOfDays} days`);
                setShowModifyDaysDialog(false);
                getUserData();
            } else {
                toast.error(response.data.message || 'Failed to modify subscription days');
            }
        } catch (error) {
            console.error('Modify days error:', error);
            toast.error(error.response?.data?.message || 'Failed to modify subscription days');
        }
    };

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

    const handleChangeMeals = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(
                `${process.env.API_URL}/change/client/meals/numbers`,
                {
                    ...mealsData,
                    clientId: id
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                toast.success('Meals and snacks numbers updated successfully');
                setShowChangeMealsDialog(false);
                getUserData(); // Refresh user data
            } else {
                toast.error(response.data.message || 'Failed to update meals numbers');
            }
        } catch (error) {
            console.error('Change meals error:', error);
            toast.error(error.response?.data?.message || 'Failed to update meals numbers');
        }
    };

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

    if (loading || !userData) {
        return (
            <div className="flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
            </div>
        );
    }

    const { clientData, remainingDays } = userData;

    return (
        <div className="py-2" dir={isRTL ? 'rtl' : 'ltr'}>
            <ConfirmDialog />

            <FreezeDialog
                visible={showFreezeDialog}
                onHide={() => setShowFreezeDialog(false)}
                onSubmit={handleFreeze}
                freezeDate={freezeDate}
                setFreezeDate={setFreezeDate}
                freezePeriod={freezePeriod}
                setFreezePeriod={setFreezePeriod}
                pauseCounter={userData?.clientData?.clientStatus?.pauseCounter}
                isRTL={isRTL}
            />

            <UnfreezeDialog visible={showUnfreezeDialog} onHide={() => setShowUnfreezeDialog(false)} onSubmit={handleUnfreeze} unfreezeDate={unfreezeDate} setUnfreezeDate={setUnfreezeDate} isRTL={isRTL} />

            <RenewDialog
                visible={showRenewDialog}
                onHide={() => setShowRenewDialog(false)}
                onSubmit={handleRenewSubmit}
                renewForm={renewForm}
                setRenewForm={setRenewForm}
                renewType={renewType}
                setRenewType={setRenewType}
                bundles={bundles}
                currentBundle={userData?.clientData?.subscripedBundle}
                isRTL={isRTL}
            />

            <ModifyDaysDialog
                visible={showModifyDaysDialog}
                onHide={() => setShowModifyDaysDialog(false)}
                onSubmit={handleModifyDays}
                modifyDaysData={modifyDaysData}
                setModifyDaysData={setModifyDaysData}
                remainingDays={remainingDays}
                isRTL={isRTL}
            />

            <EditSidebar
                visible={showEditSidebar}
                onHide={() => setShowEditSidebar(false)}
                onSubmit={handleEditSubmit}
                editFormData={editFormData}
                setEditFormData={setEditFormData}
                genderOptions={genderOptions}
                governorateOptions={governorateOptions}
                isRTL={isRTL}
            />

            <ChangeMealsDialog visible={showChangeMealsDialog} onHide={() => setShowChangeMealsDialog(false)} onSubmit={handleChangeMeals} mealsData={mealsData} setMealsData={setMealsData} isRTL={isRTL} />

            <ActionButtons
                onDelete={confirmDelete}
                onFreeze={() => setShowFreezeDialog(true)}
                onUnfreeze={() => setShowUnfreezeDialog(true)}
                onUnsubscribe={confirmUnsubscribe}
                onEdit={() => setShowEditSidebar(true)}
                onWallet={() => router.push(`/${locale}/users/wallet/${id}`)}
                onModifyDays={() => setShowModifyDaysDialog(true)}
                onPaymentHistory={getPaymentHistory}
                onRenew={handleRenew}
                onChangeMeals={() => setShowChangeMealsDialog(true)}
                onEditDayMeals={() => router.push(`/${locale}/users/edit-day-meals/${id}`)}
                clientData={clientData}
                id={id}
                locale={locale}
            />

            <div className="flex flex-wrap gap-3">
                <ClientInfo clientData={clientData} isRTL={isRTL} />

                <SubscriptionInfo userData={userData} remainingDays={remainingDays} formatDate={formatDate} isRTL={isRTL} locale={locale} />

                <NutritionInfo clientData={clientData} isRTL={isRTL} />
            </div>
        </div>
    );
}
