import { getAllPosts } from '@/lib/blog';
import Link from 'next/link';
import Image from 'next/image';

export default async function BlogPage() {
  const posts = await getAllPosts(); // Add await

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Guides</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link 
            key={post.slug} 
            href={`/blog/${post.slug}`}
            className="group"
          >
            <article className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {post.category}
                  </span>
                  <span>{post.readTime}</span>
                </div>
                
                <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600">
                  {post.title}
                </h2>
                
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
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