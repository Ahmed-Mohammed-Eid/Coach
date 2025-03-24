'use client';
import { Button } from 'primereact/button';
import { useTranslations } from 'next-intl';

export default function ActionButtons({ onDelete, onFreeze, onUnfreeze, onUnsubscribe, onEdit, onWallet, onModifyDays, onPaymentHistory, onRenew, onChangeMeals, clientData, id, locale }) {
    const t = useTranslations('userProfile');

    return (
        <div className="mb-4">
            <div className="card border-round-xl">
                <div className="flex flex-wrap gap-3 justify-content-between align-items-center">
                    <div className="flex gap-2">
                        <Button icon="pi pi-trash" severity="danger" onClick={onDelete} tooltip={t('actions.delete')} className="p-button-rounded p-button-outlined" />
                        {clientData.clientStatus.paused ? (
                            <Button icon="pi pi-play" severity="success" onClick={onUnfreeze} tooltip={t('actions.activate')} className="p-button-rounded p-button-outlined" />
                        ) : (
                            <Button icon="pi pi-pause" severity="warning" onClick={onFreeze} tooltip={t('actions.freeze')} disabled={clientData.clientStatus.pauseCounter <= 0} className="p-button-rounded p-button-outlined" />
                        )}
                        <Button icon="pi pi-ban" severity="danger" onClick={onUnsubscribe} tooltip={t('actions.unsubscribe')} className="p-button-rounded p-button-outlined" disabled={!clientData.subscriped} />
                        <Button icon="pi pi-pencil" severity="info" onClick={onEdit} tooltip={t('actions.edit')} className="p-button-rounded p-button-outlined" />
                        <Button icon="pi pi-wallet" severity="info" onClick={onWallet} tooltip={t('actions.wallet')} className="p-button-rounded p-button-outlined" />
                        <Button icon="pi pi-calendar-plus" severity="help" onClick={onModifyDays} tooltip={t('actions.modifyDays')} className="p-button-rounded p-button-outlined" disabled={!clientData.subscriped} />
                        <Button icon="pi pi-history" severity="info" onClick={onPaymentHistory} tooltip={t('actions.paymentHistory')} className="p-button-rounded p-button-outlined" />
                        <Button icon="pi pi-list" severity="info" onClick={onChangeMeals} tooltip={t('actions.changeMeals')} className="p-button-rounded p-button-outlined" />
                    </div>
                    <div className="flex gap-2">
                        <Button label={t('actions.renewPackage')} icon="pi pi-refresh" onClick={onRenew} className="p-button-outlined" />
                    </div>
                </div>
            </div>
        </div>
    );
}
