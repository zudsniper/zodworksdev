import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateTagSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  color: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            slug: true,
          }
        },
        _count: {
          select: { posts: true }
        }
      }
    })

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Error fetching tag:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tag' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(request as any)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { name, slug, color } = updateTagSchema.parse(body)

    const existingTag = await prisma.tag.findUnique({
      where: { id }
    })

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    // Generate slug if name is being updated but slug is not provided
    const updatedSlug = slug || (name ? name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() : existingTag.slug)

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name: name || existingTag.name,
        slug: updatedSlug,
        color: color !== undefined ? color : existingTag.color,
      }
    })

    return NextResponse.json(tag)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating tag:', error)
    return NextResponse.json(
      { error: 'Failed to update tag' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(request as any)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const existingTag = await prisma.tag.findUnique({
      where: { id }
    })

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    await prisma.tag.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Tag deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    )
  }
}
