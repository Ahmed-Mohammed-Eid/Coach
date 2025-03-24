interface KichenMealsNotesPdfReportProps {
    reportData: any[];
    date: Date;
    isRtl: boolean;
    t: any;
}

const KichenMealsNotesPdfReport = ({ reportData, date, isRtl, t }: KichenMealsNotesPdfReportProps) => {
    return (
        <div className="invoice-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif', direction: isRtl ? 'rtl' : 'ltr' }}>
            <div className="invoice-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                <div className="logo">
                    <h1 style={{ margin: '0', color: '#333' }}>{t.pdfReportTitle}</h1>
                    <p style={{ margin: '5px 0' }}>Date: {date.toLocaleDateString()}</p>
                </div>
            </div>

            <div className="invoice-body" style={{ marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', textAlign: isRtl ? 'right' : 'left' }}>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>{t.customerName}</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>{t.mealTitle}</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>{t.mealNote}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData && reportData.length > 0 ? (
                            reportData.map((item, index) => (
                                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: isRtl ? 'right' : 'left' }}>{item.customerName}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: isRtl ? 'right' : 'left' }}>{item.mealTitle}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: isRtl ? 'right' : 'left' }}>{item.mealNote}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                                    {t.noData}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="invoice-footer" style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '10px', textAlign: 'center', fontSize: '12px', color: '#777' }}>
                <p>© {new Date().getFullYear()} Kitchen Meals Notes Report</p>
            </div>
        </div>
    );
};

export default KichenMealsNotesPdfReport;
