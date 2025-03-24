'use client';
import { useTranslations } from 'next-intl';

export default function NutritionInfo({ clientData, isRTL }) {
    const t = useTranslations('userProfile');

    return (
        <div className="card w-full">
            <div className="h-full">
                <div className="flex align-items-center mb-4">
                    <i className={`pi pi-chart-bar text-xl text-primary`}></i>
                    <h3 className={`text-xl font-semibold m-0 ${isRTL ? 'text-right mr-2' : 'text-left ml-2'}`}>{t('info.nutritionPlan')}</h3>
                </div>
                <div className="flex gap-4">
                    <div className="text-center flex-1 p-4 border-round shadow-1">
                        <div className="bg-primary inline-flex align-items-center justify-content-center border-circle mb-3" style={{ width: '3.5rem', height: '3.5rem' }}>
                            <i className="pi pi-heart-fill text-2xl text-white"></i>
                        </div>
                        <p className="text-600 mb-2 font-medium text-sm">{t('info.protein')}</p>
                        <div className="text-primary text-5xl font-bold mb-2">{clientData.protine}</div>
                        <span className="text-600 text-sm">{t('info.grams')}</span>
                    </div>
                    <div className="text-center flex-1 p-4 border-round shadow-1">
                        <div className="bg-primary inline-flex align-items-center justify-content-center border-circle mb-3" style={{ width: '3.5rem', height: '3.5rem' }}>
                            <i className="pi pi-bolt text-2xl text-white"></i>
                        </div>
                        <p className="text-600 mb-2 font-medium text-sm">{t('info.carbs')}</p>
                        <div className="text-primary text-5xl font-bold mb-2">{clientData.carb}</div>
                        <span className="text-600 text-sm">{t('info.grams')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
