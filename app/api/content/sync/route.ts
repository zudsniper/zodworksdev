import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { syncContentToDatabase } from '@/lib/content-parser'

// POST /api/content/sync - Sync file-based content to database
export async function POST(request: Request) {
  try {
    const session = await getSession(request as any)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, allow any authenticated user to sync content
    // You might want to add admin role checking here
    
    const { type } = await request.json().catch(() => ({ type: 'blog' }))
    
    if (!['blog', 'projects'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid content type. Must be "blog" or "projects"' },
        { status: 400 }
      )
    }

    console.log(`Starting content sync for type: ${type}`)
    
    // Sync content from files to database
    await syncContentToDatabase(type as 'blog' | 'projects')
    
    return NextResponse.json({
      message: `Successfully synced ${type} content to database`,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error syncing content:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to sync content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET /api/content/sync - Get sync status and available content
export async function GET(request: Request) {
  try {
    const session = await getSession(request as any)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contentParser } = await import('@/lib/content-parser')
    
    // Load content without syncing to show what's available
    const blogContent = await contentParser.loadContent('blog', { 
      processLiquid: false, 
      validateSchema: true 
    })
    
    const projectContent = await contentParser.loadContent('projects', { 
      processLiquid: false, 
      validateSchema: true 
    })
    
    return NextResponse.json({
      blog: {
        count: blogContent.length,
        files: blogContent.map(c => ({
          filename: c.filename,
          title: c.frontmatter.title,
          status: c.frontmatter.status,
          publishDate: c.frontmatter.publishDate
        }))
      },
      projects: {
        count: projectContent.length,
        files: projectContent.map(c => ({
          filename: c.filename,
          title: c.frontmatter.title,
          status: c.frontmatter.status,
          publishDate: c.frontmatter.publishDate
        }))
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error getting content sync status:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get sync status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 