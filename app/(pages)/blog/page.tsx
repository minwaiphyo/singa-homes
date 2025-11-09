import { getAllBlogs } from "@/lib/blog";
import Link from "next/link";

export default function BlogListPage() {
  const blogs = getAllBlogs(); // Reads from /content/blogs/*.md

  return (
    <div>
      <h1>All Blogs</h1>
      {blogs.map((blog) => (
        <Link key={blog.slug} href={`/blog/${blog.slug}`}>
          {blog.title}
        </Link>
      ))}
    </div>
  );
}
