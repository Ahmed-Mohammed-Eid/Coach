import React from 'react';
import styles from './report.module.scss';

const ManufacturingReport = () => {
    // Report data
    const reportData = {
        date: '23/03/2025',
        categories: [
            {
                name: 'FUTOOR',
                items: [
                    { name: 'Jareesh Chicken', values: [0, 0, 0, 0, 0, 0, 0], total: 0, totalInGrams: '' },
                    { name: 'Tashreeba Fasuliya Meat', values: [0, 0, 0, 0, 0, 0, 0], total: 0, totalInGrams: '' },
                    { name: 'Kabsa Meat', values: [0, 0, 0, 1, 0, 0, 0], total: 1, totalInGrams: '' },
                    { name: 'Chicken Mushroom with Rice', values: [0, 2, 0, 1, 2, 0, 0], total: 5, totalInGrams: '' },
                    { name: 'Biryani Shrimps', values: [0, 0, 2, 0, 4, 0, 0], total: 6, totalInGrams: '' }
                ]
            },
            {
                name: 'SUHOOR',
                items: [
                    { name: 'Egg Rolls Broccoli', values: [0, 0, 0, 0, 0, 0, 0], total: 0, totalInGrams: '0' },
                    { name: 'Italian Chicken Burger', values: [0, 1, 0, 1, 4, 0, 0], total: 6, totalInGrams: '0.81' },
                    { name: 'Lazone Meat Pasta', values: [0, 0, 3, 0, 1, 0, 0], total: 4, totalInGrams: '0.42' }
                ]
            },
            {
                name: 'GHAQA',
                items: [
                    { name: 'Beef Cutlet', values: [0, 0, 0, 0, 0, 0, 0], total: 0, totalInGrams: '0' },
                    { name: 'Kibba Burghul', values: [0, 2, 0, 0, 0, 0, 0], total: 2, totalInGrams: '0.18' },
                    { name: 'Samosa Cheese', values: [0, 2, 0, 0, 2, 0, 0], total: 4, totalInGrams: '0.48' },
                    { name: 'Qatayef Nuts', values: [0, 2, 0, 0, 1, 0, 0], total: 3, totalInGrams: '0.33' },
                    { name: 'Malai Dessert', values: [0, 0, 0, 0, 0, 0, 0], total: 0, totalInGrams: '0' }
                ]
            },
            {
                name: 'Snack',
                items: [
                    { name: 'Bluberry CheeseCake', values: [0, 2, 0, 0, 2, 0, 0], total: 4, totalInGrams: '' },
                    { name: 'Coffee Chico Cake', values: [0, 0, 0, 0, 0, 0, 0], total: 0, totalInGrams: '' },
                    { name: 'Mandarine', values: [0, 0, 0, 0, 3, 0, 0], total: 3, totalInGrams: '' }
                ]
            },
            {
                name: 'SALAD',
                items: [
                    { name: 'Mushroom Cream Soup', values: [0, 0, 3, 0, 3, 0, 0], total: 6, totalInGrams: '' },
                    { name: 'Chinese Cabbage Salad', values: [0, 1, 0, 0, 4, 0, 0], total: 5, totalInGrams: '' },
                    { name: 'Rocket Vegetable Salad', values: [0, 0, 0, 0, 1, 0, 0], total: 1, totalInGrams: '' }
                ]
            }
        ],
        totals: [0, 12, 8, 3, 27, 0, 0],
        grandTotal: 50
    };

    // Updated column sizes
    const columnSizes = [80, 90, 100, 120, 150, 180, 200];

    return (
        <div className={styles.container}>
            <div className={styles.reportContainer}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.logoContainer}>
                        <div className={styles.logoBorder}></div>
                        <img src="/logo.png" alt="Fresh Cuisine Logo" className={styles.logo} />
                    </div>

                    <h2 className={styles.title}>Manufacturing Report</h2>

                    <div className={styles.logoContainer}>
                        <div className={styles.logoBorder}></div>
                        <img src="/logo.png" alt="Fresh Cuisine Logo" className={styles.logo} />
                    </div>
                </div>

                {/* Date */}
                <h3 className={styles.date}>{reportData.date}</h3>

                {/* Table */}
                <div className={styles.tableContainer}>
                    <table>
                        <thead>
                            <tr>
                                <th>MEAL / GR</th>
                                {columnSizes.map((size) => (
                                    <th key={size} className={styles.centered}>
                                        {size}
                                    </th>
                                ))}
                                <th className={styles.centered}>TOTAL</th>
                                <th className={styles.centered}>TOTAL IN GRAMS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.categories.map((category, categoryIndex) => (
                                <React.Fragment key={categoryIndex}>
                                    {/* Category Header */}
                                    <tr>
                                        <td colSpan="10" className={styles.categoryHeader}>
                                            {category.name}
                                        </td>
                                    </tr>

                                    {/* Category Items */}
                                    {category.items.map((item, itemIndex) => (
                                        <tr key={itemIndex}>
                                            <td>{item.name}</td>
                                            {item.values.map((value, valueIndex) => (
                                                <td key={valueIndex} className={styles.centered}>
                                                    {value}
                                                </td>
                                            ))}
                                            <td className={styles.centered}>{item.total}</td>
                                            <td>{item.totalInGrams}</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}

                            {/* Empty rows before total */}
                            {[1, 2, 3].map((i) => (
                                <tr key={`empty-${i}`}>
                                    <td colSpan="10" className={styles.emptyRow}></td>
                                </tr>
                            ))}

                            {/* Total row */}
                            <tr className={styles.totalRow}>
                                <td>TOTAL</td>
                                {reportData.totals.map((total, i) => (
                                    <td key={i} className={styles.centered}>
                                        {total}
                                    </td>
                                ))}
                                <td className={styles.centered}>{reportData.grandTotal}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManufacturingReport;
