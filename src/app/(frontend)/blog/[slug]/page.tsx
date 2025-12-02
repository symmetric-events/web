import React from "react";
import { getPayload } from "payload";
import config from "~/payload.config";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { cookies } from "next/headers";
import type { Blog, Category, User } from "~/payload-types";
import type { Metadata } from "next";

// Simple Lexical content renderer
function LexicalContent({ content }: { content: any }) {
  if (!content?.root?.children) {
    return null;
  }

  const renderNode = (node: any, index: number): React.ReactNode => {
    if (!node) return null;

    switch (node.type) {
      case "heading":
        const level = node.format || 1;
        const headingProps = { key: index, className: "mb-4 font-bold" };
        const headingContent = node.children?.map((child: any, i: number) =>
          renderNode(child, i),
        );
        if (level === 1) return <h1 {...headingProps}>{headingContent}</h1>;
        if (level === 2) return <h2 {...headingProps}>{headingContent}</h2>;
        if (level === 3) return <h3 {...headingProps}>{headingContent}</h3>;
        if (level === 4) return <h4 {...headingProps}>{headingContent}</h4>;
        if (level === 5) return <h5 {...headingProps}>{headingContent}</h5>;
        return <h6 {...headingProps}>{headingContent}</h6>;

      case "paragraph":
        return (
          <p key={index} className="mb-4 leading-relaxed">
            {node.children?.map((child: any, i: number) =>
              renderNode(child, i),
            )}
          </p>
        );

      case "text":
        if (node.format === 1) {
          // Bold
          return <strong key={index}>{node.text}</strong>;
        }
        return <span key={index}>{node.text}</span>;

      case "list":
        const ListTag = node.listType === "number" ? "ol" : "ul";
        return (
          <ListTag key={index} className="mb-4 ml-6 list-disc">
            {node.children?.map((child: any, i: number) =>
              renderNode(child, i),
            )}
          </ListTag>
        );

      case "listitem":
        return (
          <li key={index} className="mb-2">
            {node.children?.map((child: any, i: number) =>
              renderNode(child, i),
            )}
          </li>
        );

      default:
        if (node.children) {
          return (
            <div key={index}>
              {node.children.map((child: any, i: number) =>
                renderNode(child, i),
              )}
            </div>
          );
        }
        return null;
    }
  };

  return (
    <div className="prose prose-lg prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl max-w-none">
      {content.root.children.map((node: any, index: number) =>
        renderNode(node, index),
      )}
    </div>
  );
}

interface BlogPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });

  const blogRes = await payload.find({
    collection: "blog",
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  const blog = blogRes.docs[0] as Blog | undefined;

  if (!blog) {
    return {
      title: "Blog Post Not Found",
    };
  }

  return {
    title: blog.seo?.metaTitle || blog.title,
    description: blog.seo?.metaDescription || blog.excerpt,
    openGraph: {
      title: blog.seo?.metaTitle || blog.title,
      description: blog.seo?.metaDescription || blog.excerpt || undefined,
      images: blog.seo?.ogImageUrl || blog.featuredImageUrl || undefined,
      url: blog.seo?.canonicalUrl || undefined,
    },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });

  const blogRes = await payload.find({
    collection: "blog",
    where: {
      slug: {
        equals: slug,
      },
    },
    depth: 2,
    limit: 1,
  });

  const blog = blogRes.docs[0] as Blog | undefined;

  if (!blog) {
    notFound();
  }

  // Check if user is authenticated by checking for Payload auth cookie
  let isAuthenticated = false;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("payload-token");
    isAuthenticated = !!token?.value;
  } catch {
    // User is not authenticated
    isAuthenticated = false;
  }

  // Resolve featured image
  let featuredImageUrl = blog.featuredImageUrl;
  if (!featuredImageUrl && blog.featuredImage) {
    if (typeof blog.featuredImage === "object" && blog.featuredImage.url) {
      featuredImageUrl = blog.featuredImage.url;
    }
  }

  const publishedDate = blog.publishedAt || blog.createdAt;

  return (
    <article className="min-h-screen pb-20">
      {/* Header / Hero */}
      <header className="bg-gray-50 pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-5">
          {/* Edit Button - Only show if authenticated */}
          {isAuthenticated && (
            <div className="absolute right-10 flex">
              <Link
                href={`/admin/collections/blog/${blog.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m5 16l-1 4l4-1L19.586 7.414a2 2 0 0 0 0-2.828l-.172-.172a2 2 0 0 0-2.828 0zM15 6l3 3m-5 11h8"
                  />
                </svg>
                Edit in Admin
              </Link>
            </div>
          )}

          {/* Categories */}
          <div className="mb-6 flex flex-wrap gap-2">
            {blog.categories?.map((cat) => {
              if (typeof cat === "object") {
                return (
                  <span
                    key={cat.id}
                    className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700"
                  >
                    {(cat as Category).name}
                  </span>
                );
              }
              return null;
            })}
          </div>

          <h1 className="mb-6 text-4xl leading-tight font-bold text-gray-900 md:text-5xl lg:text-6xl">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-gray-400" />
              <time dateTime={publishedDate}>
                {format(new Date(publishedDate), "MMMM d, yyyy")}
              </time>
            </div>
            {blog.readingTime && (
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-gray-400" />
                <span>{blog.readingTime} read</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {featuredImageUrl && (
        <div className="mx-auto -mt-8 max-w-5xl px-5 md:-mt-12">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl shadow-xl">
            <Image
              src={featuredImageUrl}
              alt={blog.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mx-auto max-w-3xl px-5 pt-16">
        {/* Excerpt */}
        {blog.excerpt && (
          <div className="mb-10 text-xl leading-relaxed font-medium text-gray-600">
            {blog.excerpt}
          </div>
        )}

        {/* Main Content */}
        {blog.content && typeof blog.content === "object" && (
          <LexicalContent content={blog.content} />
        )}

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-16 border-t border-gray-100 pt-8">
            <h3 className="mb-4 text-sm font-bold tracking-wider text-gray-500 uppercase">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-12 border-t border-gray-100 pt-8">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 font-medium text-blue-600 transition-colors hover:text-blue-800"
          >
            ← Back to all articles
          </Link>
        </div>
      </div>
    </article>
  );
}
