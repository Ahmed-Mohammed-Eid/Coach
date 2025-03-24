'use client';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { RadioButton } from 'primereact/radiobutton';
import { useTranslations } from 'next-intl';

export default function RenewDialog({ visible, onHide, onSubmit, renewForm, setRenewForm, renewType, setRenewType, bundles, currentBundle, isRTL }) {
    const t = useTranslations('userProfile');

    const renewDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label={t('actions.cancel')} icon="pi pi-times" onClick={onHide} className="p-button-outlined flex-1" />
            <Button label={t('actions.renewPackage')} icon="pi pi-check" onClick={onSubmit} autoFocus className="flex-1" />
        </div>
    );

    return (
        <Dialog header={t('dialogs.renew.title')} visible={visible} style={{ width: '500px' }} modal footer={renewDialogFooter} onHide={onHide} className="p-fluid" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex flex-column gap-4 pt-4">
                <div className="field">
                    <div className="flex gap-3 mb-4">
                        <div className="field-radiobutton flex-1">
                            <RadioButton
                                inputId="samePackage"
                                name="renewType"
                                value="same"
                                onChange={(e) => {
                                    setRenewType(e.value);
                                    setRenewForm((prev) => ({
                                        ...prev,
                                        bundleId: currentBundle?.bundleId?._id || '',
                                        bundlePeriod: currentBundle?.bundlePeriod || ''
                                    }));
                                }}
                                checked={renewType === 'same'}
                            />
                            <label htmlFor="samePackage" className={`${isRTL ? 'mr-2' : 'ml-2'}`}>
                                {t('dialogs.renew.samePackage')}
                            </label>
                        </div>
                        <div className="field-radiobutton flex-1">
                            <RadioButton
                                inputId="newPackage"
                                name="renewType"
                                value="new"
                                onChange={(e) => {
                                    setRenewType(e.value);
                                    setRenewForm((prev) => ({
                                        ...prev,
                                        bundleId: '',
                                        bundlePeriod: ''
                                    }));
                                }}
                                checked={renewType === 'new'}
                            />
                            <label htmlFor="newPackage" className={`${isRTL ? 'mr-2' : 'ml-2'}`}>
                                {t('dialogs.renew.newPackage')}
                            </label>
                        </div>
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="startingAt" className="font-medium mb-2 block">
                        {t('dialogs.renew.startDate')}
                    </label>
                    <Calendar id="startingAt" placeholder={t('dialogs.renew.selectStartDate')} value={renewForm.startingAt} onChange={(e) => setRenewForm({ ...renewForm, startingAt: e.value })} showIcon className="w-full" minDate={new Date()} />
                </div>

                <div className="field">
                    <label htmlFor="bundleId" className="font-medium mb-2 block">
                        {t('dialogs.renew.bundle')}
                    </label>
                    <Dropdown
                        id="bundleId"
                        value={renewForm.bundleId}
                        options={bundles.map((bundle) => ({
                            label: isRTL ? bundle.bundleName : bundle.bundleNameEn,
                            value: bundle._id
                        }))}
                        placeholder={t('dialogs.renew.selectBundle')}
                        onChange={(e) => setRenewForm({ ...renewForm, bundleId: e.value, bundlePeriod: '' })}
                        disabled={renewType === 'same'}
                        className="w-full"
                    />
                </div>

                <div className="field">
                    <label htmlFor="bundlePeriod" className="font-medium mb-2 block">
                        {t('dialogs.renew.period')}
                    </label>
                    <Dropdown
                        id="bundlePeriod"
                        value={renewForm.bundlePeriod}
                        options={
                            renewForm?.bundleId
                                ? bundles
                                      ?.find((bundle) => bundle?._id === renewForm?.bundleId)
                                      ?.periodPrices.map((pp) => ({
                                          label: `${pp.period} - ${pp.price} KWD`,
                                          value: pp.period
                                      }))
                                : []
                        }
                        onChange={(e) => setRenewForm({ ...renewForm, bundlePeriod: e.value })}
                        placeholder={t('dialogs.renew.selectPeriod')}
                        className="w-full"
                    />
                </div>

                <div className="field-checkbox">
                    <Checkbox inputId="requirePayment" checked={renewForm.requirePayment} onChange={(e) => setRenewForm({ ...renewForm, requirePayment: e.checked })} />
                    <label htmlFor="requirePayment" className={`${isRTL ? 'mr-2' : 'ml-2'} font-medium`}>
                        {t('dialogs.renew.requirePayment')}
                    </label>
                </div>

                <div className="field-checkbox">
                    <Checkbox inputId="hasCoupon" checked={renewForm.hasCoupon} onChange={(e) => setRenewForm({ ...renewForm, hasCoupon: e.checked })} />
                    <label htmlFor="hasCoupon" className={`${isRTL ? 'mr-2' : 'ml-2'} font-medium`}>
                        {t('dialogs.renew.hasCoupon')}
                    </label>
                </div>

                {renewForm.hasCoupon && (
                    <div className="field">
                        <label htmlFor="couponCode" className="font-medium mb-2 block">
                            {t('dialogs.renew.couponCode')}
                        </label>
                        <InputText id="couponCode" value={renewForm.couponCode} onChange={(e) => setRenewForm({ ...renewForm, couponCode: e.target.value })} className="w-full" />
                    </div>
                )}
            </div>
        </Dialog>
    );
}
