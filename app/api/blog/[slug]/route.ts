import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/blog/[slug] - Get a single blog post by slug
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        tags: true,
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Only show published posts to non-authenticated users
    const session = await getSession(request as any)
    if (post.status !== 'PUBLISHED' && !session) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        author: post.authorName || post.authorEmail,
        publishDate: post.publishDate?.toISOString(),
        updatedDate: post.updatedAt.toISOString(),
        tags: post.tags.map((tag: any) => tag.name),
        template: post.template,
        theme: post.theme,
        status: post.status,
        metadata: post.metadata ? JSON.parse(post.metadata) : {},
      },
    })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}

// PUT /api/blog/[slug] - Update a blog post (authenticated)
export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getSession(request as any)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = params
    const body = await request.json()
    const { title, content, excerpt, tags, template, theme, status, metadata } = body

    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
      include: { tags: true },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // All authenticated users can edit posts (simplified for Cloudflare Access)
    // Authorization check simplified since Cloudflare Access handles user authentication

    // Handle tags
    let tagConnections = []
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: {
            name: tagName,
            slug: tagName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
          },
        })
        tagConnections.push({ id: tag.id })
      }
    }

    // Update the post
    const updatedPost = await prisma.blogPost.update({
      where: { slug },
      data: {
        title: title || existingPost.title,
        content: content || existingPost.content,
        excerpt: excerpt || existingPost.excerpt,
        template: template || existingPost.template,
        theme: theme || existingPost.theme,
        status: status || existingPost.status,
        publishDate: status === 'PUBLISHED' && !existingPost.publishDate ? new Date() : existingPost.publishDate,
        metadata: metadata ? JSON.stringify(metadata) : existingPost.metadata,
        tags: {
          set: tagConnections,
        },
      },
      include: {
        tags: true,
      },
    })

    return NextResponse.json({
      post: {
        id: updatedPost.id,
        title: updatedPost.title,
        slug: updatedPost.slug,
        content: updatedPost.content,
        excerpt: updatedPost.excerpt,
        author: updatedPost.authorName || updatedPost.authorEmail,
        publishDate: updatedPost.publishDate?.toISOString(),
        updatedDate: updatedPost.updatedAt.toISOString(),
        tags: updatedPost.tags.map((tag: any) => tag.name),
        template: updatedPost.template,
        theme: updatedPost.theme,
        status: updatedPost.status,
        metadata: updatedPost.metadata ? JSON.parse(updatedPost.metadata) : {},
      },
    })
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

// DELETE /api/blog/[slug] - Delete a blog post (authenticated)
export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getSession(request as any)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = params

    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // All authenticated users can delete posts (simplified for Cloudflare Access)
    // Authorization check simplified since Cloudflare Access handles user authentication

    await prisma.blogPost.delete({
      where: { slug },
    })

    return NextResponse.json({
      message: 'Blog post deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}
