'use client';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { useTranslations } from 'next-intl';

export default function ModifyDaysDialog({ visible, onHide, onSubmit, modifyDaysData, setModifyDaysData, remainingDays, isRTL }) {
    const t = useTranslations('userProfile');

    const modifyDaysDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label={t('actions.cancel')} severity="danger" icon="pi pi-times" onClick={onHide} className="p-button-outlined flex-1" />
            <Button label={t('actions.apply')} icon="pi pi-check" onClick={onSubmit} severity={modifyDaysData.action === 'add' ? 'success' : 'danger'} autoFocus className="flex-1" />
        </div>
    );

    return (
        <Dialog header={t('dialogs.modifyDays.title')} dir={isRTL ? 'rtl' : 'ltr'} visible={visible} style={{ width: '450px' }} modal footer={modifyDaysDialogFooter} onHide={onHide} className="p-fluid">
            <div className="flex flex-column gap-4 pt-4">
                <div className="field">
                    <label className="font-medium mb-2 block">{t('dialogs.modifyDays.action')}</label>
                    <div className="flex gap-2">
                        <Button
                            label={t('dialogs.modifyDays.addDays')}
                            icon="pi pi-plus"
                            onClick={() => setModifyDaysData((prev) => ({ ...prev, action: 'add' }))}
                            severity="success"
                            outlined={modifyDaysData.action !== 'add'}
                            className="flex-1 p-button-outlined"
                        />
                        <Button
                            label={t('dialogs.modifyDays.removeDays')}
                            icon="pi pi-minus"
                            onClick={() => setModifyDaysData((prev) => ({ ...prev, action: 'remove' }))}
                            severity="warning"
                            outlined={modifyDaysData.action !== 'remove'}
                            className="flex-1 p-button-outlined"
                        />
                    </div>
                </div>
                <div className="field">
                    <label htmlFor="numberOfDays" className="font-medium mb-2 block">
                        {t('dialogs.modifyDays.numberOfDays')}
                    </label>
                    <InputNumber
                        id="numberOfDays"
                        value={modifyDaysData.numberOfDays}
                        onChange={(e) =>
                            setModifyDaysData((prev) => ({
                                ...prev,
                                numberOfDays: e.value
                            }))
                        }
                        min={1}
                        showButtons
                        className="w-full"
                    />
                </div>
                <div className="surface-100 border-round p-3">
                    <p className="text-600 text-sm m-0">
                        {t('dialogs.modifyDays.currentDays')}: {remainingDays}
                    </p>
                    <p className="text-600 text-sm m-0 mt-2">
                        {t('dialogs.modifyDays.afterChange')}: {modifyDaysData.action === 'add' ? remainingDays + (modifyDaysData.numberOfDays || 0) : remainingDays - (modifyDaysData.numberOfDays || 0)}
                    </p>
                </div>
            </div>
        </Dialog>
    );
}
