'use client';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { useTranslations } from 'next-intl';

export default function SubscriptionInfo({ userData, remainingDays, formatDate, isRTL, locale }) {
    const t = useTranslations('userProfile');

    return (
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
                            <Tag severity="info" value={userData.clientData.clientStatus.numPause} rounded />
                        </div>
                        <div className="flex justify-content-between align-items-center p-2 surface-50 border-round">
                            <span className="text-700">{t('info.activeCount')}</span>
                            <Tag severity="success" value={userData.clientData.clientStatus.numActive} rounded />
                        </div>
                        <div className="flex justify-content-between align-items-center p-2 surface-50 border-round">
                            <span className="text-700">{t('info.remainingPauses')}</span>
                            <Tag severity="warning" value={userData.clientData.clientStatus.pauseCounter} rounded />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
