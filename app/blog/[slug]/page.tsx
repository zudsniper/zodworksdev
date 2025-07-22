import { notFound } from 'next/navigation'
import { blogEngine } from '@/lib/liquid-engine'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    include: {
      author: { select: { name: true, email: true } },
      tags: true,
    },
  })

  if (!post || post.status !== 'PUBLISHED') {
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
      publishedTime: post.publishDate?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name || post.author.email],
      tags: post.tags.map((tag: any) => tag.name),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, ''),
    },
  }
}

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true },
  })

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    include: {
      author: { select: { name: true, email: true } },
      tags: true,
    },
  })

  if (!post || post.status !== 'PUBLISHED') {
    notFound()
  }

  const blogPost = {
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
  }

  try {
    const renderedContent = await blogEngine.renderPost(blogPost, post.theme)
    
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
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="text-muted-foreground mb-4">
              <time dateTime={post.publishDate?.toISOString()}>
                {post.publishDate?.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              {post.author.name && <span> • by {post.author.name}</span>}
            </div>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: any) => (
                  <span 
                    key={tag.name}
                    className="px-2 py-1 bg-muted rounded text-sm"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </header>
          <div 
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    )
  }
}
