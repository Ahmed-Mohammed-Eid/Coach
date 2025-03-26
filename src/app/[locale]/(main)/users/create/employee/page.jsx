'use client';
import React, { useState } from 'react';
import CustomFileUpload from '../../../../../../components/customFileUpload';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { Dropdown } from 'primereact/dropdown';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useTranslations } from 'next-intl';

export default function CreateEmployee({ params: { locale } }) {
    const t = useTranslations('createEmployee');
    const isRTL = locale === 'ar';

    // LOADING STATE
    const [loading, setLoading] = useState(false);

    // STATE
    const [employeeImage, setEmployeeImage] = useState([]);
    const [form, setForm] = useState({
        employeeName: '',
        employeeRole: '',
        employeeAddress: '',
        employeeMobile: '',
        employeeUsername: '',
        employeePassword: ''
    });

    // HANDLERS
    function createEmployee(event) {
        // PREVENT THE DEFAULT BEHAVIOUR
        event.preventDefault();

        // GET THE TOKEN FROM THE LOCAL STORAGE
        const token = localStorage.getItem('token');

        // VALIDATE THE FORM
        if (!form.employeeName || !form.employeeRole || !form.employeeAddress || !form.employeeMobile || !form.employeeUsername || !form.employeePassword) {
            toast.error(t('fillAllFieldsError'));
            return;
        }

        // SET THE LOADING TO TRUE
        setLoading(true);

        // CREATE THE FORM DATA
        const formData = new FormData();

        // Set the loading state for the spinner
        setLoading(true);

        // APPEND THE IMAGES
        formData.append('files', employeeImage[0]);
        formData.append('fullName', form.employeeName);
        formData.append('username', form.employeeUsername);
        formData.append('role', form.employeeRole);
        formData.append('password', form.employeePassword);
        formData.append('address', form.employeeAddress);
        formData.append('phoneNumber', form.employeeMobile);

        // SEND THE REQUEST
        axios
            .post(`${process.env.API_URL}/create/employee`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                toast.success(response.data?.message || t('createSuccess'));
                setLoading(false);
            })
            .catch((error) => {
                toast.error(error?.response?.data?.message || t('createError'));
                setLoading(false);
            });
    }

    return (
        <div className={'card mb-0'} dir={isRTL ? 'rtl' : 'ltr'}>
            <h1 className={'text-2xl font-bold mb-4 uppercase'}>{t('title')}</h1>
            <form className="grid formgrid p-fluid" onSubmit={createEmployee}>
                <div className="col-12 mb-2 lg:mb-2">
                    <label className={'mb-2 block'} htmlFor="male-image">
                        {t('imageLabel')}
                    </label>
                    <CustomFileUpload
                        setFiles={(files) => {
                            setEmployeeImage(files);
                        }}
                        removeThisItem={(index) => {
                            // ITEMS COPY
                            const items = [...(employeeImage || [])];
                            // FILTER THE ITEMS
                            const newItems = items.filter((item, i) => {
                                return i !== index;
                            });
                            setEmployeeImage(newItems);
                        }}
                    />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="employeeName">{t('nameLabel')}</label>
                    <InputText id="employeeName" type="text" placeholder={t('namePlaceholder')} value={form.employeeName} onChange={(e) => setForm({ ...form, employeeName: e.target.value })} />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="employeeRole">{t('roleLabel')}</label>
                    <Dropdown
                        id="employeeRole"
                        placeholder={t('rolePlaceholder')}
                        options={[
                            { label: 'Admin', value: 'admin' },
                            { label: 'Manager', value: 'manager' },
                            { label: 'Employee', value: 'employee' },
                            { label: 'Chef', value: 'chef' }
                        ]}
                        value={form.employeeRole}
                        onChange={(e) => setForm({ ...form, employeeRole: e.target.value })}
                    />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="addess">{t('addressLabel')}</label>
                    <InputText id="addess" type="text" placeholder={t('addressPlaceholder')} value={form.employeeAddress} onChange={(e) => setForm({ ...form, employeeAddress: e.target.value })} />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="mobile">{t('mobileLabel')}</label>
                    <InputMask id="mobile" mask="99999999" placeholder={t('mobilePlaceholder')} value={form.employeeMobile} onChange={(e) => setForm({ ...form, employeeMobile: e.target.value })} />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="username">{t('usernameLabel')}</label>
                    <InputText id="username" type="text" placeholder={t('usernamePlaceholder')} value={form.employeeUsername} onChange={(e) => setForm({ ...form, employeeUsername: e.target.value })} />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="password">{t('passwordLabel')}</label>
                    <Password id="password" placeholder={t('passwordPlaceholder')} value={form.employeePassword} onChange={(e) => setForm({ ...form, employeePassword: e.target.value })} feedback={false} />
                </div>
                <div className="field col-12 mt-4 ml-auto">
                    <Button icon={loading ? 'pi pi-spin pi-spinner' : ''} type={'submit'} label={loading ? <ProgressSpinner fill={'#fff'} strokeWidth={'4'} style={{ width: '2rem', height: '2rem' }} /> : t('createButton')} disabled={loading} />
                </div>
            </form>
        </div>
    );
}
