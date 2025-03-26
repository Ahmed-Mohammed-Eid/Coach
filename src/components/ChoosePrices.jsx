import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { useTranslations } from 'next-intl';

export default function ChoosePrices({ getPrices, selectedPrices }) {
    const t = useTranslations('createPackage');

    const [prices, setPrices] = useState({
        number: 0,
        pricesArray: []
    });

    // GET THE PRICE
    getPrices(prices.pricesArray);

    React.useEffect(() => {
        if (selectedPrices) {
            setPrices({
                number: selectedPrices.length,
                pricesArray: selectedPrices
            });
        }
    }, [selectedPrices]);

    return (
        <div className={'card mb-2'}>
            <h1 className={'text-2xl font-bold mb-4 uppercase'}>{t('packagePrices')}</h1>
            <div className="grid formgrid p-fluid flex align-items-center">
                {new Array(prices.number).fill(0).map((_, index) => {
                    return (
                        <>
                            <div className="field col-12 md:col-5 " key={'price' + index}>
                                <label htmlFor={`packageTime${index}`}>{t('packageTime')}</label>
                                <Dropdown
                                    id={`packageTime${index}`}
                                    value={prices.pricesArray[index]?.period}
                                    options={[
                                        { label: t('1week'), value: '1 week' },
                                        { label: t('2weeks'), value: '2 weeks' },
                                        { label: t('3weeks'), value: '3 weeks' },
                                        { label: t('1month24'), value: '1 month (24)' },
                                        { label: t('1month26'), value: '1 month (26)' }
                                    ]}
                                    onChange={(e) => {
                                        const ArrayOfPrices = [...prices.pricesArray];
                                        ArrayOfPrices[index] = {
                                            ...ArrayOfPrices[index],
                                            period: e.value
                                        };
                                        setPrices({
                                            ...prices,
                                            pricesArray: ArrayOfPrices
                                        });
                                    }}
                                    placeholder={t('selectPackageTime')}
                                />
                            </div>
                            <div className="field col-12 md:col-5">
                                <label htmlFor={`pricesPrice${index}`}>{t('packagePrice')}</label>
                                <InputNumber
                                    mode={'currency'}
                                    currency={'KWD'}
                                    locale={'en-US'}
                                    currencyDisplay={'symbol'}
                                    id={`pricesPrice${index}`}
                                    placeholder={t('enterOptionPrice')}
                                    value={prices.pricesArray[index]?.price}
                                    onChange={(e) => {
                                        const ArrayOfPrices = [...prices.pricesArray];
                                        ArrayOfPrices[index] = {
                                            ...ArrayOfPrices[index],
                                            price: e.value
                                        };
                                        setPrices({
                                            ...prices,
                                            pricesArray: ArrayOfPrices
                                        });
                                    }}
                                />
                            </div>
                            <div className="field col-12 md:col-2 flex justify-content-end align-items-end mb-8 mt-4 md:mt-0 md:mb-0">
                                <Button
                                    icon="pi pi-times"
                                    price={'button'}
                                    rounded
                                    text
                                    raised
                                    severity="danger"
                                    aria-label="Cancel"
                                    type={'button'}
                                    onClick={() => {
                                        const ArrayOfPrices = [...prices.pricesArray];
                                        ArrayOfPrices.splice(index, 1);
                                        setPrices({
                                            ...prices,
                                            number: prices.number - 1,
                                            pricesArray: ArrayOfPrices
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
                    price={'button'}
                    rounded
                    text
                    raised
                    severity="help"
                    aria-label="add"
                    type={'button'}
                    onClick={() => {
                        setPrices({
                            ...prices,
                            number: prices.number + 1
                        });
                    }}
                />
            </div>
        </div>
    );
}
