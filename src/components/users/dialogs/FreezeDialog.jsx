'use client';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { useTranslations } from 'next-intl';

export default function FreezeDialog({ visible, onHide, onSubmit, freezeDate, setFreezeDate, freezePeriod, setFreezePeriod, pauseCounter, isRTL }) {
    const t = useTranslations('userProfile');

    const freezeDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label={t('actions.cancel')} icon="pi pi-times" onClick={onHide} className="p-button-outlined flex-1" />
            <Button label={t('actions.freeze')} icon="pi pi-check" onClick={onSubmit} severity="warning" autoFocus className="flex-1" />
        </div>
    );

    return (
        <Dialog header={t('dialogs.freeze.title')} visible={visible} style={{ width: '450px' }} dir={isRTL ? 'rtl' : 'ltr'} modal footer={freezeDialogFooter} onHide={onHide} className="p-fluid">
            <div className="flex flex-column gap-4 pt-4">
                <div className="field">
                    <label htmlFor="freezeDate" className="font-medium mb-2 block">
                        {t('dialogs.freeze.startDate')}
                    </label>
                    <Calendar id="freezeDate" value={freezeDate} onChange={(e) => setFreezeDate(e.value)} showIcon className="w-full" minDate={new Date()} />
                </div>
                <div className="field">
                    <label htmlFor="freezePeriod" className="font-medium mb-2 block">
                        {t('dialogs.freeze.period')}
                    </label>
                    <InputNumber id="freezePeriod" value={freezePeriod} onValueChange={(e) => setFreezePeriod(e.value)} min={1} max={30} showButtons className="w-full" />
                </div>
                <div className="surface-100 border-round p-3">
                    <p className="text-600 text-sm m-0">{t('dialogs.freeze.remainingPauseDays', { count: pauseCounter || 0 })}</p>
                </div>
            </div>
        </Dialog>
    );
}
