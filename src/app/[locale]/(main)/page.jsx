'use client';
import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Toast } from 'primereact/toast';
import axios from 'axios';

// Custom Components
import StatCard from './components/dashboard/StatCard';
import ClientsOverview from './components/dashboard/ClientsOverview';
import CategoriesOverview from './components/dashboard/CategoriesOverview';
import BestSellingOverview from './components/dashboard/BestSellingOverview';
import ClientsMonitorOverview from './components/dashboard/ClientsMonitorOverview';

const initialState = {
    categories: [],
    topSelling: [],
    clients: {
        all: 0,
        active: 0,
        inActive: 0
    },
    clientsMonitor: {
        newClients: [],
        renewedClients: [],
        endingClients: []
    }
};

const Dashboard = ({ params: { locale } }) => {
    const [loading, setLoading] = useState(true);
    const [monitorLoading, setMonitorLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(initialState);

    const toast = useRef(null);
    const t = useTranslations('DashboardHome');

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error(locale === 'ar' ? 'لم يتم العثور على رمز المصادقة' : 'Authentication token not found');
            }

            const response = await axios.get(`${process.env.API_URL}/get/stats`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const { data } = response.data;

            setDashboardData((prevState) => ({
                ...prevState,
                categories: [
                    {
                        name: 'Packages',
                        number: data?.bundlesNumber || 0
                    },
                    {
                        name: 'Meals',
                        number: data?.mealsNumber || 0
                    }
                ],
                topSelling: data?.bestSeller || [],
                clients: {
                    all: data?.clientsStats?.all || 0,
                    active: data?.clientsStats?.active || 0,
                    inActive: data?.clientsStats?.inactive || 0
                }
            }));
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            setError(errorMessage);
            toast.current.show({
                severity: 'error',
                summary: locale === 'ar' ? 'خطأ' : 'Error',
                detail: errorMessage,
                life: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchClientsMonitorData = async () => {
        try {
            setMonitorLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error(locale === 'ar' ? 'لم يتم العثور على رمز المصادقة' : 'Authentication token not found');
            }

            const response = await axios.get(`${process.env.API_URL}/monitor/clients`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const { newClients, renewedClients, endingClients } = response.data;

            setDashboardData((prevState) => ({
                ...prevState,
                clientsMonitor: {
                    newClients: newClients || [],
                    renewedClients: renewedClients || [],
                    endingClients: endingClients || []
                }
            }));
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            toast.current.show({
                severity: 'error',
                summary: locale === 'ar' ? 'خطأ' : 'Error',
                detail: errorMessage,
                life: 5000
            });
        } finally {
            setMonitorLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        fetchClientsMonitorData();
    }, []);

    return (
        <>
            <Toast ref={toast} position="top-right" />

            <div className="grid p-3">
                {/* Stats Overview Section */}
                <div className="col-12">
                    <div className="grid">
                        <div className="col-12 md:col-6 lg:col-3">
                            <StatCard icon={{ name: 'pi-users', color: 'primary' }} title={locale === 'ar' ? 'إجمالي العملاء' : 'Total Clients'} value={dashboardData.clients.all} loading={loading} />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <StatCard
                                icon={{ name: 'pi-user-plus', color: 'success' }}
                                title={locale === 'ar' ? 'العملاء النشطون' : 'Active Clients'}
                                value={dashboardData.clients.active}
                                trend="up"
                                trendValue={`${Math.round((dashboardData.clients.active / dashboardData.clients.all || 0) * 100)}%`}
                                loading={loading}
                            />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <StatCard icon={{ name: 'pi-box', color: 'warning' }} title={locale === 'ar' ? 'الباقات' : 'Packages'} value={dashboardData.categories[0]?.number || 0} loading={loading} />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <StatCard icon={{ name: 'pi-shopping-bag', color: 'help' }} title={locale === 'ar' ? 'الوجبات' : 'Meals'} value={dashboardData.categories[1]?.number || 0} loading={loading} />
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="col-12 xl:col-6">
                    <ClientsOverview data={dashboardData.clients} loading={loading} locale={locale} />
                </div>
                <div className="col-12 xl:col-6">
                    <CategoriesOverview categories={dashboardData.categories} loading={loading} locale={locale} />
                </div>

                {/* Clients Monitor Section */}
                <div className="col-12">
                    <ClientsMonitorOverview data={dashboardData.clientsMonitor} loading={monitorLoading} locale={locale} />
                </div>

                {/* Best Selling Section */}
                <div className="col-12">
                    <BestSellingOverview packages={dashboardData.topSelling} loading={loading} locale={locale} />
                </div>
            </div>
        </>
    );
};

export default Dashboard;
