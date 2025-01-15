'use client';

import { PrimeReactContext } from 'primereact/api';
import { Button } from 'primereact/button';
import { InputSwitch, InputSwitchChangeEvent } from 'primereact/inputswitch';
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton';
import { Sidebar } from 'primereact/sidebar';
import { classNames } from 'primereact/utils';
import React, { useContext, useEffect, useState } from 'react';
import { AppConfigProps, LayoutConfig, LayoutState } from '../types/types';
import { LayoutContext } from './context/layoutcontext';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

const AppConfig = (props: AppConfigProps) => {
    const t = useTranslations('common');
    const router = useRouter();
    const pathname = usePathname();

    const [scales] = useState([12, 13, 14, 15, 16]);
    const { layoutConfig, setLayoutConfig, layoutState, setLayoutState } = useContext(LayoutContext);
    const { setRipple, changeTheme } = useContext(PrimeReactContext);

    const locale = useLocale();
    const isRTL = locale === 'ar';

    const onConfigButtonClick = () => {
        setLayoutState((prevState: LayoutState) => ({ ...prevState, configSidebarVisible: true }));
    };

    const onConfigSidebarHide = () => {
        setLayoutState((prevState: LayoutState) => ({ ...prevState, configSidebarVisible: false }));
    };

    const changeInputStyle = (e: RadioButtonChangeEvent) => {
        setLayoutConfig((prevState: LayoutConfig) => ({ ...prevState, inputStyle: e.value }));
    };

    const changeRipple = (e: InputSwitchChangeEvent) => {
        setRipple(e.value as boolean);
        setLayoutConfig((prevState: LayoutConfig) => ({ ...prevState, ripple: e.value as boolean }));
    };

    const changeMenuMode = (e: RadioButtonChangeEvent) => {
        setLayoutConfig((prevState: LayoutConfig) => ({ ...prevState, menuMode: e.value }));
    };

    const _changeTheme = (theme: string, colorScheme: string) => {
        changeTheme?.(layoutConfig.theme, theme, 'theme-css', () => {
            setLayoutConfig((prevState: LayoutConfig) => ({ ...prevState, theme, colorScheme }));
        });
    };

    const decrementScale = () => {
        setLayoutConfig((prevState: LayoutConfig) => ({ ...prevState, scale: prevState.scale - 1 }));
    };

    const incrementScale = () => {
        setLayoutConfig((prevState: LayoutConfig) => ({ ...prevState, scale: prevState.scale + 1 }));
    };

    const applyScale = () => {
        document.documentElement.style.fontSize = layoutConfig.scale + 'px';
    };

    useEffect(() => {
        applyScale();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layoutConfig.scale]);

    const changeLanguage = (e: RadioButtonChangeEvent) => {
        const newLanguage = e.value;
        setLayoutConfig((prevState: LayoutConfig) => ({ ...prevState, language: newLanguage }));

        // Get the current path segments
        const segments = pathname.split('/');
        // Replace the locale segment (first segment after /) with the new language
        segments[1] = newLanguage;
        // Construct the new path
        const newPath = segments.join('/');

        // Navigate to the new path
        router.push(newPath);
    };

    return (
        <>
            <button className="layout-config-button config-link" type="button" onClick={onConfigButtonClick}>
                <i className="pi pi-cog"></i>
            </button>

            <Sidebar
                visible={layoutState.configSidebarVisible}
                onHide={onConfigSidebarHide}
                position="right"
                className="layout-config-sidebar w-20rem"
                style={{
                    direction: isRTL ? 'rtl' : 'ltr',
                    textAlign: isRTL ? 'right' : 'left'
                }}
            >
                {!props.simple && (
                    <>
                        <h5>{t('language')}</h5>
                        <div className="flex">
                            <div className="field-radiobutton flex-1 gap-2">
                                <RadioButton name="language" value={'en'} checked={locale === 'en'} onChange={changeLanguage} inputId="en" />
                                <label htmlFor="en">
                                    <Image src={'/en.svg'} alt={t('english')} width={22} height={16} />
                                </label>
                            </div>
                            <div className="field-radiobutton flex-1 gap-2">
                                <RadioButton name="language" value={'ar'} checked={locale === 'ar'} onChange={changeLanguage} inputId="ar" />
                                <label htmlFor="ar">
                                    <Image src={'/ar.svg'} alt={t('arabic')} width={22} height={16} />
                                </label>
                            </div>
                        </div>

                        <h5>{t('scale')}</h5>
                        <div className="flex align-items-center">
                            <Button icon="pi pi-minus" type="button" onClick={decrementScale} rounded text className="w-2rem h-2rem mr-2" disabled={layoutConfig.scale === scales[0]}></Button>
                            <div className="flex gap-2 align-items-center">
                                {scales.map((item) => {
                                    return <i className={classNames('pi pi-circle-fill', { 'text-primary-500': item === layoutConfig.scale, 'text-300': item !== layoutConfig.scale })} key={item}></i>;
                                })}
                            </div>
                            <Button icon="pi pi-plus" type="button" onClick={incrementScale} rounded text className="w-2rem h-2rem ml-2" disabled={layoutConfig.scale === scales[scales.length - 1]}></Button>
                        </div>

                        <h5>{t('menuType')}</h5>
                        <div className="flex">
                            <div className="field-radiobutton flex-1 gap-2">
                                <RadioButton name="menuMode" value={'static'} checked={layoutConfig.menuMode === 'static'} onChange={(e) => changeMenuMode(e)} inputId="mode1"></RadioButton>
                                <label htmlFor="mode1">{t('static')}</label>
                            </div>
                            <div className="field-radiobutton flex-1 gap-2">
                                <RadioButton name="menuMode" value={'overlay'} checked={layoutConfig.menuMode === 'overlay'} onChange={(e) => changeMenuMode(e)} inputId="mode2"></RadioButton>
                                <label htmlFor="mode2">{t('overlay')}</label>
                            </div>
                        </div>

                        <h5>{t('inputStyle')}</h5>
                        <div className="flex">
                            <div className="field-radiobutton flex-1 gap-2">
                                <RadioButton name="inputStyle" value={'outlined'} checked={layoutConfig.inputStyle === 'outlined'} onChange={(e) => changeInputStyle(e)} inputId="outlined_input"></RadioButton>
                                <label htmlFor="outlined_input">{t('outlined')}</label>
                            </div>
                            <div className="field-radiobutton flex-1 gap-2">
                                <RadioButton name="inputStyle" value={'filled'} checked={layoutConfig.inputStyle === 'filled'} onChange={(e) => changeInputStyle(e)} inputId="filled_input"></RadioButton>
                                <label htmlFor="filled_input">{t('filled')}</label>
                            </div>
                        </div>

                        <h5>{t('rippleEffect')}</h5>
                        <InputSwitch checked={layoutConfig.ripple as boolean} onChange={(e) => changeRipple(e)}></InputSwitch>
                    </>
                )}
                {/*
                <h5>{t('coach')}</h5>
                <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('lara-light-coach', 'light')}>
                    <img src="/logo.png" className="w-2rem h-2rem" alt="Coach" />
                </button> */}

                <h5>{t('bootstrap')}</h5>
                <div className="grid">
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('bootstrap4-light-blue', 'light')}>
                            <img src="/layout/images/themes/bootstrap4-light-blue.svg" className="w-2rem h-2rem" alt={t('bootstrapLightBlue')} />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('bootstrap4-light-purple', 'light')}>
                            <img src="/layout/images/themes/bootstrap4-light-purple.svg" className="w-2rem h-2rem" alt={t('bootstrapLightPurple')} />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('bootstrap4-dark-blue', 'dark')}>
                            <img src="/layout/images/themes/bootstrap4-dark-blue.svg" className="w-2rem h-2rem" alt={t('bootstrapDarkBlue')} />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('bootstrap4-dark-purple', 'dark')}>
                            <img src="/layout/images/themes/bootstrap4-dark-purple.svg" className="w-2rem h-2rem" alt={t('bootstrapDarkPurple')} />
                        </button>
                    </div>
                </div>

                <h5>{t('materialDesign')}</h5>
                <div className="grid">
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('md-light-indigo', 'light')}>
                            <img src="/layout/images/themes/md-light-indigo.svg" className="w-2rem h-2rem" alt="Material Light Indigo" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('md-light-deeppurple', 'light')}>
                            <img src="/layout/images/themes/md-light-deeppurple.svg" className="w-2rem h-2rem" alt="Material Light DeepPurple" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('md-dark-indigo', 'dark')}>
                            <img src="/layout/images/themes/md-dark-indigo.svg" className="w-2rem h-2rem" alt="Material Dark Indigo" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('md-dark-deeppurple', 'dark')}>
                            <img src="/layout/images/themes/md-dark-deeppurple.svg" className="w-2rem h-2rem" alt="Material Dark DeepPurple" />
                        </button>
                    </div>
                </div>

                <h5>{t('materialDesignCompact')}</h5>
                <div className="grid">
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('mdc-light-indigo', 'light')}>
                            <img src="/layout/images/themes/md-light-indigo.svg" className="w-2rem h-2rem" alt="Material Light Indigo" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('mdc-light-deeppurple', 'light')}>
                            <img src="/layout/images/themes/md-light-deeppurple.svg" className="w-2rem h-2rem" alt="Material Light Deep Purple" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('mdc-dark-indigo', 'dark')}>
                            <img src="/layout/images/themes/md-dark-indigo.svg" className="w-2rem h-2rem" alt="Material Dark Indigo" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('mdc-dark-deeppurple', 'dark')}>
                            <img src="/layout/images/themes/md-dark-deeppurple.svg" className="w-2rem h-2rem" alt="Material Dark Deep Purple" />
                        </button>
                    </div>
                </div>

                <h5>{t('tailwind')}</h5>
                <div className="grid">
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('tailwind-light', 'light')}>
                            <img src="/layout/images/themes/tailwind-light.png" className="w-2rem h-2rem" alt="Tailwind Light" />
                        </button>
                    </div>
                </div>

                <h5>{t('fluentUI')}</h5>
                <div className="grid">
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('fluent-light', 'light')}>
                            <img src="/layout/images/themes/fluent-light.png" className="w-2rem h-2rem" alt="Fluent Light" />
                        </button>
                    </div>
                </div>

                <h5>{t('primeOneDesign2022')}</h5>
                <div className="grid">
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('lara-light-indigo', 'light')}>
                            <img src="/layout/images/themes/lara-light-indigo.png" className="w-2rem h-2rem" alt="Lara Light Indigo" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('lara-light-blue', 'light')}>
                            <img src="/layout/images/themes/lara-light-blue.png" className="w-2rem h-2rem" alt="Lara Light Blue" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('lara-light-purple', 'light')}>
                            <img src="/layout/images/themes/lara-light-purple.png" className="w-2rem h-2rem" alt="Lara Light Purple" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('lara-light-teal', 'light')}>
                            <img src="/layout/images/themes/lara-light-teal.png" className="w-2rem h-2rem" alt="Lara Light Teal" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('lara-dark-indigo', 'dark')}>
                            <img src="/layout/images/themes/lara-dark-indigo.png" className="w-2rem h-2rem" alt="Lara Dark Indigo" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('lara-dark-blue', 'dark')}>
                            <img src="/layout/images/themes/lara-dark-blue.png" className="w-2rem h-2rem" alt="Lara Dark Blue" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('lara-dark-purple', 'dark')}>
                            <img src="/layout/images/themes/lara-dark-purple.png" className="w-2rem h-2rem" alt="Lara Dark Purple" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('lara-dark-teal', 'dark')}>
                            <img src="/layout/images/themes/lara-dark-teal.png" className="w-2rem h-2rem" alt="Lara Dark Teal" />
                        </button>
                    </div>
                </div>

                <h5>{t('primeOneDesign2021')}</h5>
                <div className="grid">
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('saga-blue', 'light')}>
                            <img src="/layout/images/themes/saga-blue.png" className="w-2rem h-2rem" alt="Saga Blue" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('saga-green', 'light')}>
                            <img src="/layout/images/themes/saga-green.png" className="w-2rem h-2rem" alt="Saga Green" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('saga-orange', 'light')}>
                            <img src="/layout/images/themes/saga-orange.png" className="w-2rem h-2rem" alt="Saga Orange" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('saga-purple', 'light')}>
                            <img src="/layout/images/themes/saga-purple.png" className="w-2rem h-2rem" alt="Saga Purple" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('vela-blue', 'dark')}>
                            <img src="/layout/images/themes/vela-blue.png" className="w-2rem h-2rem" alt="Vela Blue" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('vela-green', 'dark')}>
                            <img src="/layout/images/themes/vela-green.png" className="w-2rem h-2rem" alt="Vela Green" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('vela-orange', 'dark')}>
                            <img src="/layout/images/themes/vela-orange.png" className="w-2rem h-2rem" alt="Vela Orange" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('vela-purple', 'dark')}>
                            <img src="/layout/images/themes/vela-purple.png" className="w-2rem h-2rem" alt="Vela Purple" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('arya-blue', 'dark')}>
                            <img src="/layout/images/themes/arya-blue.png" className="w-2rem h-2rem" alt="Arya Blue" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('arya-green', 'dark')}>
                            <img src="/layout/images/themes/arya-green.png" className="w-2rem h-2rem" alt="Arya Green" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('arya-orange', 'dark')}>
                            <img src="/layout/images/themes/arya-orange.png" className="w-2rem h-2rem" alt="Arya Orange" />
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="p-link w-2rem h-2rem" onClick={() => _changeTheme('arya-purple', 'dark')}>
                            <img src="/layout/images/themes/arya-purple.png" className="w-2rem h-2rem" alt="Arya Purple" />
                        </button>
                    </div>
                </div>
            </Sidebar>
        </>
    );
};

export default AppConfig;
