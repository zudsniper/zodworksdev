import { NextRequest, NextResponse } from 'next/server'
import { blogEngine } from '@/lib/liquid-engine'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'stats':
        const stats = blogEngine.getCacheStats()
        return NextResponse.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        })

      case 'health':
        const health = blogEngine.getCacheHealth()
        return NextResponse.json({
          success: true,
          data: health,
          timestamp: new Date().toISOString()
        })

      default:
        // Return both stats and health by default
        return NextResponse.json({
          success: true,
          data: {
            stats: blogEngine.getCacheStats(),
            health: blogEngine.getCacheHealth()
          },
          timestamp: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('Cache API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve cache information',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, templatePath } = body

    switch (action) {
      case 'invalidate':
        if (templatePath) {
          blogEngine.invalidateTemplateCache(templatePath)
          return NextResponse.json({
            success: true,
            message: `Cache invalidated for template: ${templatePath}`,
            timestamp: new Date().toISOString()
          })
        } else {
          blogEngine.invalidateAllCaches()
          return NextResponse.json({
            success: true,
            message: 'All caches invalidated',
            timestamp: new Date().toISOString()
          })
        }

      case 'warmup':
        await blogEngine.warmUpCache()
        return NextResponse.json({
          success: true,
          message: 'Cache warmed up successfully',
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action. Supported actions: invalidate, warmup'
          },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Cache API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform cache operation',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const template = searchParams.get('template')

    if (template) {
      blogEngine.invalidateTemplateCache(template)
      return NextResponse.json({
        success: true,
        message: `Cache cleared for template: ${template}`,
        timestamp: new Date().toISOString()
      })
    } else {
      blogEngine.invalidateAllCaches()
      return NextResponse.json({
        success: true,
        message: 'All caches cleared',
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Cache API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear cache',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
} 