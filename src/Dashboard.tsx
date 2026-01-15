import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { PageEditor } from "./PageEditor";

interface DashboardProps {
  navigate: (path: string) => void;
}

export function Dashboard({ navigate }: DashboardProps) {
  const pages = useQuery(api.pages.getUserPages);
  const createPage = useMutation(api.pages.createPage);
  const deletePage = useMutation(api.pages.deletePage);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [newPage, setNewPage] = useState({
    slug: "",
    title: "",
    description: "",
  });

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPage.slug || !newPage.title) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const pageId = await createPage({
        slug: newPage.slug,
        title: newPage.title,
        description: newPage.description || undefined,
      });
      toast.success("Page created successfully!");
      setShowCreateForm(false);
      setNewPage({ slug: "", title: "", description: "" });
      setEditingPageId(pageId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create page");
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm("Are you sure you want to delete this page? This action cannot be undone.")) {
      return;
    }

    try {
      await deletePage({ pageId: pageId as any });
      toast.success("Page deleted successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete page");
    }
  };

  if (editingPageId) {
    return (
      <PageEditor 
        pageId={editingPageId as any}
        onBack={() => setEditingPageId(null)}
        navigate={navigate}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Pages</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-[#ff1493] text-white px-4 py-2 rounded-lg hover:bg-[#d91a72] transition-colors"
        >
          Create New Page
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Page</h2>
          <form onSubmit={handleCreatePage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page URL (slug) *
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-1">zenma.com/</span>
                <input
                  type="text"
                  value={newPage.slug}
                  onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                  placeholder="about-us"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff1493]"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Title *
              </label>
              <input
                type="text"
                value={newPage.title}
                onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                placeholder="About Us"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff1493]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newPage.description}
                onChange={(e) => setNewPage({ ...newPage, description: e.target.value })}
                placeholder="A brief description of this page"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff1493]"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[#ff1493] text-white px-4 py-2 rounded-md hover:bg-[#d91a72] transition-colors"
              >
                Create Page
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {pages === undefined ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff1493]"></div>
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No pages created yet</p>
            <p className="text-gray-400">Create your first page to get started</p>
          </div>
        ) : (
          pages.map((page) => (
            <div key={page._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {page.title}
                  </h3>
                  <p className="text-gray-600 mb-2">/{page.slug}</p>
                  {page.description && (
                    <p className="text-gray-500 mb-3">{page.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      Status: {page.isPublished ? (
                        <span className="text-green-600 font-medium">Published</span>
                      ) : (
                        <span className="text-yellow-600 font-medium">Draft</span>
                      )}
                    </span>
                    <span>
                      Created: {new Date(page._creationTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setEditingPageId(page._id)}
                    className="bg-[#ffe5f3] text-[#d91a72] px-3 py-1 rounded hover:bg-[#ffc9e5] transition-colors text-sm"
                  >
                    Edit
                  </button>
                  {page.isPublished && (
                    <button
                      onClick={() => navigate(`/${page.slug}`)}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors text-sm"
                    >
                      View
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePage(page._id)}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
