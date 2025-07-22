import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { blogEngine } from '@/lib/liquid-engine'

// GET /api/blog - List all published blog posts
export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        tags: true,
      },
      orderBy: {
        publishDate: 'desc',
      },
    })

    return NextResponse.json({
      posts: posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        author: post.author.name || post.author.email,
        publishDate: post.publishDate?.toISOString(),
        updatedDate: post.updatedAt.toISOString(),
        tags: post.tags.map(tag => tag.name),
        template: post.template,
        theme: post.theme,
        status: post.status,
        metadata: post.metadata ? JSON.parse(post.metadata) : {},
      })),
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

// POST /api/blog - Create a new blog post (authenticated)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, excerpt, tags, template, theme, status, metadata, slug: providedSlug, publishDate } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Generate slug from title or use provided slug
    const slug = providedSlug || title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      )
    }

    // Handle tags - expect array of tag IDs
    const tagConnections = []
    if (tags && Array.isArray(tags)) {
      for (const tagId of tags) {
        tagConnections.push({ id: tagId })
      }
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        template: template || 'post',
        theme: theme || 'default',
        status: status || 'DRAFT',
        publishDate: status === 'PUBLISHED' && publishDate ? new Date(publishDate) : (status === 'PUBLISHED' ? new Date() : null),
        authorId: session.user.id,
        metadata: metadata ? JSON.stringify(metadata) : null,
        tags: {
          connect: tagConnections,
        },
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        tags: true,
      },
    })

    return NextResponse.json({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      author: post.author.name || post.author.email,
      publishDate: post.publishDate?.toISOString(),
      updatedDate: post.updatedAt.toISOString(),
      tags: post.tags.map(tag => tag.name),
      template: post.template,
      theme: post.theme,
      status: post.status,
      metadata: post.metadata ? JSON.parse(post.metadata) : {},
    })
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
