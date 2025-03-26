import EditCategoryForm from '../../../../../components/FoodCategories/EditCategoryForm/EditCategoryForm';

export default function EditCategoryPage({ params: { id } }) {
    return <EditCategoryForm id={id} />;
}
