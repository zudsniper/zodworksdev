import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getSession(request as any)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use getPrisma() instead of direct import to ensure proper initialization
    const prisma = getPrisma()

    // Get dashboard statistics
    const [
      totalPosts,
      totalTags,
      publishedPosts,
      recentPosts
    ] = await Promise.all([
      prisma.blogPost.count(),
      prisma.tag.count(),
      prisma.blogPost.count({
        where: { status: 'PUBLISHED' }
      }),
      prisma.blogPost.findMany({
        include: {
          _count: {
            select: { tags: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ])

    return NextResponse.json({
      stats: {
        totalPosts,
        totalTags,
        publishedPosts
      },
      recentPosts: recentPosts.map(post => ({
        id: post.id,
        title: post.title,
        authorName: post.authorName,
        authorEmail: post.authorEmail,
        status: post.status,
        createdAt: post.createdAt.toISOString(),
        tagCount: post._count.tags
      }))
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
} 