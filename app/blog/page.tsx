import { blogEngine } from '@/lib/liquid-engine'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | jason mcelhenney',
  description: 'Thoughts on software development, AI, and technology from jason mcelhenney',
  openGraph: {
    title: 'Blog | jason mcelhenney',
    description: 'Thoughts on software development, AI, and technology from jason mcelhenney',
    type: 'website',
  },
}

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      author: { select: { name: true, email: true } },
      tags: true,
    },
    orderBy: { publishDate: 'desc' },
  })

  const blogPosts = posts.map((post: any) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    author: post.author.name || post.author.email,
    publishDate: post.publishDate?.toISOString() || post.createdAt.toISOString(),
    updatedDate: post.updatedAt.toISOString(),
    tags: post.tags.map((tag: any) => tag.name),
    template: post.template,
    theme: post.theme,
    status: post.status as 'draft' | 'published',
    metadata: post.metadata ? JSON.parse(post.metadata) : {},
  }))

  try {
    const renderedContent = await blogEngine.renderPostList(blogPosts, 'default')
    
    return (
      <div 
        className="liquid-content"
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    )
  } catch (error) {
    console.error('Error rendering blog index with Liquid:', error)
    
    // Fallback to React rendering if Liquid fails
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Blog Posts</h1>
          <p className="text-muted-foreground">Thoughts on software development, AI, and technology</p>
        </header>

        {blogPosts.length > 0 ? (
          <div className="space-y-8">
            {blogPosts.map((post) => (
              <article key={post.id} className="border-b border-border pb-8">
                <header className="mb-4">
                  <h2 className="text-2xl font-bold mb-2">
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-accent-orange hover:text-accent-green transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <div className="text-sm text-muted-foreground mb-2">
                    <time dateTime={post.publishDate}>
                      {new Date(post.publishDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                    {post.author && <span> • by {post.author}</span>}
                  </div>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-muted rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </header>
                <div className="prose dark:prose-invert">
                  <p>{post.excerpt || post.content.substring(0, 200).replace(/<[^>]*>/g, '') + '...'}</p>
                </div>
                <footer className="mt-4">
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="text-accent-green hover:text-accent-orange transition-colors font-medium"
                  >
                    Read more →
                  </Link>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blog posts available yet.</p>
            <p>
              <Link 
                href="/#projects" 
                className="text-accent-green hover:text-accent-orange transition-colors"
              >
                Check out my projects instead →
              </Link>
            </p>
          </div>
        )}
      </div>
    )
  }
}
