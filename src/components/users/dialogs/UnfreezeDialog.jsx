'use client';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { useTranslations } from 'next-intl';

export default function UnfreezeDialog({ visible, onHide, onSubmit, unfreezeDate, setUnfreezeDate, isRTL }) {
    const t = useTranslations('userProfile');

    const unfreezeDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label={t('actions.cancel')} icon="pi pi-times" onClick={onHide} className="p-button-outlined flex-1" />
            <Button label={t('actions.activate')} icon="pi pi-check" onClick={onSubmit} severity="success" autoFocus className="flex-1" />
        </div>
    );

    return (
        <Dialog header={t('dialogs.unfreeze.title')} visible={visible} style={{ width: '450px' }} dir={isRTL ? 'rtl' : 'ltr'} modal footer={unfreezeDialogFooter} onHide={onHide} className="p-fluid">
            <div className="flex flex-column gap-4 pt-4">
                <div className="field">
                    <label htmlFor="unfreezeDate" className="font-medium mb-2 block">
                        {t('dialogs.unfreeze.activationDate')}
                    </label>
                    <Calendar id="unfreezeDate" value={unfreezeDate} onChange={(e) => setUnfreezeDate(e.value)} showIcon className="w-full" minDate={new Date()} />
                </div>
                <div className="surface-100 border-round p-3">
                    <p className="text-600 text-sm m-0">
                        {t('dialogs.unfreeze.currentStatus')}:
                        <Tag severity="warning" value={t('status.paused')} className="ml-2" />
                    </p>
                </div>
            </div>
        </Dialog>
    );
}
