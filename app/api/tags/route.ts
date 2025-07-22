import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTagSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  color: z.string().optional(),
})

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, slug, color } = createTagSchema.parse(body)

    // Generate slug if not provided
    const tagSlug = slug || name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    const tag = await prisma.tag.create({
      data: {
        name,
        slug: tagSlug,
        color,
      }
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating tag:', error)
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    )
  }
}
