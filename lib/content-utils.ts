import { getBuildSafePrismaClient } from '@/lib/prisma'
import { contentParser, ParsedContent } from './content-parser'

export interface EnhancedBlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string | null
  author: string
  publishDate: string
  updatedDate: string
  tags: string[]
  template?: string | null
  theme?: string | null
  status: 'draft' | 'published'
  metadata?: Record<string, any>
  source: 'admin' | 'file'
}

/**
 * Get all blog posts from both admin interface and file-based content
 */
export async function getAllBlogPosts(includeUnpublished: boolean = false): Promise<EnhancedBlogPost[]> {
  // Get posts from database (includes both admin-created and synced file-based content)
  const prisma = await getBuildSafePrismaClient()
  const dbPosts = await prisma.blogPost.findMany({
    where: includeUnpublished ? {} : { status: 'PUBLISHED' },
    include: {
      tags: true,
    },
    orderBy: { publishDate: 'desc' },
  })

  // Transform to enhanced format
  const enhancedPosts: EnhancedBlogPost[] = dbPosts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    author: post.authorName || post.authorEmail,
    publishDate: post.publishDate?.toISOString() || post.createdAt.toISOString(),
    updatedDate: post.updatedAt.toISOString(),
    tags: post.tags.map(tag => tag.name),
    template: post.template,
    theme: post.theme,
    status: post.status === 'PUBLISHED' ? 'published' : 'draft',
    metadata: post.metadata ? JSON.parse(post.metadata) : {},
    source: 'admin' // Since these are all from database, we assume admin unless we add a source field
  }))

  return enhancedPosts
}

/**
 * Get a single blog post by slug from database
 */
export async function getBlogPostBySlug(slug: string, includeUnpublished: boolean = false): Promise<EnhancedBlogPost | null> {
  const prisma = await getBuildSafePrismaClient()
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      tags: true,
    },
  })

  if (!post) return null

  // Check if published (unless including unpublished)
  if (!includeUnpublished && post.status !== 'PUBLISHED') {
    return null
  }

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    author: post.authorName || post.authorEmail,
    publishDate: post.publishDate?.toISOString() || post.createdAt.toISOString(),
    updatedDate: post.updatedAt.toISOString(),
    tags: post.tags.map(tag => tag.name),
    template: post.template,
    theme: post.theme,
    status: post.status === 'PUBLISHED' ? 'published' : 'draft',
    metadata: post.metadata ? JSON.parse(post.metadata) : {},
    source: 'admin'
  }
}

/**
 * Check if content sync is needed (useful for development)
 */
export async function checkContentSyncStatus(): Promise<{
  needsSync: boolean
  fileCount: number
  dbCount: number
  lastSync?: Date
}> {
  try {
    // Load file-based content
    const fileContent = await contentParser.loadContent('blog', { 
      contentDir: 'content/blog',
      processLiquid: false, 
      validateSchema: true 
    })

    // Get database post count
    const prisma = await getBuildSafePrismaClient()
    const dbCount = await prisma.blogPost.count()

    // Simple check: if file count > db count, might need sync
    // In reality, you'd want more sophisticated tracking
    const needsSync = fileContent.length > 0

    return {
      needsSync,
      fileCount: fileContent.length,
      dbCount,
      // lastSync would come from a metadata table in a real implementation
    }
  } catch (error) {
    console.error('Error checking content sync status:', error)
    return {
      needsSync: false,
      fileCount: 0,
      dbCount: 0
    }
  }
}

/**
 * Auto-sync content in development mode
 */
export async function autoSyncContentInDev(): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    const status = await checkContentSyncStatus()
    
    if (status.needsSync && status.fileCount > 0) {
      console.log('📝 Auto-syncing file-based content in development mode...')
      try {
        const { syncContentToDatabase } = await import('./content-parser')
        await syncContentToDatabase('blog')
        console.log('✅ Content auto-sync completed')
      } catch (error) {
        console.warn('⚠️ Content auto-sync failed:', error)
      }
    }
  }
}

/**
 * Get content source info for debugging
 */
export function getContentSourceInfo(post: EnhancedBlogPost): string {
  const sourceIcon = post.source === 'admin' ? '👤' : '📄'
  return `${sourceIcon} ${post.source === 'admin' ? 'Admin Created' : 'File-Based'}`
} 