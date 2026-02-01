import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ItemWizard } from "./ItemWizard";
import { AdminLayout } from "./AdminLayout";
import { Id } from "../convex/_generated/dataModel";

export function ItemWizardPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams] = useSearchParams();
  
  const editingItemId = searchParams.get("editingItem");
  const initialDataStr = searchParams.get("initialData");
  
  let initialData;
  try {
    initialData = initialDataStr ? JSON.parse(decodeURIComponent(initialDataStr)) : undefined;
  } catch (error) {
    console.error("Error parsing initial data:", error);
    initialData = undefined;
  }

  const handleClose = () => {
    navigate("/admin/categories");
  };

  const handleSuccess = () => {
    navigate("/admin/categories");
  };

  if (!categoryId) {
    return (
      <AdminLayout currentPage="categories" pageTitle="Item Management">
        <div className="main__content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="alert alert-danger">
                  Category ID is required
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      currentPage="categories" 
      pageTitle={editingItemId ? "Edit Item" : "Add New Item"}
    >
      <ItemWizard
        categoryId={categoryId as Id<"categories">}
        editingItem={editingItemId as Id<"items"> | null}
        initialData={initialData}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </AdminLayout>
  );
}
