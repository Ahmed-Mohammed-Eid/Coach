'use client';

import { useEffect, useState } from 'react';
// PRIME REACT
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

// HELPERS
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Dialog } from 'primereact/dialog';
import { useTranslations, useLocale } from 'next-intl';

export default function CategoriesList() {
    // ROUTER
    const router = useRouter();
    const t = useTranslations('DashboardCategories');
    const locale = useLocale();
    const isRTL = locale === 'ar';

    // STATES
    const [categories, setCategories] = useState([]);
    const [selectedCategoryToDelete, setSelectedCategoryToDelete] = useState(null);

    // EFFECT TO FETCH DATA
    useEffect(() => {
        // GET CATEGORIES LIST
        getCategoriesList();
    }, []);

    // GET CATEGORIES LIST HANDLER
    const getCategoriesList = () => {
        // GET THE TOKEN FROM LOCAL STORAGE
        const token = localStorage.getItem('token');

        // API CALL /categories
        axios
            .get(`${process.env.API_URL}/food/category/list`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((res) => {
                console.log(res.data);
                setCategories(res.data?.categories || []);
            })
            .catch((err) => {
                console.log(err);
                toast.error(t('fetchCategoriesError'));
            });
    };

    // DELETE CATEGORY HANDLER
    const deleteCategory = (category) => {
        // GET THE TOKEN FROM LOCAL STORAGE
        const token = localStorage.getItem('token');

        // API CALL /category/delete
        axios
            .delete(`${process.env.API_URL}/delete/food/category`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    foodCategoryId: category._id
                }
            })
            .then((_) => {
                toast.success(t('deleteCategorySuccess'));
                setSelectedCategoryToDelete(null);
                getCategoriesList();
            })
            .catch((err) => {
                console.log(err);
                toast.error(t('deleteCategoryError'));
            });
    };

    return (
        <>
            <div className="card" dir={isRTL ? 'rtl' : 'ltr'}>
                <h4>{t('foodCategories')}</h4>
                <hr />
                <DataTable
                    value={categories || []}
                    paginator
                    rows={25}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    rowsPerPageOptions={[25, 50, 100]}
                    currentPageReportTemplate={t('currentPageReportTemplate')} // "Showing {first} to {last} of {totalRecords} entries"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                    header={t('foodCategories')}
                    emptyMessage={t('noCategoriesFound')}
                    className="p-datatable-sm"
                >
                    {/*  IMAGE  */}
                    <Column
                        body={(rowData) => {
                            return <Image src={rowData?.categoryImage || '/assets/404.jpg'} alt={t('categoryImage')} width={50} height={50} style={{ width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #ccc' }} />;
                        }}
                        header={t('image')}
                        style={{ width: '10%' }}
                    />
                    {/*  NAME EN  */}
                    <Column field="categoryNameEN" header={t('categoryNameEN')} sortable filter />

                    {/*  NAME AR  */}
                    <Column field="categoryNameAR" header={t('categoryNameAR')} sortable filter />

                    {/*  ACTIONS  */}
                    <Column
                        body={(rowData) => {
                            return (
                                <div className={'flex justify-center gap-1'}>
                                    <button className={'editButton'} onClick={() => router.push(`/${locale}/foodcategories/${rowData._id}`)}>
                                        {t('edit')}
                                    </button>
                                    <button className={'deleteButton'} onClick={() => setSelectedCategoryToDelete(rowData)}>
                                        {t('delete')}
                                    </button>
                                </div>
                            );
                        }}
                        header={t('actions')}
                        style={{ width: '10%' }}
                    />
                </DataTable>
            </div>

            {/* DELETE DIALOG */}
            <Dialog
                dir={isRTL ? 'rtl' : 'ltr'}
                visible={selectedCategoryToDelete !== null}
                onHide={() => setSelectedCategoryToDelete(null)}
                header={t('deleteCategory')}
                footer={
                    <div className={'flex justify-center'}>
                        <button className={'deleteButton'} onClick={() => deleteCategory(selectedCategoryToDelete)}>
                            {t('delete')}
                        </button>
                        <button className={'cancelButton'} onClick={() => setSelectedCategoryToDelete(null)}>
                            {t('cancel')}
                        </button>
                    </div>
                }
                position={'center'}
                style={{ width: '100%', maxWidth: '500px' }}
                draggable={false}
                resizable={false}
            >
                <div className={'flex justify-center'}>
                    <p>{t('deleteCategoryConfirmation')}</p>
                </div>
            </Dialog>
        </>
    );
}
