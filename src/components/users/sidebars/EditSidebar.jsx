'use client';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import { useTranslations } from 'next-intl';

export default function EditSidebar({ visible, onHide, onSubmit, editFormData, setEditFormData, genderOptions, governorateOptions, isRTL }) {
    const t = useTranslations('userProfile');

    return (
        <Sidebar visible={visible} dir={isRTL ? 'rtl' : 'ltr'} position={isRTL ? 'right' : 'left'} onHide={onHide} className="w-full md:w-30rem" header={t('dialogs.edit.title')}>
            <div className="flex flex-column gap-4 p-4">
                <div className="field">
                    <label htmlFor="clientName" className="font-medium mb-2 block">
                        {t('dialogs.edit.clientName')}
                    </label>
                    <InputText id="clientName" value={editFormData.clientName} onChange={(e) => setEditFormData({ ...editFormData, clientName: e.target.value })} className="w-full" />
                </div>

                <div className="field">
                    <label htmlFor="phoneNumber" className="font-medium mb-2 block">
                        {t('dialogs.edit.phoneNumber')}
                    </label>
                    <InputText id="phoneNumber" value={editFormData.phoneNumber} onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })} className="w-full" />
                </div>

                <div className="field">
                    <label htmlFor="gender" className="font-medium mb-2 block">
                        {t('dialogs.edit.gender')}
                    </label>
                    <Dropdown id="gender" value={editFormData.gender} options={genderOptions} onChange={(e) => setEditFormData({ ...editFormData, gender: e.value })} className="w-full" />
                </div>

                <div className="field">
                    <label htmlFor="governorate" className="font-medium mb-2 block">
                        {t('dialogs.edit.governorate')}
                    </label>
                    <Dropdown id="governorate" value={editFormData.governorate} options={governorateOptions} onChange={(e) => setEditFormData({ ...editFormData, governorate: e.value })} className="w-full" />
                </div>

                <div className="grid">
                    <div className="col-6">
                        <div className="field">
                            <label htmlFor="region" className="font-medium mb-2 block">
                                {t('dialogs.edit.region')}
                            </label>
                            <InputText id="region" value={editFormData.region} onChange={(e) => setEditFormData({ ...editFormData, region: e.target.value })} className="w-full" />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="field">
                            <label htmlFor="block" className="font-medium mb-2 block">
                                {t('dialogs.edit.block')}
                            </label>
                            <InputText id="block" value={editFormData.block} onChange={(e) => setEditFormData({ ...editFormData, block: e.target.value })} className="w-full" />
                        </div>
                    </div>
                </div>

                <div className="grid">
                    <div className="col-6">
                        <div className="field">
                            <label htmlFor="street" className="font-medium mb-2 block">
                                {t('dialogs.edit.street')}
                            </label>
                            <InputText id="street" value={editFormData.street} onChange={(e) => setEditFormData({ ...editFormData, street: e.target.value })} className="w-full" />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="field">
                            <label htmlFor="alley" className="font-medium mb-2 block">
                                {t('dialogs.edit.alley')}
                            </label>
                            <InputText id="alley" value={editFormData.alley} onChange={(e) => setEditFormData({ ...editFormData, alley: e.target.value })} className="w-full" />
                        </div>
                    </div>
                </div>

                <div className="grid">
                    <div className="col-4">
                        <div className="field">
                            <label htmlFor="building" className="font-medium mb-2 block">
                                {t('dialogs.edit.building')}
                            </label>
                            <InputText id="building" value={editFormData.building} onChange={(e) => setEditFormData({ ...editFormData, building: e.target.value })} className="w-full" />
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="field">
                            <label htmlFor="floor" className="font-medium mb-2 block">
                                {t('dialogs.edit.floor')}
                            </label>
                            <InputText id="floor" value={editFormData.floor} onChange={(e) => setEditFormData({ ...editFormData, floor: e.target.value })} className="w-full" />
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="field">
                            <label htmlFor="appartment" className="font-medium mb-2 block">
                                {t('dialogs.edit.apartment')}
                            </label>
                            <InputText id="appartment" value={editFormData.appartment} onChange={(e) => setEditFormData({ ...editFormData, appartment: e.target.value })} className="w-full" />
                        </div>
                    </div>
                </div>

                <div className="grid formgrid p-fluid">
                    <div className="col-6">
                        <div className="field">
                            <label htmlFor="protine" className="font-medium mb-2 block">
                                {t('dialogs.edit.protein')}
                            </label>
                            <InputNumber id="protine" value={editFormData.protine} onValueChange={(e) => setEditFormData({ ...editFormData, protine: e.value })} className="w-full" min={0} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="field">
                            <label htmlFor="carb" className="font-medium mb-2 block">
                                {t('dialogs.edit.carbs')}
                            </label>
                            <InputNumber id="carb" value={editFormData.carb} onValueChange={(e) => setEditFormData({ ...editFormData, carb: e.value })} className="w-full" min={0} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-content-end gap-2">
                    <Button label={t('actions.cancel')} icon="pi pi-times" severity="danger" onClick={onHide} className="p-button-outlined flex-1" />
                    <Button label={t('actions.save')} icon="pi pi-check" onClick={onSubmit} severity="success" className="flex-1" />
                </div>
            </div>
        </Sidebar>
    );
}
