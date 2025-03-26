'use client';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { useTranslations } from 'next-intl';

export default function ClientInfo({ clientData, isRTL }) {
    const t = useTranslations('userProfile');

    return (
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
                        <p className="text-600 mb-1 text-sm">{t('dialogs.edit.subscriptionId')}</p>
                        <p className="text-900 font-medium">{clientData.subscriptionId}</p>
                    </div>
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
    );
}
