interface DeliveryReportPdfProps {
    reportData: any[];
    date: Date;
    isRtl: boolean;
    t: any;
    zoneName?: string;
}

const DeliveryReportPdf = ({ reportData, date, isRtl, t, zoneName }: DeliveryReportPdfProps) => {
    const title = zoneName ? (isRtl ? `${t.pdfReportTitle} - ${zoneName}` : `${t.pdfReportTitle} - ${zoneName}`) : t.pdfReportTitle;

    return (
        <div className="invoice-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif', direction: isRtl ? 'rtl' : 'ltr' }}>
            <div className="invoice-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                <div className="logo">
                    <h1 style={{ margin: '0', color: '#333' }}>{title}</h1>
                    <p style={{ margin: '5px 0' }}>Date: {date.toLocaleDateString()}</p>
                </div>
            </div>

            <div className="invoice-body" style={{ marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', textAlign: isRtl ? 'right' : 'left' }}>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>{t.distributionZone}</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>{t.clientName}</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>{t.phoneNumber}</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>{t.address}</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>{t.package}</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>{t.deliveryNotes}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData && reportData.length > 0 ? (
                            reportData.map((item, index) => (
                                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: isRtl ? 'right' : 'left' }}>{item.zoneName}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: isRtl ? 'right' : 'left' }}>{item.clientName}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: isRtl ? 'right' : 'left' }}>{item.phoneNumber}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: isRtl ? 'left' : 'left' }}>{item.address}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: isRtl ? 'right' : 'left' }}>{item.bundleName}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: isRtl ? 'right' : 'left' }}>{item.deliveryNote}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                                    {t.noData}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="invoice-footer" style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '10px', textAlign: 'center', fontSize: '12px', color: '#777' }}>
                <p>
                    © {new Date().getFullYear()} {t.pdfReportTitle}
                </p>
            </div>
        </div>
    );
};

export default DeliveryReportPdf;
