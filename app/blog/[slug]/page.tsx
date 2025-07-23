import { notFound } from 'next/navigation'
import { blogEngine } from '@/lib/liquid-engine'
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/content-utils'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug)

  if (!post) {
    return {
      title: 'Post not found | jason mcelhenney',
    }
  }

  return {
    title: `${post.title} | jason mcelhenney`,
    description: post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, ''),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, ''),
      type: 'article',
      publishedTime: post.publishDate,
      modifiedTime: post.updatedDate,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, ''),
    },
  }
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts(false)

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: Props) {
  const blogPost = await getBlogPostBySlug(params.slug)

  if (!blogPost) {
    notFound()
  }

  try {
    const renderedContent = await blogEngine.renderPost(blogPost, blogPost.theme || 'default')
    
    return (
      <div 
        className="liquid-content"
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    )
  } catch (error) {
    console.error('Error rendering blog post with Liquid:', error)
    
    // Fallback to React rendering if Liquid fails
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <article className="prose prose-lg dark:prose-invert">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{blogPost.title}</h1>
            <div className="text-muted-foreground mb-4">
              <time dateTime={blogPost.publishDate}>
                {new Date(blogPost.publishDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <span> • by {blogPost.author}</span>
            </div>
            {blogPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blogPost.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-2 py-1 bg-muted rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>
          <div 
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
          />
        </article>
      </div>
    )
  }
}
