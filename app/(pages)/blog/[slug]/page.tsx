import { getBlogBySlug } from "@/lib/blog";

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const blog = getBlogBySlug(params.slug); // Reads specific .md file

  return (
    <article>
      <h1>{blog!.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: blog!.content }} />
    </article>
  );
}
