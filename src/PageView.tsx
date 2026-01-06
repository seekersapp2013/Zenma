import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

interface PageViewProps {
  slug: string;
}

export function PageView({ slug }: PageViewProps) {
  const page = useQuery(api.pages.getPageBySlug, { slug });

  if (page === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (page === null) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 text-lg">
          The page "/{slug}" could not be found or is not published.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{page.title}</h1>
          {page.description && (
            <p className="text-xl text-gray-600 mb-4">{page.description}</p>
          )}
          {page.author && (
            <div className="text-sm text-gray-500">
              By {page.author.name || page.author.email} • {new Date(page._creationTime).toLocaleDateString()}
            </div>
          )}
        </header>

        <div className="space-y-6">
          {page.contentBlocks.map((block) => (
            <div key={block._id}>
              <ContentBlock block={block} />
            </div>
          ))}
        </div>

        {page.contentBlocks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            This page doesn't have any content yet.
          </div>
        )}
      </article>
    </div>
  );
}

function ContentBlock({ block }: any) {
  switch (block.type) {
    case "text":
      return (
        <div className="prose max-w-none">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {block.content}
          </p>
        </div>
      );
    case "image":
      return (
        <div className="text-center">
          <img
            src={block.content}
            alt="Content"
            className="max-w-full h-auto rounded-lg shadow-md"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextElement) nextElement.style.display = 'block';
            }}
          />
          <div style={{ display: 'none' }} className="text-red-500 p-4 border border-red-300 rounded-lg">
            Failed to load image
          </div>
        </div>
      );
    case "video":
      return (
        <div className="text-center">
          <video
            src={block.content}
            controls
            className="max-w-full h-auto rounded-lg shadow-md"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextElement) nextElement.style.display = 'block';
            }}
          />
          <div style={{ display: 'none' }} className="text-red-500 p-4 border border-red-300 rounded-lg">
            Failed to load video
          </div>
        </div>
      );
    default:
      return <div>Unknown content type</div>;
  }
}
