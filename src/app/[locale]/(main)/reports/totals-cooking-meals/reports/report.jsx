import React from 'react';
import styles from './report.module.scss';

const ManufacturingReport = ({ reportData }) => {
    const columnSizes = [80, 90, 100, 120, 150, 180, 200];

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

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
                <h3 className={styles.date}>{formatDate(reportData.reportData.date)}</h3>

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
                            {reportData.reportData.categories.map((category, categoryIndex) => (
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
                                            <td className={styles.centered}>{item.totalInGrams}</td>
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
                                {reportData.reportData.totals.map((total, i) => (
                                    <td key={i} className={styles.centered}>
                                        {total}
                                    </td>
                                ))}
                                <td className={styles.centered}>{reportData.reportData.grandTotal}</td>
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
