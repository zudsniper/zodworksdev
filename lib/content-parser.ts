import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { blogEngine } from './liquid-engine'
import { prisma } from './prisma'

export interface ParsedContent {
  frontmatter: {
    title: string
    description?: string
    excerpt?: string
    tags?: string[]
    author?: string
    publishDate?: string
    status?: 'draft' | 'published'
    template?: string
    theme?: string
    slug?: string
    metadata?: Record<string, any>
  }
  content: string
  compiledContent?: string
  filepath: string
  filename: string
}

export interface ContentLoaderOptions {
  contentDir: string
  processLiquid?: boolean
  validateSchema?: boolean
  syncToDatabase?: boolean
}

export class ContentParser {
  private contentDirs: Map<string, string> = new Map()

  constructor() {
    // Default content directories
    this.contentDirs.set('blog', path.join(process.cwd(), 'content', 'blog'))
    this.contentDirs.set('projects', path.join(process.cwd(), 'content', 'projects'))
  }

  /**
   * Parse a single markdown file with frontmatter
   */
  async parseFile(filepath: string, options: { processLiquid?: boolean } = {}): Promise<ParsedContent> {
    if (!fs.existsSync(filepath)) {
      throw new Error(`File not found: ${filepath}`)
    }

    const fileContent = fs.readFileSync(filepath, 'utf8')
    const { data: frontmatter, content } = matter(fileContent)

    const filename = path.basename(filepath, '.md')
    const slug = frontmatter.slug || this.generateSlug(filename)

    let compiledContent: string | undefined

    // Process Liquid syntax if enabled
    if (options.processLiquid && content.includes('{%') || content.includes('{{')) {
      try {
        const liquidContext = {
          frontmatter,
          site: {
            title: 'jason mcelhenney | software dev & ai tinkerer',
            description: 'portfolio and blog',
            url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          }
        }
        compiledContent = await blogEngine.previewPost(content, liquidContext)
      } catch (error) {
        console.warn(`Failed to compile Liquid in ${filepath}:`, error)
        compiledContent = content // Fallback to original content
      }
    }

    return {
      frontmatter: {
        title: frontmatter.title || filename,
        description: frontmatter.description,
        excerpt: frontmatter.excerpt,
        tags: frontmatter.tags || [],
        author: frontmatter.author,
        publishDate: frontmatter.publishDate,
        status: frontmatter.status || 'draft',
        template: frontmatter.template || 'post',
        theme: frontmatter.theme || 'default',
        slug,
        metadata: frontmatter.metadata || {}
      },
      content,
      compiledContent,
      filepath,
      filename
    }
  }

  /**
   * Load all content files from a directory
   */
  async loadContent(type: 'blog' | 'projects' | string, options: ContentLoaderOptions = {}): Promise<ParsedContent[]> {
    const contentDir = this.contentDirs.get(type) || options.contentDir
    
    if (!contentDir || !fs.existsSync(contentDir)) {
      console.warn(`Content directory not found: ${contentDir}`)
      return []
    }

    const files = fs.readdirSync(contentDir)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(contentDir, file))

    const parsedContent: ParsedContent[] = []

    for (const filepath of files) {
      try {
        const content = await this.parseFile(filepath, {
          processLiquid: options.processLiquid ?? true
        })
        
        if (options.validateSchema && !this.validateContent(content)) {
          console.warn(`Invalid content schema in ${filepath}`)
          continue
        }

        parsedContent.push(content)
      } catch (error) {
        console.error(`Error parsing ${filepath}:`, error)
      }
    }

