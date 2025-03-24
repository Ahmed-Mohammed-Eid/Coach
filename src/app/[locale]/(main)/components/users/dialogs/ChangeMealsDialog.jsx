'use client';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { useTranslations } from 'next-intl';

export default function ChangeMealsDialog({ visible, onHide, onSubmit, mealsData, setMealsData, isRTL }) {
    const t = useTranslations('userProfile');

    const dialogFooter = (
        <div className="grid">
            <Button label={t('actions.cancel')} icon="pi pi-times" onClick={onHide} className="col-6 p-button-outlined flex-1" />
            <Button label={t('actions.apply')} icon="pi pi-check" onClick={onSubmit} severity="success" autoFocus className="col-6 flex-1" />
        </div>
    );

    return (
        <Dialog header={t('dialogs.changeMeals.title')} visible={visible} style={{ maxWidth: '650px', width: '100%' }} modal footer={dialogFooter} onHide={onHide} className="p-fluid" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="grid pt-4">
                <div className="col-6">
                    <label htmlFor="mealsNumber" className="font-medium mb-2 block">
                        {t('dialogs.changeMeals.mealsNumber')}
                    </label>
                    <InputNumber
                        id="mealsNumber"
                        value={mealsData.mealsNumber}
                        onValueChange={(e) =>
                            setMealsData((prev) => ({
                                ...prev,
                                mealsNumber: e.value
                            }))
                        }
                        min={1}
                        showButtons
                        className="w-full"
                    />
                </div>
                <div className="col-6">
                    <label htmlFor="snacksNumber" className="font-medium mb-2 block">
                        {t('dialogs.changeMeals.snacksNumber')}
                    </label>
                    <InputNumber
                        id="snacksNumber"
                        value={mealsData.snacksNumber}
                        onValueChange={(e) =>
                            setMealsData((prev) => ({
                                ...prev,
                                snacksNumber: e.value
                            }))
                        }
                        min={0}
                        showButtons
                        className="w-full"
                    />
                </div>
                {/* allowedBreakfast */}
                <div className="col-12">
                    <label htmlFor="allowedBreakfast" className="font-medium mb-2 block">
                        {t('dialogs.changeMeals.allowedBreakfast')}
                    </label>
                    <InputNumber
                        id="allowedBreakfast"
                        value={mealsData.allowedBreakfast}
                        onValueChange={(e) =>
                            setMealsData((prev) => ({
                                ...prev,
                                allowedBreakfast: e.value
                            }))
                        }
                        min={0}
                        showButtons
                        className="w-full"
                    />
                </div>
                {/* allowedLunch */}
                <div className="col-6">
                    <label htmlFor="allowedLunch" className="font-medium mb-2 block">
                        {t('dialogs.changeMeals.allowedLunch')}
                    </label>
                    <InputNumber
                        id="allowedLunch"
                        value={mealsData.allowedLunch}
                        onValueChange={(e) =>
                            setMealsData((prev) => ({
                                ...prev,
                                allowedLunch: e.value
                            }))
                        }
                        min={0}
                        showButtons
                        className="w-full"
                    />
                </div>
                {/* allowedDinner */}
                <div className="col-6">
                    <label htmlFor="allowedDinner" className="font-medium mb-2 block">
                        {t('dialogs.changeMeals.allowedDinner')}
                    </label>
                    <InputNumber
                        id="allowedDinner"
                        value={mealsData.allowedDinner}
                        onValueChange={(e) =>
                            setMealsData((prev) => ({
                                ...prev,
                                allowedDinner: e.value
                            }))
                        }
                        min={0}
                        showButtons
                        className="w-full"
                    />
                </div>
            </div>
        </Dialog>
    );
}
