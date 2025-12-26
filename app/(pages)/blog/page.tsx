import { getAllPosts, getPostBySlug } from "@/lib/blog";
import Link from "next/link";
import Image from "next/image";

export default async function BlogPage() {
  const posts = await getAllPosts();
  const guide = await getPostBySlug("singapore-real-estate-transactions");

  // Filter out the featured guide from the posts list
  const filteredPosts = posts.filter(
    (post) => post.slug !== "singapore-real-estate-transactions"
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Featured Guide */}
      {guide && (
        <div className="mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-2 mb-4">
            <span className="inline-block bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              ⭐ Featured Guide
            </span>
          </div>

          <Link href={`/blog/${guide.slug}`} className="group">
            <article className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all hover:border-blue-300">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="relative h-64 md:h-full w-full">
                  <Image
                    src={guide.coverImage}
                    alt={guide.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      {guide.category}
                    </span>
                    <span>{guide.readTime}</span>
                  </div>

                  <h2 className="text-3xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                    {guide.title}
                  </h2>

                  <p className="text-gray-600 mb-4 text-lg">{guide.excerpt}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                    <span className="font-medium">{guide.author}</span>
                    <time>{new Date(guide.date).toLocaleDateString()}</time>
                  </div>

                  <div className="mt-4">
                    <span className="text-blue-600 font-semibold group-hover:gap-2 inline-flex items-center transition-all">
                      Read Guide
                      <span className="group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        </div>
      )}

      {/* Other Guides */}
      <h1 className="text-4xl font-bold mb-8">Useful Guides</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group h-full flex"
          >
            <article className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col w-full">
              <div className="relative h-48 w-full flex-shrink-0">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {post.category}
                  </span>
                  <span>{post.readTime}</span>
                </div>

                <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600">
                  {post.title}
                </h2>

                <p className="text-gray-600 mb-4 flex-grow">{post.excerpt}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                  <span>{post.author}</span>
                  <time>{new Date(post.date).toLocaleDateString()}</time>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
