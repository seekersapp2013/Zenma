import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function ActorsManagement() {
  const actors = useQuery(api.actors.getActors);
  const [showForm, setShowForm] = useState(false);
  const [editingActor, setEditingActor] = useState<any>(null);

  const handleAddActor = () => {
    setEditingActor(null);
    setShowForm(true);
  };

  const handleEditActor = (actor: any) => {
    setEditingActor(actor);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingActor(null);
  };

  if (actors === undefined) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Actors Management</h1>
          <p className="text-gray-600">Manage actors and their information</p>
        </div>
        <button
          onClick={handleAddActor}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Actor
        </button>
      </div>

      {showForm && (
        <ActorForm
          actor={editingActor}
          onClose={handleCloseForm}
        />
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Career
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Movies
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {actors.map((actor) => (
                <ActorRow
                  key={actor._id}
                  actor={actor}
                  onEdit={() => handleEditActor(actor)}
                />
              ))}
            </tbody>
          </table>
        </div>
        
        {actors.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No actors found. Add your first actor!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActorRow({ actor, onEdit }: { actor: any; onEdit: () => void }) {
  const deleteActor = useMutation(api.actors.deleteActor);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this actor?")) return;
    
    setIsDeleting(true);
    try {
      await deleteActor({ id: actor._id });
    } catch (error) {
      console.error("Failed to delete actor:", error);
      alert("Failed to delete actor");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {actor.imageUrl ? (
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={actor.imageUrl}
                alt={actor.name}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {actor.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{actor.name}</div>
            <div className="text-sm text-gray-500">{actor.placeOfBirth}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {actor.career}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {actor.age || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {actor.totalMovies || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-900 mr-4"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-900 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </td>
    </tr>
  );
}

function ActorForm({ actor, onClose }: { actor?: any; onClose: () => void }) {
  const createActor = useMutation(api.actors.createActor);
  const updateActor = useMutation(api.actors.updateActor);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: actor?.name || "",
    career: actor?.career || "",
    height: actor?.height || "",
    dateOfBirth: actor?.dateOfBirth || "",
    placeOfBirth: actor?.placeOfBirth || "",
    age: actor?.age || "",
    zodiac: actor?.zodiac || "",
    genres: actor?.genres?.join(", ") || "",
    totalMovies: actor?.totalMovies || "",
    firstMovie: actor?.firstMovie || "",
    lastMovie: actor?.lastMovie || "",
    bestMovie: actor?.bestMovie || "",
    biography: actor?.biography || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageId = actor?.imageId;

      // Upload new image if selected
      if (imageFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        const { storageId } = await result.json();
        imageId = storageId;
      }

      const actorData = {
        name: formData.name,
        career: formData.career,
        height: formData.height || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        placeOfBirth: formData.placeOfBirth || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        zodiac: formData.zodiac || undefined,
        genres: formData.genres.split(",").map(g => g.trim()).filter(g => g),
        totalMovies: formData.totalMovies ? parseInt(formData.totalMovies) : undefined,
        firstMovie: formData.firstMovie || undefined,
        lastMovie: formData.lastMovie || undefined,
        bestMovie: formData.bestMovie || undefined,
        imageId: imageId || undefined,
        biography: formData.biography || undefined,
      };

      if (actor) {
        await updateActor({ id: actor._id, ...actorData });
      } else {
        await createActor(actorData);
      }

      onClose();
    } catch (error) {
      console.error("Failed to save actor:", error);
      alert("Failed to save actor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {actor ? "Edit Actor" : "Add New Actor"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Career *
              </label>
              <input
                type="text"
                name="career"
                value={formData.career}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height
              </label>
              <input
                type="text"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                placeholder="e.g., 1.65 m"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="text"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                placeholder="e.g., July 12, 1978"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Place of Birth
              </label>
              <input
                type="text"
                name="placeOfBirth"
                value={formData.placeOfBirth}
                onChange={handleInputChange}
                placeholder="e.g., San Antonio, Texas, United States"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zodiac
              </label>
              <input
                type="text"
                name="zodiac"
                value={formData.zodiac}
                onChange={handleInputChange}
                placeholder="e.g., Cancer"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Movies
              </label>
              <input
                type="number"
                name="totalMovies"
                value={formData.totalMovies}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Genres (comma-separated)
            </label>
            <input
              type="text"
              name="genres"
              value={formData.genres}
              onChange={handleInputChange}
              placeholder="e.g., Action, Thriller, Drama"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Movie
              </label>
              <input
                type="text"
                name="firstMovie"
                value={formData.firstMovie}
                onChange={handleInputChange}
                placeholder="e.g., Girl Fight (2000)"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Movie
              </label>
              <input
                type="text"
                name="lastMovie"
                value={formData.lastMovie}
                onChange={handleInputChange}
                placeholder="e.g., Fast and the Furious 10 (2023)"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Best Movie
              </label>
              <input
                type="text"
                name="bestMovie"
                value={formData.bestMovie}
                onChange={handleInputChange}
                placeholder="e.g., Avatar"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {actor?.imageUrl && (
              <div className="mt-2">
                <img
                  src={actor.imageUrl}
                  alt="Current"
                  className="h-20 w-20 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Biography
            </label>
            <textarea
              name="biography"
              value={formData.biography}
              onChange={handleInputChange}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : (actor ? "Update" : "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}