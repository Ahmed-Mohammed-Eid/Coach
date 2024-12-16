import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ChooseTypes({ getType, selectedOptions }) {
    const t = useTranslations('createMeal');

    const [types, setTypes] = useState({
        number: 0,
        typesArray: []
    });

    // GET THE TYPE
    getType(types.typesArray);

    React.useEffect(() => {
        if (selectedOptions) {
            setTypes({
                number: selectedOptions.length,
                typesArray: selectedOptions
            });
        }
    }, [selectedOptions]);

    return (
        <div className={'card mb-2'}>
            <h1 className={'text-2xl font-bold mb-4 uppercase'}>{t('mealOptions')}</h1>
            <div className="grid formgrid p-fluid">
                {new Array(types.number).fill(0).map((_, index) => {
                    return (
                        <>
                            <div className="field col-12 md:col-4">
                                <label htmlFor={`typesNameAr${index}`}>{t('optionNameAr')}</label>
                                <InputText
                                    id={`typesNameAr${index}`}
                                    type="text"
                                    placeholder={t('enterOptionNameAr')}
                                    value={types.typesArray[index]?.optionNameAR}
                                    onChange={(e) => {
                                        const ArrayOfTypes = [...types.typesArray];
                                        ArrayOfTypes[index] = {
                                            ...ArrayOfTypes[index],
                                            optionNameAR: e.target.value
                                        };
                                        setTypes({
                                            ...types,
                                            typesArray: ArrayOfTypes
                                        });
                                    }}
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label htmlFor={`typesNameEn${index}`}>{t('optionNameEn')}</label>
                                <InputText
                                    id={`typesNameEn${index}`}
                                    type="text"
                                    placeholder={t('enterOptionNameEn')}
                                    value={types.typesArray[index]?.optionNameEN}
                                    onChange={(e) => {
                                        const ArrayOfTypes = [...types.typesArray];
                                        ArrayOfTypes[index] = {
                                            ...ArrayOfTypes[index],
                                            optionNameEN: e.target.value
                                        };
                                        setTypes({
                                            ...types,
                                            typesArray: ArrayOfTypes
                                        });
                                    }}
                                />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label htmlFor={`typesPrice${index}`}>{t('optionPrice')}</label>
                                <InputNumber
                                    mode={'currency'}
                                    currency={'KWD'}
                                    locale={'en-US'}
                                    currencyDisplay={'symbol'}
                                    id={`typesPrice${index}`}
                                    placeholder={t('enterOptionPrice')}
                                    value={types.typesArray[index]?.optionPrice}
                                    onChange={(e) => {
                                        const ArrayOfTypes = [...types.typesArray];
                                        ArrayOfTypes[index] = {
                                            ...ArrayOfTypes[index],
                                            optionPrice: e.value
                                        };
                                        setTypes({
                                            ...types,
                                            typesArray: ArrayOfTypes
                                        });
                                    }}
                                />
                            </div>
                            <div className="field col-12 md:col-1 flex justify-content-end align-items-end mb-8 mt-4 md:mt-0 md:mb-0">
                                <Button
                                    icon="pi pi-times"
                                    type={'button'}
                                    style={{ marginBottom: '14px' }}
                                    rounded
                                    text
                                    raised
                                    severity="danger"
                                    aria-label="Cancel"
                                    onClick={() => {
                                        const ArrayOfTypes = [...types.typesArray];
                                        ArrayOfTypes.splice(index, 1);
                                        setTypes({
                                            ...types,
                                            number: types.number - 1,
                                            typesArray: ArrayOfTypes
                                        });
                                    }}
                                />
                            </div>
                        </>
                    );
                })}
            </div>
            <div
                style={{
                    width: `100%`,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    marginTop: '20px'
                }}
            >
                <Button
                    icon="pi pi-plus"
                    type={'button'}
                    rounded
                    text
                    raised
                    severity="help"
                    aria-label="add"
                    onClick={() => {
                        setTypes({
                            ...types,
                            number: types.number + 1
                        });
                    }}
                />
            </div>
        </div>
    );
}
