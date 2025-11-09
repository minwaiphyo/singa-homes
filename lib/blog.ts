import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

// Define the path to your blogs directory
const blogsDirectory = path.join(process.cwd(), 'content/blogs');

// Define the blog post interface
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: 'buying' | 'selling' | 'general';
  image: string;
  featured: boolean;
  content: string;
}

/**
 * Get all blog posts
 * @returns Array of all blog posts sorted by date (newest first)
 */
export function getAllBlogs(): BlogPost[] {
  // Check if directory exists
  if (!fs.existsSync(blogsDirectory)) {
    console.warn('Blogs directory does not exist:', blogsDirectory);
    return [];
  }

  // Get all .md files in the directory
  const fileNames = fs.readdirSync(blogsDirectory);
  
  const blogs = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map((fileName) => {
      // Get the slug from filename (remove .md)
      const slug = fileName.replace(/\.md$/, '');
      
      // Read the file
      const fullPath = path.join(blogsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      // Parse frontmatter and content
      const { data, content } = matter(fileContents);

      // Convert markdown content to HTML
      const htmlContent = marked(content);

      return {
        slug,
        title: data.title || 'Untitled',
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        author: data.author || 'Anonymous',
        category: data.category || 'general',
        image: data.image || '/images/blogs/default.jpg',
        featured: data.featured || false,
        content: htmlContent as string,
      };
    });

  // Sort by date (newest first)
  return blogs.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Get a single blog post by slug
 * @param slug - The slug of the blog post (filename without .md)
 * @returns Blog post or null if not found
 */
export function getBlogBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(blogsDirectory, `${slug}.md`);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.warn('Blog not found:', slug);
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Convert markdown content to HTML
    const htmlContent = marked(content);

    return {
      slug,
      title: data.title || 'Untitled',
      description: data.description || '',
      date: data.date || new Date().toISOString(),
      author: data.author || 'Anonymous',
      category: data.category || 'general',
      image: data.image || '/images/blogs/default.jpg',
      featured: data.featured || false,
      content: htmlContent as string,
    };
  } catch (error) {
    console.error('Error reading blog post:', slug, error);
    return null;
  }
}

/**
 * Get only featured blog posts
 * @returns Array of featured blog posts
 */
export function getFeaturedBlogs(): BlogPost[] {
  const allBlogs = getAllBlogs();
  return allBlogs.filter(blog => blog.featured);
}

/**
 * Get blog posts by category
 * @param category - The category to filter by
 * @returns Array of blog posts in the specified category
 */
export function getBlogsByCategory(category: 'buying' | 'selling' | 'general'): BlogPost[] {
  const allBlogs = getAllBlogs();
  return allBlogs.filter(blog => blog.category === category);
}

/**
 * Get all unique categories
 * @returns Array of unique categories
 */
export function getAllCategories(): string[] {
  const allBlogs = getAllBlogs();
  const categories = allBlogs.map(blog => blog.category);
  return Array.from(new Set(categories));
}

/**
 * Search blogs by keyword in title or description
 * @param keyword - The keyword to search for
 * @returns Array of matching blog posts
 */
export function searchBlogs(keyword: string): BlogPost[] {
  const allBlogs = getAllBlogs();
  const lowerKeyword = keyword.toLowerCase();
  
  return allBlogs.filter(blog => 
    blog.title.toLowerCase().includes(lowerKeyword) ||
    blog.description.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Get recent blog posts
 * @param limit - Number of posts to return
 * @returns Array of recent blog posts
 */
export function getRecentBlogs(limit: number = 3): BlogPost[] {
  const allBlogs = getAllBlogs();
  return allBlogs.slice(0, limit);
}