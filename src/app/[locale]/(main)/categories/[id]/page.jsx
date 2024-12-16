import EditCategoryForm from "../../components/categories/EditCategoryForm/EditCategoryForm";

export default function EditCategoryPage({params: {id}}) {
    return (
        <EditCategoryForm
            id={id}
        />
    )
}