    return parsedContent
  }

  /**
   * Sync parsed content to Prisma database
   */
  async syncToDatabase(parsedContent: ParsedContent[], authorEmail: string = 'admin@zodworks.dev'): Promise<void> {
    // Find or create author
    const author = await prisma.user.findUnique({
      where: { email: authorEmail }
    })

    if (!author) {
      throw new Error(`Author not found: ${authorEmail}`)
    }

    for (const content of parsedContent) {
      try {
        const { frontmatter, content: rawContent, compiledContent } = content

        // Check if post already exists
        const existingPost = await prisma.blogPost.findUnique({
          where: { slug: frontmatter.slug! }
        })

        const postData = {
          title: frontmatter.title,
          slug: frontmatter.slug!,
          content: compiledContent || rawContent,
          excerpt: frontmatter.excerpt,
          template: frontmatter.template || 'post',
          theme: frontmatter.theme || 'default',
          status: frontmatter.status === 'published' ? 'PUBLISHED' as const : 'DRAFT' as const,
          publishDate: frontmatter.publishDate ? new Date(frontmatter.publishDate) : null,
          metadata: frontmatter.metadata ? JSON.stringify(frontmatter.metadata) : null,
          authorId: author.id,
        }

        if (existingPost) {
          // Update existing post
          await prisma.blogPost.update({
            where: { id: existingPost.id },
            data: {
              ...postData,
              // Connect tags
              tags: frontmatter.tags && frontmatter.tags.length > 0 ? {
                connectOrCreate: frontmatter.tags.map(tagName => ({
                  where: { name: tagName },
                  create: {
                    name: tagName,
                    slug: this.generateSlug(tagName)
                  }
                }))
              } : undefined
            }
          })
          console.log(`Updated blog post: ${frontmatter.title}`)
        } else {
          // Create new post
          await prisma.blogPost.create({
            data: {
              ...postData,
              // Connect tags
              tags: frontmatter.tags && frontmatter.tags.length > 0 ? {
                connectOrCreate: frontmatter.tags.map(tagName => ({
                  where: { name: tagName },
                  create: {
                    name: tagName,
                    slug: this.generateSlug(tagName)
                  }
                }))
              } : undefined
            }
          })
          console.log(`Created blog post: ${frontmatter.title}`)
        }
      } catch (error) {
        console.error(`Failed to sync ${content.filename} to database:`, error)
      }
    }
  }

  /**
   * Load and sync content from files to database
   */
  async loadAndSync(type: 'blog' | 'projects' = 'blog', authorEmail: string = 'admin@zodworks.dev'): Promise<void> {
    const content = await this.loadContent(type, {
      processLiquid: true,
      validateSchema: true,
      syncToDatabase: true
    })

    if (content.length > 0) {
      await this.syncToDatabase(content, authorEmail)
      console.log(`Synced ${content.length} ${type} posts to database`)
    } else {
      console.log(`No ${type} content found to sync`)
    }
  }

  /**
   * Watch content directory for changes (for development)
   */
  watchContent(type: 'blog' | 'projects', callback: (content: ParsedContent[]) => void): void {
    const contentDir = this.contentDirs.get(type)
    if (!contentDir || !fs.existsSync(contentDir)) return

    fs.watch(contentDir, async (eventType, filename) => {
      if (filename && filename.endsWith('.md')) {
        console.log(`Content file ${eventType}: ${filename}`)
        const content = await this.loadContent(type, { processLiquid: true })
        callback(content)
      }
    })
  }

  /**
   * Validate content structure
   */
  private validateContent(content: ParsedContent): boolean {
    const { frontmatter } = content
    
    // Required fields
    if (!frontmatter.title) {
      console.error('Missing required field: title')
      return false
    }

    // Validate status
    if (frontmatter.status && !['draft', 'published'].includes(frontmatter.status)) {
      console.error('Invalid status. Must be "draft" or "published"')
      return false
    }

    // Validate publishDate format
    if (frontmatter.publishDate && isNaN(Date.parse(frontmatter.publishDate))) {
      console.error('Invalid publishDate format. Use ISO date string')
      return false
    }

    return true
  }

  /**
   * Generate URL-friendly slug from text
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
}

// Export singleton instance
export const contentParser = new ContentParser()

// Utility functions for common operations
export async function loadBlogContent(): Promise<ParsedContent[]> {
  return contentParser.loadContent('blog', { processLiquid: true, validateSchema: true })
}

export async function loadProjectContent(): Promise<ParsedContent[]> {
  return contentParser.loadContent('projects', { processLiquid: true, validateSchema: true })
}

export async function syncContentToDatabase(type: 'blog' | 'projects' = 'blog'): Promise<void> {
  return contentParser.loadAndSync(type)
} 