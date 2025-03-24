/* eslint-disable @next/next/no-img-element */
import React from 'react';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '../types/types';
import { useTranslations, useLocale } from 'next-intl';

const AppMenu = () => {
    const t = useTranslations();
    const locale = useLocale();
    const isRTL = locale === 'ar';

    const model: AppMenuItem[] = [
        {
            label: t('AppMenu.home'),
            items: [{ label: t('AppMenu.dashboard'), icon: 'pi pi-fw pi-home', to: `/${locale}` }]
        },
        {
            label: t('AppMenu.categories'),
            icon: 'pi pi-fw pi-list',
            items: [
                {
                    label: t('AppMenu.categoriesList'),
                    icon: 'pi pi-fw pi-list',
                    to: `/${locale}/categories`
                },
                {
                    label: t('AppMenu.createCategory'),
                    icon: 'pi pi-fw pi-plus',
                    to: `/${locale}/categories/add`
                }
            ]
        },
        {
            label: t('AppMenu.foodCategories'),
            icon: 'pi pi-fw pi-list',
            items: [
                {
                    label: t('AppMenu.foodCategoriesList'),
                    icon: 'pi pi-fw pi-list',
                    to: `/${locale}/foodcategories`
                },
                {
                    label: t('AppMenu.createFoodCategory'),
                    icon: 'pi pi-fw pi-plus',
                    to: `/${locale}/foodcategories/add`
                }
            ]
        },
        {
            label: t('AppMenu.packages'),
            icon: 'pi pi-list',
            items: [
                {
                    label: t('AppMenu.packagesList'),
                    icon: 'pi pi-fw pi-list',
                    to: `/${locale}/packages`
                },
                {
                    label: t('AppMenu.createPackage'),
                    icon: 'pi pi-fw pi-plus',
                    to: `/${locale}/packages/create`
                },
                {
                    label: t('AppMenu.flexBundle'),
                    icon: 'pi pi-fw pi-cog',
                    to: `/${locale}/packages/flex-bundle`
                }
            ]
        },
        {
            label: t('AppMenu.meals'),
            icon: 'pi pi-fw pi-list',
            items: [
                {
                    label: t('AppMenu.mealsList'),
                    icon: 'pi pi-fw pi-list',
                    to: `/${locale}/meals`
                },
                {
                    label: t('AppMenu.createMeal'),
                    icon: 'pi pi-fw pi-plus',
                    to: `/${locale}/meals/create`
                }
            ]
        },
        {
            label: t('AppMenu.menuSettings'),
            icon: 'pi pi-fw pi-cog',
            items: [
                {
                    label: t('AppMenu.defaultMenu'),
                    icon: 'pi pi-fw pi-calendar',
                    to: `/${locale}/menu/default`
                },
                {
                    label: t('AppMenu.chefMenu'),
                    icon: 'pi pi-fw pi-calendar',
                    to: `/${locale}/menu/chef`
                }
            ]
        },
        {
            label: t('AppMenu.users'),
            icon: 'pi pi-fw pi-users',
            items: [
                {
                    label: t('AppMenu.usersList'),
                    icon: 'pi pi-fw pi-list',
                    to: `/${locale}/users/clients`
                },
                {
                    label: t('AppMenu.createUser'),
                    icon: 'pi pi-fw pi-plus',
                    to: `/${locale}/users/create/client`
                }
            ]
        },
        {
            label: t('AppMenu.employees'),
            icon: 'pi pi-fw pi-users',
            items: [
                {
                    label: t('AppMenu.employeesList'),
                    icon: 'pi pi-fw pi-list',
                    to: `/${locale}/users/employees`
                },
                {
                    label: t('AppMenu.createEmployee'),
                    icon: 'pi pi-fw pi-plus',
                    to: `/${locale}/users/create/employee`
                }
            ]
        },
        {
            label: t('AppMenu.uiManagement'),
            icon: 'pi pi-fw pi-cog',
            items: [
                {
                    label: t('AppMenu.sliders'),
                    icon: 'pi pi-fw pi-cog',
                    to: `/${locale}/ui/sliders`
                },
                {
                    label: t('AppMenu.addSlider'),
                    icon: 'pi pi-fw pi-plus',
                    to: `/${locale}/ui/sliders/add`
                }
            ]
        },
        {
            label: t('AppMenu.coupons'),
            icon: 'pi pi-fw pi-list',
            items: [
                {
                    label: t('AppMenu.couponsList'),
                    icon: 'pi pi-fw pi-list',
                    to: `/${locale}/coupons`
                },
                {
                    label: t('AppMenu.createCoupon'),
                    icon: 'pi pi-fw pi-plus',
                    to: `/${locale}/coupons/add`
                }
            ]
        },
        // Delivery
        {
            label: t('AppMenu.delivery'),
            icon: 'pi pi-fw pi-list',
            items: [
                {
                    label: t('AppMenu.deliveryList'),
                    icon: 'pi pi-fw pi-list',
                    to: `/${locale}/delivery`
                },
                {
                    label: t('AppMenu.createDelivery'),
                    icon: 'pi pi-fw pi-plus',
                    to: `/${locale}/delivery/create`
                }
            ]
        },
        {
            label: t('AppMenu.reports'),
            icon: 'pi pi-fw pi-chart-bar',
            items: [
                {
                    label: t('AppMenu.reportsList'),
                    icon: 'pi pi-fw pi-list',
                    to: `/${locale}/reports`
                },
                {
                    label: t('AppMenu.dailyMealsReport'),
                    icon: 'pi pi-fw pi-list',
                    to: `/${locale}/reports/meals-report`
                },
                {
                    label: t('AppMenu.deliveryReport'),
                    icon: 'pi pi-fw pi-list',
                    to: `/${locale}/reports/delivery-report`
                },
                {
                    label: t('AppMenu.kitchenMealsNotesReport'),
                    icon: 'pi pi-fw pi-list',
                    to: `/${locale}/reports/kitchen-meals-notes-report`
                },
                // TOTAL COOKING MEALS REPORT
                {
                    label: t('AppMenu.totalCookingMealsReport'),
                    icon: 'pi pi-fw pi-list',
                    to: `/${locale}/reports/totals-cooking-meals`
                }
            ]
        },
        {
            label: t('AppMenu.tools'),
            icon: 'pi pi-fw pi-list',
            items: [
                {
                    label: t('AppMenu.uploadMealsByExcel'),
                    icon: 'pi pi-fw pi-upload',
                    to: `/${locale}/tools/upload-meals-by-excel`
                },
                {
                    label: t('AppMenu.uploadRegionsByExcel'),
                    icon: 'pi pi-fw pi-upload',
                    to: `/${locale}/tools/upload-regions-by-excel`
                }
            ]
        },
        {
            label: t('AppMenu.settings'),
            items: [
                {
                    label: t('AppMenu.logout'),
                    icon: 'pi pi-sign-out',
                    to: `/${locale}/login`,
                    command: () => {
                        // Clear local storage
                        localStorage.clear();
                        // Clear Cookies
                        document.cookie.split(';').forEach((c) => {
                            document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
                        });
                        // Redirect to login page
                        window.location.href = `/${locale}/login`;
                    }
                }
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                {model.map((item, i) => {
                    return !item?.separator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
