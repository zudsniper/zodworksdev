import { Liquid } from 'liquidjs'
import path from 'path'

// Initialize the Liquid template engine
const liquidEngine = new Liquid({
  root: path.join(process.cwd(), 'themes'),
  partials: path.join(process.cwd(), 'themes', 'partials'),
  layouts: path.join(process.cwd(), 'themes', 'layouts'),
  extname: '.liquid',
  cache: process.env.NODE_ENV === 'production',
  strictFilters: true,
  strictVariables: false,
})

// Add custom filters for blog functionality
liquidEngine.registerFilter('date_format', (date: string | Date, format: string) => {
  const d = new Date(date)
  if (format === 'short') {
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }
  if (format === 'long') {
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
  return d.toISOString()
})

liquidEngine.registerFilter('excerpt', (content: string, length: number = 150) => {
  if (!content) return ''
  const text = content.replace(/<[^>]*>/g, '') // Strip HTML
  if (text.length <= length) return text
  return text.substring(0, length).trim() + '...'
})

liquidEngine.registerFilter('reading_time', (content: string) => {
  if (!content) return '0 min read'
  const words = content.split(/\s+/).length
  const minutes = Math.ceil(words / 200) // Average reading speed
  return `${minutes} min read`
})

liquidEngine.registerFilter('slug', (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
})

// Custom tags for blog functionality
liquidEngine.registerTag('highlight_code', {
  parse: function(token: any) {
    this.language = token.args
  },
  render: function(context: any) {
    const content = this.liquid.renderer.renderTemplates(this.templates, context)
    return `<pre class="highlight ${this.language}"><code>${content}</code></pre>`
  }
})

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  author: string
  publishDate: string
  updatedDate?: string
  tags: string[]
  status: 'draft' | 'published'
  template?: string
  metadata?: Record<string, any>
}

export interface BlogTheme {
  name: string
  version: string
  templates: string[]
  assets: {
    css: string[]
    js: string[]
  }
}

export class LiquidBlogEngine {
  private engine: Liquid

  constructor() {
    this.engine = liquidEngine
  }

  async renderPost(post: BlogPost, theme: string = 'default'): Promise<string> {
    const templateName = post.template || 'post'
    const templatePath = `${theme}/${templateName}`
    
    const context = {
      post: {
        ...post,
        excerpt: post.excerpt || this.generateExcerpt(post.content),
        reading_time: this.calculateReadingTime(post.content),
        url: `/blog/${post.slug}`,
      },
      site: {
        title: 'jason mcelhenney | software dev & ai tinkerer',
        description: 'portfolio and blog',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      },
      theme: theme,
    }

    try {
      return await this.engine.renderFile(templatePath, context)
    } catch (error) {
      console.error('Error rendering Liquid template:', error)
      return this.renderFallback(post)
    }
  }

  async renderPostList(posts: BlogPost[], theme: string = 'default'): Promise<string> {
    const templatePath = `${theme}/index`
    
    const context = {
      posts: posts.map(post => ({
        ...post,
        excerpt: post.excerpt || this.generateExcerpt(post.content),
        reading_time: this.calculateReadingTime(post.content),
        url: `/blog/${post.slug}`,
      })),
      site: {
        title: 'jason mcelhenney | software dev & ai tinkerer',
        description: 'portfolio and blog',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      },
      theme: theme,
    }

    try {
      return await this.engine.renderFile(templatePath, context)
    } catch (error) {
      console.error('Error rendering blog index:', error)
      return this.renderFallbackIndex(posts)
    }
  }

  async previewPost(content: string, context: any = {}): Promise<string> {
    try {
      return await this.engine.parseAndRender(content, context)
    } catch (error) {
      console.error('Error previewing Liquid template:', error)
      return `<div class="error">Template preview error: ${error}</div>`
    }
  }

  private generateExcerpt(content: string, length: number = 150): string {
    const text = content.replace(/<[^>]*>/g, '') // Strip HTML
    if (text.length <= length) return text
    return text.substring(0, length).trim() + '...'
  }

  private calculateReadingTime(content: string): string {
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return `${minutes} min read`
  }

  private renderFallback(post: BlogPost): string {
    return `
      <article>
        <h1>${post.title}</h1>
        <div class="meta">
          <time>${new Date(post.publishDate).toLocaleDateString()}</time>
          <span>by ${post.author}</span>
        </div>
        <div class="content">${post.content}</div>
      </article>
    `
  }

  private renderFallbackIndex(posts: BlogPost[]): string {
    return `
      <div class="blog-index">
        <h1>Blog Posts</h1>
        ${posts.map(post => `
          <article class="post-preview">
            <h2><a href="/blog/${post.slug}">${post.title}</a></h2>
            <div class="meta">
              <time>${new Date(post.publishDate).toLocaleDateString()}</time>
            </div>
            <div class="excerpt">${this.generateExcerpt(post.content)}</div>
          </article>
        `).join('')}
      </div>
    `
  }
}

export const blogEngine = new LiquidBlogEngine()
