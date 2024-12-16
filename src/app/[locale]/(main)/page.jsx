'use client';
// IMPORTS
import ClientsChart from './components/clientsChart';
import CategoriesNumber from './components/categoriesNumber';
import BestSelling from './components/bestSelling';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const Dashboard = ({ params: { locale } }) => {
    //STATES
    const [categoriesNumber, setCategoriesNumber] = useState([]);
    const [topSelling, setTopSelling] = useState([]);
    const [clients, setClients] = useState({
        all: 0,
        active: 0,
        inActive: 0
    });

    const t = useTranslations('DashboardHome');

    function getState() {
        // GET THE TOKEN FROM THE LOCAL STORAGE
        const token = localStorage.getItem('token');

        axios
            .get(`${process.env.API_URL}/get/stats`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((res) => {
                setCategoriesNumber([
                    {
                        name: 'Packages',
                        number: res.data.data.bundlesNumber
                    },
                    {
                        name: 'Meals',
                        number: res.data.data.mealsNumber
                    }
                    //     {
                    //     name: "Doctors", number: res.data.data.specialistsNumber,
                    // }
                ]);
                setTopSelling(res.data.data.bestSeller);
                setClients({
                    all: res.data.data.clientsStats.all,
                    active: res.data.data.clientsStats.active,
                    inActive: res.data.data.clientsStats.inactive
                });
            })
            .then((err) => {
                console.log(err);
            });
    }

    useEffect(() => {
        getState();
    }, []);

    return (
        <div className="grid gap-1">
            <div className="card mt-2 col-12 md:col-6 lg:col-6 mb-0">
                <div className="card-header">
                    <h3 className="card-title text-center uppercase">{t('clientsChart')}</h3>
                </div>
                <div className="card-body flex justify-content-center">
                    <ClientsChart clients={clients} locale={locale} />
                </div>
            </div>
            <div className="card mt-2 col mb-0">
                <div className="card-header">
                    <h3 className="card-title text-center uppercase">{t('categoriesNumber')}</h3>
                </div>
                <div className="card-body">
                    <CategoriesNumber categories={categoriesNumber} locale={locale} />
                </div>
            </div>
            <div className="card mt-2 col-12">
                <div className="card-header">
                    <h3 className="card-title text-center uppercase">{t('bestSellingPackages')}</h3>
                </div>
                <div className="card-body">
                    <BestSelling packages={topSelling} locale={locale} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
