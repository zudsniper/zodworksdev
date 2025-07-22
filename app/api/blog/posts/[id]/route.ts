import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/blog/posts/[id] - Get a single blog post by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const post = await prisma.blogPost.findUnique({
      where: { id },
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

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}

// PUT /api/blog/posts/[id] - Update a blog post
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { title, content, excerpt, tags, template, theme, status, metadata, slug, publishDate } = body

    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Check if user owns this post or is admin
    if (existingPost.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to update this post' },
        { status: 403 }
      )
    }

    // Handle tags - expect array of tag IDs
    const tagConnections = []
    if (tags && Array.isArray(tags)) {
      for (const tagId of tags) {
        tagConnections.push({ id: tagId })
      }
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: title || existingPost.title,
        slug: slug || existingPost.slug,
        content: content || existingPost.content,
        excerpt: excerpt || existingPost.excerpt,
        template: template || existingPost.template,
        theme: theme || existingPost.theme,
        status: status || existingPost.status,
        publishDate: status === 'PUBLISHED' && publishDate ? new Date(publishDate) : (status === 'PUBLISHED' && !existingPost.publishDate ? new Date() : existingPost.publishDate),
        metadata: metadata ? JSON.stringify(metadata) : existingPost.metadata,
        tags: tags ? {
          set: tagConnections,
        } : undefined,
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

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

// DELETE /api/blog/posts/[id] - Delete a blog post
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params

    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Check if user owns this post or is admin
    if (existingPost.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to delete this post' },
        { status: 403 }
      )
    }

    await prisma.blogPost.delete({
      where: { id },
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
