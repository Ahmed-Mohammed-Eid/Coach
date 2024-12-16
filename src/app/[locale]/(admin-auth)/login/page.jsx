'use client';

import { useRouter } from 'next/navigation';
import React, { useContext, useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { ProgressSpinner } from 'primereact/progressspinner';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import styles from './login.module.scss'; // Import the SCSS Module
import Link from 'next/link'; // Import Link

const LoginPage = ({ params: { locale } }) => {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const usernameRef = useRef(null);
    const t = useTranslations('login');
    const currentLocale = useLocale();
    const isRTL = locale === 'ar';

    const containerClassName = classNames(styles.loginContainer, 'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    const handleLogin = async (event) => {
        event.preventDefault();

        const usernameRegex = /^[a-zA-Z0-9]+$/;
        const passwordRegex = /^[a-zA-Z0-9]+$/;

        if (!usernameRegex.test(username)) {
            toast.error(t('invalidUsername'));
            usernameRef.current?.classList.add('p-invalid');
            return;
        }

        if (!passwordRegex.test(password)) {
            toast.error(t('invalidPassword'));
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post(`${process.env.API_URL}/login`, {
                username,
                password
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data?.user?.role);
            document.cookie = `token=${res.data.token}; path=/`;
            document.cookie = `role=${res.data?.user?.role}; path=/`;

            console.log(res.data);

            if (res.data?.user?.role === 'admin') {
                const timer = setTimeout(() => {
                    clearTimeout(timer);
                    window.location.href = `/${locale}/`;
                }, 500);
            } else {
                toast.error(t('notAuthorized'));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || t('loginFailed'));
        } finally {
            setLoading(false);
        }
    };

    const switchLocale = (newLocale) => {
        router.push(`/${newLocale}`);
    };

    return (
        <div className={containerClassName} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={styles.loginCard}>
                <div className={styles.localeSwitcher}>
                    {currentLocale === 'en' ? (
                        <Link href="/ar" onClick={() => switchLocale('ar')} className={styles.localeItem}>
                            عربي
                            <label htmlFor="ar">
                                <Image src={'/ar.svg'} alt={t('arabic')} width={22} height={16} />
                            </label>
                        </Link>
                    ) : (
                        <Link href="/en" onClick={() => switchLocale('en')} className={styles.localeItem}>
                            English
                            <label htmlFor="en">
                                <Image src={'/en.svg'} alt={t('english')} width={22} height={16} />
                            </label>
                        </Link>
                    )}
                </div>
                <div className="flex align-items-center justify-content-center mb-4">
                    <Image src="/logo.png" width={120} height={75} alt="logo" />
                </div>
                <div className={styles.formWrapper}>
                    <form onSubmit={handleLogin} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="username" className={styles.label}>
                                {t('username')}
                            </label>
                            <InputText id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('username')} className={styles.input} ref={usernameRef} />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password1" className={styles.label}>
                                {t('password')}
                            </label>
                            <Password inputStyle={{ width: '100%' }} id="password1" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('password')} toggleMask className={styles.input} feedback={false} />
                        </div>

                        <Button
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
                                    t('login')
                                )
                            }
                            className={classNames(styles.loginButton, { 'p-disabled': loading })}
                            type="submit"
                            loading={loading}
                        />
                    </form>
                </div>
            </div>
        </div>
    );
};

LoginPage.getLayout = function getLayout(page) {
    return <React.Fragment>{page}</React.Fragment>;
};

export default LoginPage;
