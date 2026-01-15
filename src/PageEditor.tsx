import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";

interface PageEditorProps {
  pageId: Id<"pages">;
  onBack: () => void;
  navigate: (path: string) => void;
}

export function PageEditor({ pageId, onBack, navigate }: PageEditorProps) {
  const page = useQuery(api.pages.getPageWithContent, { pageId });
  const updatePage = useMutation(api.pages.updatePage);
  const addContentBlock = useMutation(api.content.addContentBlock);
  const updateContentBlock = useMutation(api.content.updateContentBlock);
  const deleteContentBlock = useMutation(api.content.deleteContentBlock);

  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [newBlockType, setNewBlockType] = useState<"text" | "image" | "video">("text");
  const [newBlockContent, setNewBlockContent] = useState("");
  const [showAddBlock, setShowAddBlock] = useState(false);

  if (!page) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff1493]"></div>
      </div>
    );
  }

  const handleUpdatePage = async (updates: any) => {
    try {
      await updatePage({ pageId, ...updates });
      toast.success("Page updated successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update page");
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockContent.trim()) {
      toast.error("Please enter content for the block");
      return;
    }

    try {
      await addContentBlock({
        pageId,
        type: newBlockType,
        content: newBlockContent,
      });
      setNewBlockContent("");
      setShowAddBlock(false);
      toast.success("Content block added!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add content block");
    }
  };

  const handleUpdateBlock = async (blockId: string, content: string) => {
    try {
      await updateContentBlock({ blockId: blockId as any, content });
      setEditingBlock(null);
      toast.success("Content updated!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update content");
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm("Are you sure you want to delete this content block?")) {
      return;
    }

    try {
      await deleteContentBlock({ blockId: blockId as any });
      toast.success("Content block deleted!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete content block");
    }
  };

  const renderContentBlock = (block: any) => {
    const isEditing = editingBlock === block._id;

    if (isEditing) {
      return (
        <ContentBlockEditor
          block={block}
          onSave={(content: string) => handleUpdateBlock(block._id, content)}
          onCancel={() => setEditingBlock(null)}
        />
      );
    }

    return (
      <div className="group relative">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditingBlock(block._id)}
            className="bg-[#ffe5f3] text-[#d91a72] px-2 py-1 rounded text-xs mr-1 hover:bg-[#ffc9e5]"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteBlock(block._id)}
            className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs hover:bg-red-200"
          >
            Delete
          </button>
        </div>
        <ContentBlockDisplay block={block} />
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-[#ff1493] hover:text-[#d91a72] flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handleUpdatePage({ isPublished: !page.isPublished })}
            className={`px-4 py-2 rounded-lg transition-colors ${
              page.isPublished
                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {page.isPublished ? "Unpublish" : "Publish"}
          </button>
          {page.isPublished && (
            <button
              onClick={() => navigate(`/${page.slug}`)}
              className="bg-[#ffe5f3] text-[#d91a72] px-4 py-2 rounded-lg hover:bg-[#ffc9e5] transition-colors"
            >
              View Page
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{page.title}</h1>
        <p className="text-gray-600 mb-4">/{page.slug}</p>
        {page.description && (
          <p className="text-gray-500">{page.description}</p>
        )}
        <div className="mt-4 text-sm text-gray-500">
          Status: {page.isPublished ? (
            <span className="text-green-600 font-medium">Published</span>
          ) : (
            <span className="text-yellow-600 font-medium">Draft</span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {page.contentBlocks.map((block) => (
          <div key={block._id} className="bg-white rounded-lg shadow-md p-6">
            {renderContentBlock(block)}
          </div>
        ))}

        {showAddBlock ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Add Content Block</h3>
            <form onSubmit={handleAddBlock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <select
                  value={newBlockType}
                  onChange={(e) => setNewBlockType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff1493]"
                >
                  <option value="text">Text</option>
                  <option value="image">Image URL</option>
                  <option value="video">Video URL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                {newBlockType === "text" ? (
                  <textarea
                    value={newBlockContent}
                    onChange={(e) => setNewBlockContent(e.target.value)}
                    placeholder="Enter your text content..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff1493]"
                    rows={4}
                    required
                  />
                ) : (
                  <input
                    type="url"
                    value={newBlockContent}
                    onChange={(e) => setNewBlockContent(e.target.value)}
                    placeholder={`Enter ${newBlockType} URL...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff1493]"
                    required
                  />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-[#ff1493] text-white px-4 py-2 rounded-md hover:bg-[#d91a72] transition-colors"
                >
                  Add Block
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBlock(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setShowAddBlock(true)}
            className="w-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            + Add Content Block
          </button>
        )}
      </div>
    </div>
  );
}

function ContentBlockEditor({ block, onSave, onCancel }: any) {
  const [content, setContent] = useState(block.content);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(content);
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {block.type === "text" ? "Text Content" : `${block.type} URL`}
        </label>
        {block.type === "text" ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff1493]"
            rows={4}
            required
          />
        ) : (
          <input
            type="url"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff1493]"
            required
          />
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-[#ff1493] text-white px-4 py-2 rounded-md hover:bg-[#d91a72] transition-colors"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ContentBlockDisplay({ block }: any) {
  switch (block.type) {
    case "text":
      return (
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap">{block.content}</p>
        </div>
      );
    case "image":
      return (
        <div className="text-center">
          <img
            src={block.content}
            alt="Content"
            className="max-w-full h-auto rounded-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextElement) nextElement.style.display = 'block';
            }}
          />
          <div style={{ display: 'none' }} className="text-red-500 p-4 border border-red-300 rounded-lg">
            Failed to load image: {block.content}
          </div>
        </div>
      );
    case "video":
      return (
        <div className="text-center">
          <video
            src={block.content}
            controls
            className="max-w-full h-auto rounded-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextElement) nextElement.style.display = 'block';
            }}
          />
          <div style={{ display: 'none' }} className="text-red-500 p-4 border border-red-300 rounded-lg">
            Failed to load video: {block.content}
          </div>
        </div>
      );
    default:
      return <div>Unknown content type</div>;
  }
}
