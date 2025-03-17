import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import { TabView, TabPanel } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { formatDate } from '../../../../../utils/helpers';

const ClientsMonitorOverview = ({ data, loading, locale }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedClient, setSelectedClient] = useState(null);
    const [detailsVisible, setDetailsVisible] = useState(false);

    const t =
        locale === 'ar'
            ? {
                  title: 'مراقبة العملاء',
                  newClients: 'عملاء جدد',
                  renewedClients: 'عملاء مجددين',
                  endingClients: 'عملاء منتهية اشتراكاتهم',
                  noData: 'لا توجد بيانات متاحة',
                  clientName: 'اسم العميل',
                  phoneNumber: 'رقم الهاتف',
                  bundleName: 'اسم الباقة',
                  endingDate: 'تاريخ الانتهاء',
                  daysLeft: 'الأيام المتبقية',
                  viewDetails: 'عرض التفاصيل',
                  clientDetails: 'تفاصيل العميل',
                  subscriptionDetails: 'تفاصيل الاشتراك',
                  startDate: 'تاريخ البدء',
                  period: 'المدة',
                  status: 'الحالة',
                  active: 'نشط',
                  inactive: 'غير نشط',
                  close: 'إغلاق',
                  subscriptionId: 'رقم الاشتراك',
                  bundleType: 'نوع الباقة',
                  mealsCount: 'عدد الوجبات',
                  mealsType: 'أنواع الوجبات',
                  paid: 'مدفوع',
                  unpaid: 'غير مدفوع',
                  month: 'شهر',
                  months: 'أشهر',
                  custom: 'مخصصة',
                  standard: 'قياسية'
              }
            : {
                  title: 'Clients Monitor',
                  newClients: 'New Clients',
                  renewedClients: 'Renewed Clients',
                  endingClients: 'Ending Subscriptions',
                  noData: 'No data available',
                  clientName: 'Client Name',
                  phoneNumber: 'Phone Number',
                  bundleName: 'Bundle Name',
                  endingDate: 'Ending Date',
                  daysLeft: 'Days Left',
                  viewDetails: 'View Details',
                  clientDetails: 'Client Details',
                  subscriptionDetails: 'Subscription Details',
                  startDate: 'Start Date',
                  period: 'Period',
                  status: 'Status',
                  active: 'Active',
                  inactive: 'Inactive',
                  close: 'Close',
                  subscriptionId: 'Subscription ID',
                  bundleType: 'Bundle Type',
                  mealsCount: 'Meals Count',
                  mealsType: 'Meals Type',
                  paid: 'Paid',
                  unpaid: 'Unpaid',
                  month: 'month',
                  months: 'months',
                  custom: 'Custom',
                  standard: 'Standard'
              };

    const calculateDaysLeft = (endDate) => {
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getSeverity = (daysLeft) => {
        if (daysLeft <= 3) return 'danger';
        if (daysLeft <= 7) return 'warning';
        return 'success';
    };

    const daysLeftTemplate = (rowData) => {
        const daysLeft = calculateDaysLeft(rowData.subscripedBundle?.endingDate);
        return <Tag value={`${daysLeft} ${locale === 'ar' ? 'يوم' : 'days'}`} severity={getSeverity(daysLeft)} />;
    };

    const bundleNameTemplate = (rowData) => {
        const bundleName = locale === 'ar' ? rowData.subscripedBundle?.bundleId?.bundleName : rowData.subscripedBundle?.bundleId?.bundleNameEn;
        return <span>{bundleName || '-'}</span>;
    };

    const endingDateTemplate = (rowData) => {
        return <span>{formatDate(rowData.subscripedBundle?.endingDate, locale)}</span>;
    };

    const actionTemplate = (rowData) => {
        return <Button icon="pi pi-eye" rounded text severity="info" aria-label={t.viewDetails} tooltip={t.viewDetails} tooltipOptions={{ position: 'top' }} onClick={() => openDetails(rowData)} />;
    };

    const openDetails = (client) => {
        setSelectedClient(client);
        setDetailsVisible(true);
    };

    const hideDetails = () => {
        setDetailsVisible(false);
        setSelectedClient(null);
    };

    const formatPeriod = (period) => {
        if (!period) return '-';
        const match = period.match(/(\d+)\s*month/i);
        if (match && match[1]) {
            const months = parseInt(match[1]);
            return months === 1 ? `1 ${locale === 'ar' ? t.month : t.month}` : `${months} ${locale === 'ar' ? t.months : t.months}`;
        }
        return period;
    };

    const renderClientDetails = () => {
        if (!selectedClient) return null;

        const bundle = selectedClient.subscripedBundle?.bundleId || {};
        const subscription = selectedClient.subscripedBundle || {};

        return (
            <div className="grid">
                <div className="col-12 md:col-6">
                    <div className="p-3">
                        <h5>{t.clientDetails}</h5>
                        <div className="flex flex-column gap-3">
                            <div className="flex justify-content-between">
                                <span className="font-semibold">{t.clientName}:</span>
                                <span>{selectedClient.clientName}</span>
                            </div>
                            <div className="flex justify-content-between">
                                <span className="font-semibold">{t.phoneNumber}:</span>
                                <span>{selectedClient.phoneNumber}</span>
                            </div>
                            <div className="flex justify-content-between">
                                <span className="font-semibold">{t.subscriptionId}:</span>
                                <span>{selectedClient.subscriptionId || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 md:col-6">
                    <div className="p-3">
                        <h5>{t.subscriptionDetails}</h5>
                        <div className="flex flex-column gap-3">
                            <div className="flex justify-content-between">
                                <span className="font-semibold">{t.bundleName}:</span>
                                <span>{locale === 'ar' ? bundle.bundleName : bundle.bundleNameEn}</span>
                            </div>
                            <div className="flex justify-content-between">
                                <span className="font-semibold">{t.bundleType}:</span>
                                <span>{bundle.customBundle ? t.custom : t.standard}</span>
                            </div>
                            <div className="flex justify-content-between">
                                <span className="font-semibold">{t.mealsCount}:</span>
                                <span>{bundle.mealsNumber || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Divider className="w-full" />

                <div className="col-12">
                    <div className="p-3">
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <div className="flex justify-content-between mb-3">
                                    <span className="font-semibold">{t.startDate}:</span>
                                    <span>{formatDate(subscription.startingDate, locale)}</span>
                                </div>
                                <div className="flex justify-content-between mb-3">
                                    <span className="font-semibold">{t.endingDate}:</span>
                                    <span>{formatDate(subscription.endingDate, locale)}</span>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="flex justify-content-between mb-3">
                                    <span className="font-semibold">{t.period}:</span>
                                    <span>{formatPeriod(subscription.bundlePeriod)}</span>
                                </div>
                                <div className="flex justify-content-between mb-3">
                                    <span className="font-semibold">{t.status}:</span>
                                    <Tag value={subscription.isPaid ? t.paid : t.unpaid} severity={subscription.isPaid ? 'success' : 'danger'} />
                                </div>
                            </div>
                            {bundle.mealsType && bundle.mealsType.length > 0 && (
                                <div className="col-12">
                                    <div className="flex justify-content-between mb-3">
                                        <span className="font-semibold">{t.mealsType}:</span>
                                        <div className="flex gap-2">
                                            {bundle.mealsType.map((meal, index) => (
                                                <Tag key={index} value={meal} severity="info" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSkeleton = () => {
        return (
            <div className="border-round border-1 surface-border p-4">
                <div className="flex mb-3">
                    <Skeleton width="10rem" height="2rem" className="mr-2"></Skeleton>
                    <Skeleton width="10rem" height="2rem"></Skeleton>
                </div>
                <Skeleton height="2rem" className="mb-2"></Skeleton>
                <Skeleton height="2rem" className="mb-2"></Skeleton>
                <Skeleton height="2rem" className="mb-2"></Skeleton>
                <Skeleton height="2rem" className="mb-2"></Skeleton>
                <Skeleton height="2rem"></Skeleton>
            </div>
        );
    };

    const renderEmptyMessage = () => {
        return (
            <div className="flex align-items-center justify-content-center" style={{ height: '200px' }}>
                <div className="text-center">
                    <i className="pi pi-inbox text-4xl mb-3 text-color-secondary"></i>
                    <p>{t.noData}</p>
                </div>
            </div>
        );
    };

    const dialogFooter = (
        <div className="flex justify-content-end">
            <Button label={t.close} icon="pi pi-times" onClick={hideDetails} className="p-button-text" />
        </div>
    );

    return (
        <>
            <div className="card">
                <div className="flex justify-content-between align-items-center mb-3">
                    <h5 className="m-0">{t.title}</h5>
                </div>

                {loading ? (
                    renderSkeleton()
                ) : (
                    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                        <TabPanel header={t.endingClients}>
                            <DataTable
                                value={data?.endingClients || []}
                                emptyMessage={renderEmptyMessage()}
                                paginator={data?.endingClients?.length > 5}
                                rows={5}
                                rowsPerPageOptions={[5, 10, 25]}
                                tableStyle={{ minWidth: '50rem' }}
                                stripedRows
                                responsiveLayout="stack"
                                breakpoint="960px"
                            >
                                <Column field="clientName" header={t.clientName} sortable />
                                <Column field="phoneNumber" header={t.phoneNumber} />
                                <Column body={bundleNameTemplate} header={t.bundleName} />
                                <Column body={endingDateTemplate} header={t.endingDate} sortable />
                                <Column body={daysLeftTemplate} header={t.daysLeft} sortable />
                                <Column body={actionTemplate} style={{ width: '5rem' }} />
                            </DataTable>
                        </TabPanel>
                        <TabPanel header={t.newClients}>
                            <DataTable
                                value={data?.newClients || []}
                                emptyMessage={renderEmptyMessage()}
                                paginator={data?.newClients?.length > 5}
                                rows={5}
                                rowsPerPageOptions={[5, 10, 25]}
                                tableStyle={{ minWidth: '50rem' }}
                                stripedRows
                                responsiveLayout="stack"
                                breakpoint="960px"
                            >
                                <Column field="clientName" header={t.clientName} sortable />
                                <Column field="phoneNumber" header={t.phoneNumber} />
                                <Column body={bundleNameTemplate} header={t.bundleName} />
                                <Column body={endingDateTemplate} header={t.endingDate} sortable />
                                <Column body={actionTemplate} style={{ width: '5rem' }} />
                            </DataTable>
                        </TabPanel>
                        <TabPanel header={t.renewedClients}>
                            <DataTable
                                value={data?.renewedClients || []}
                                emptyMessage={renderEmptyMessage()}
                                paginator={data?.renewedClients?.length > 5}
                                rows={5}
                                rowsPerPageOptions={[5, 10, 25]}
                                tableStyle={{ minWidth: '50rem' }}
                                stripedRows
                                responsiveLayout="stack"
                                breakpoint="960px"
                            >
                                <Column field="clientName" header={t.clientName} sortable />
                                <Column field="phoneNumber" header={t.phoneNumber} />
                                <Column body={bundleNameTemplate} header={t.bundleName} />
                                <Column body={endingDateTemplate} header={t.endingDate} sortable />
                                <Column body={actionTemplate} style={{ width: '5rem' }} />
                            </DataTable>
                        </TabPanel>
                    </TabView>
                )}
            </div>

            <Dialog header={selectedClient?.clientName} visible={detailsVisible} style={{ width: '90%', maxWidth: '800px' }} onHide={hideDetails} footer={dialogFooter} breakpoints={{ '960px': '90vw', '640px': '100vw' }} maximizable>
                {renderClientDetails()}
            </Dialog>
        </>
    );
};

export default ClientsMonitorOverview;
