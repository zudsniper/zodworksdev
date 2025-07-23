import { Liquid } from 'liquidjs'
import path from 'path'
import { templateCacheService, withCacheMetrics } from './template-cache'

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

// Custom Liquid Filters for Portfolio & Blog
import { marked } from 'marked'

// Date formatting filters
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
  if (format === 'year') {
    return d.getFullYear().toString()
  }
  if (format === 'iso') {
    return d.toISOString()
  }
  if (format === 'relative') {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - d.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'yesterday'
    if (diffDays <= 7) return `${diffDays} days ago`
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    if (diffDays <= 365) return `${Math.ceil(diffDays / 30)} months ago`
    return `${Math.ceil(diffDays / 365)} years ago`
  }
  return d.toISOString()
})

// Text processing filters
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

liquidEngine.registerFilter('word_count', (content: string) => {
  if (!content) return 0
  return content.split(/\s+/).length
})

liquidEngine.registerFilter('slug', (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
})

liquidEngine.registerFilter('capitalize_first', (text: string) => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
})

liquidEngine.registerFilter('title_case', (text: string) => {
  if (!text) return ''
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
})

// Markdown processing filter
liquidEngine.registerFilter('markdown', (content: string) => {
  if (!content) return ''
  try {
    return marked(content)
  } catch (error) {
    console.warn('Markdown parsing error:', error)
    return content
  }
})

// URL and link filters
liquidEngine.registerFilter('absolute_url', (url: string, base_url?: string) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const baseUrl = base_url || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
})

liquidEngine.registerFilter('external_link', (url: string) => {
  if (!url) return false
  return url.startsWith('http://') || url.startsWith('https://')
})

// Array and collection filters
liquidEngine.registerFilter('limit_words', (text: string, limit: number = 50) => {
  if (!text) return ''
  const words = text.split(/\s+/)
  if (words.length <= limit) return text
  return words.slice(0, limit).join(' ') + '...'
})

liquidEngine.registerFilter('group_by_year', (posts: any[]) => {
  if (!Array.isArray(posts)) return {}
  
  const grouped = posts.reduce((acc, post) => {
    const year = new Date(post.publishDate || post.createdAt).getFullYear()
    if (!acc[year]) acc[year] = []
    acc[year].push(post)
    return acc
  }, {})
  
  return grouped
})

liquidEngine.registerFilter('sort_by_date', (posts: any[], order: 'asc' | 'desc' = 'desc') => {
  if (!Array.isArray(posts)) return posts
  
  return posts.sort((a, b) => {
    const dateA = new Date(a.publishDate || a.createdAt).getTime()
    const dateB = new Date(b.publishDate || b.createdAt).getTime()
    return order === 'desc' ? dateB - dateA : dateA - dateB
  })
})

liquidEngine.registerFilter('filter_by_tag', (posts: any[], tag: string) => {
  if (!Array.isArray(posts) || !tag) return posts
  
  return posts.filter(post => 
    post.tags && post.tags.some((postTag: string) => 
      postTag.toLowerCase() === tag.toLowerCase()
    )
  )
})

liquidEngine.registerFilter('unique_tags', (posts: any[]) => {
  if (!Array.isArray(posts)) return []
  
  const allTags = posts.flatMap(post => post.tags || [])
  return [...new Set(allTags)].sort()
})

// Portfolio-specific filters
liquidEngine.registerFilter('project_status_color', (status: string) => {
  const statusColors = {
    'live': 'green',
    'ongoing': 'blue', 
    'maintained': 'teal',
    'archived': 'gray',
    'deprecated': 'red',
    'beta': 'yellow',
    'alpha': 'purple'
  }
  return statusColors[status?.toLowerCase()] || 'gray'
})

liquidEngine.registerFilter('shield_badge', (text: string, color: string = 'blue') => {
  const encodedText = encodeURIComponent(text.replace(/-/g, '--'))
  return `https://img.shields.io/badge/${encodedText}-${color}?style=flat-square&logoColor=white`
})

liquidEngine.registerFilter('github_lang_color', (language: string) => {
  const langColors = {
    'javascript': 'f1e05a',
    'typescript': '3178c6',
    'python': '3572a5',
    'java': 'b07219',
    'clojure': 'db5855',
    'rust': 'dea584',
    'go': '00add8',
    'html': 'e34c26',
    'css': '1572b6',
    'scss': 'c6538c'
  }
  return langColors[language?.toLowerCase()] || '586e75'
})

// Custom tags for portfolio and blog functionality

// Code highlighting tag
liquidEngine.registerTag('highlight_code', {
  parse: function(token: any) {
    this.language = token.args
  },
  render: function(context: any) {
    const content = this.liquid.renderer.renderTemplates(this.templates, context)
    return `<pre class="highlight ${this.language}"><code>${content}</code></pre>`
  }
})

// Project showcase tag
liquidEngine.registerTag('project_card', {
  parse: function(token: any) {
    const args = token.args.split(' ')
    this.projectId = args[0]
    this.variant = args[1] || 'default'
  },
  render: function(context: any) {
    const { projects } = context
    const project = projects?.find((p: any) => p.id === this.projectId)
    
    if (!project) {
      return `<div class="project-error">Project "${this.projectId}" not found</div>`
    }
    
    return `
      <div class="project-card ${this.variant}">
        <div class="project-header">
          <h3><a href="${project.liveLink || project.repoLink || '#'}">${project.title}</a></h3>
          <span class="project-status status-${project.status}">${project.status}</span>
        </div>
        <p class="project-description">${project.description}</p>
        ${project.tags ? `
          <div class="project-tags">
            ${project.tags.map((tag: string) => 
              `<span class="tag">${tag}</span>`
            ).join('')}
          </div>
        ` : ''}
        <div class="project-links">
          ${project.liveLink ? `<a href="${project.liveLink}" target="_blank">View Live</a>` : ''}
          ${project.repoLink ? `<a href="${project.repoLink}" target="_blank">Source Code</a>` : ''}
        </div>
      </div>
    `
  }
})

// Alert/callout tag
liquidEngine.registerTag('alert', {
  parse: function(token: any) {
    this.type = token.args || 'info'
    this.title = ''
  },
  render: function(context: any) {
    const content = this.liquid.renderer.renderTemplates(this.templates, context)
    const icons = {
      info: 'ℹ️',
      warning: '⚠️', 
      error: '❌',
      success: '✅',
      tip: '💡'
    }
    
    return `
      <div class="alert alert-${this.type}">
        <div class="alert-icon">${icons[this.type] || icons.info}</div>
        <div class="alert-content">${content}</div>
      </div>
    `
  }
})

// Skills grid tag
liquidEngine.registerTag('skills_grid', {
  parse: function(token: any) {
    this.category = token.args
  },
  render: function(context: any) {
    const { skills } = context
    const categorySkills = this.category 
      ? skills?.filter((skill: any) => skill.category === this.category)
      : skills
    
    if (!categorySkills?.length) {
      return '<div class="skills-empty">No skills found</div>'
    }
    
    return `
      <div class="skills-grid">
        ${categorySkills.map((skill: any) => `
          <div class="skill-item">
            <span class="skill-name">${skill.name}</span>
            <div class="skill-level level-${skill.level || 'intermediate'}"></div>
          </div>
        `).join('')}
      </div>
    `
  }
})

// Timeline/experience tag
liquidEngine.registerTag('timeline', {
  parse: function(token: any) {
    // No args needed
  },
  render: function(context: any) {
    const content = this.liquid.renderer.renderTemplates(this.templates, context)
    return `<div class="timeline">${content}</div>`
  }
})

liquidEngine.registerTag('timeline_item', {
  parse: function(token: any) {
    const args = token.args.split(' ')
    this.date = args[0]
    this.title = args.slice(1).join(' ')
  },
  render: function(context: any) {
    const content = this.liquid.renderer.renderTemplates(this.templates, context)
    return `
      <div class="timeline-item">
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <h4>${this.title}</h4>
            <span class="timeline-date">${this.date}</span>
          </div>
          <div class="timeline-body">${content}</div>
        </div>
      </div>
    `
  }
})

// Social links tag
liquidEngine.registerTag('social_links', {
  parse: function(token: any) {
    this.style = token.args || 'horizontal'
  },
  render: function(context: any) {
    const { site } = context
    const links = []
    
    if (site.github_url) links.push(`<a href="${site.github_url}" class="social-link github">GitHub</a>`)
    if (site.linkedin_url) links.push(`<a href="${site.linkedin_url}" class="social-link linkedin">LinkedIn</a>`)
    if (site.twitter_url) links.push(`<a href="${site.twitter_url}" class="social-link twitter">Twitter</a>`)
    if (site.email) links.push(`<a href="mailto:${site.email}" class="social-link email">Email</a>`)
    
    return `<div class="social-links ${this.style}">${links.join('')}</div>`
  }
})

// Code block with copy button
liquidEngine.registerTag('code_block', {
  parse: function(token: any) {
    const args = token.args.split(' ')
    this.language = args[0] || 'text'
    this.filename = args[1] || ''
  },
  render: function(context: any) {
    const content = this.liquid.renderer.renderTemplates(this.templates, context)
    const filename = this.filename ? `<div class="code-filename">${this.filename}</div>` : ''
    
    return `
      <div class="code-block">
        ${filename}
        <div class="code-header">
          <span class="code-language">${this.language}</span>
          <button class="copy-button" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.textContent)">
            Copy
          </button>
        </div>
        <pre class="language-${this.language}"><code>${content}</code></pre>
      </div>
    `
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
        author: 'jason mcelhenney',
        tagline: 'software dev & ai tinkerer',
        github_url: 'https://github.com/zudsniper',
        linkedin_url: 'https://linkedin.com/in/jason-mcelhenney',
        email: 'hello@zodworks.dev'
      },
      theme: theme,
      // Add sample projects for demonstration (in real app, this would come from database)
      projects: [
        {
          id: 'sorter',
          title: 'Sorter',
          description: 'Democratic content ranking platform',
          status: 'ongoing',
          tags: ['clojure', 'rust', 'node.js'],
          liveLink: 'https://sorter.social',
          repoLink: 'https://github.com/sorterisntonline'
        }
      ]
    }

    // Generate cache key based on context
    const contextHash = templateCacheService.generateContextHash(context)
    
    // Check for cached rendered output
    const cachedOutput = templateCacheService.getRenderedOutput(templatePath, contextHash)
    if (cachedOutput) {
      return cachedOutput
    }

    try {
      const startTime = Date.now()
      const output = await this.engine.renderFile(templatePath, context)
      
      // Record performance metrics
      const renderTime = Date.now() - startTime
      templateCacheService.recordRenderTime(templatePath, renderTime)
      
      // Cache the rendered output (shorter TTL for dynamic content)
      templateCacheService.setRenderedOutput(templatePath, contextHash, output, 1000 * 60 * 5) // 5 minutes
      
      return output
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

    // Generate cache key based on context
    const contextHash = templateCacheService.generateContextHash(context)
    
    // Check for cached rendered output
    const cachedOutput = templateCacheService.getRenderedOutput(templatePath, contextHash)
    if (cachedOutput) {
      return cachedOutput
    }

    try {
      const startTime = Date.now()
      const output = await this.engine.renderFile(templatePath, context)
      
      // Record performance metrics
      const renderTime = Date.now() - startTime
      templateCacheService.recordRenderTime(templatePath, renderTime)
      
      // Cache the rendered output (longer TTL for list pages)
      templateCacheService.setRenderedOutput(templatePath, contextHash, output, 1000 * 60 * 10) // 10 minutes
      
      return output
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

  async renderProjects(projects: any[], theme: string = 'default'): Promise<string> {
    const templatePath = `${theme}/projects`
    
    const context = {
      projects: projects.map(project => ({
        ...project,
        url: project.projectUrl || project.url,
        excerpt: project.description,
      })),
      site: {
        title: 'jason mcelhenney | software dev & ai tinkerer',
        description: 'portfolio and blog',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        author: 'jason mcelhenney',
        tagline: 'software dev & ai tinkerer',
        github_url: 'https://github.com/zudsniper',
        linkedin_url: 'https://linkedin.com/in/jason-mcelhenney',
        email: 'hello@zodworks.dev'
      },
      theme: theme,
    }

    // Generate cache key based on context
    const contextHash = templateCacheService.generateContextHash(context)
    
    // Check for cached rendered output
    const cachedOutput = templateCacheService.getRenderedOutput(templatePath, contextHash)
    if (cachedOutput) {
      return cachedOutput
    }

    try {
      const startTime = Date.now()
      const output = await this.engine.renderFile(templatePath, context)
      
      // Record performance metrics
      const renderTime = Date.now() - startTime
      templateCacheService.recordRenderTime(templatePath, renderTime)
      
      // Cache the rendered output (longer TTL for static projects)
      templateCacheService.setRenderedOutput(templatePath, contextHash, output, 1000 * 60 * 30) // 30 minutes
      
      return output
    } catch (error) {
      console.error('Error rendering projects with Liquid:', error)
      return this.renderFallbackProjects(projects)
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

  private renderFallbackProjects(projects: any[]): string {
    return `
      <div class="projects-index">
        <h1>Projects</h1>
        <div class="projects-grid">
          ${projects.map(project => `
            <article class="project-card">
              <h2><a href="${project.projectUrl || project.url}">${project.title}</a></h2>
              <p>${project.description}</p>
              <div class="project-links">
                ${project.liveLink ? `<a href="${project.liveLink}" target="_blank">View Live</a>` : ''}
                ${project.repoLink ? `<a href="${project.repoLink}" target="_blank">Source Code</a>` : ''}
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    `
  }

  // Cache management methods
  
  /**
   * Get cache performance statistics
   */
  getCacheStats(): Record<string, any> {
    return templateCacheService.getPerformanceStats()
  }

  /**
   * Get cache health status
   */
  getCacheHealth(): { status: 'healthy' | 'warning' | 'error', details: any } {
    return templateCacheService.getHealthStatus()
  }

  /**
   * Invalidate cache for specific template
   */
  invalidateTemplateCache(templatePath: string): void {
    templateCacheService.invalidateTemplate(templatePath)
  }

  /**
   * Invalidate all template caches
   */
  invalidateAllCaches(): void {
    templateCacheService.invalidateAll()
  }

  /**
   * Warm up cache with commonly used templates
   */
  async warmUpCache(): Promise<void> {
    // This would typically be called during application startup
    // to pre-populate cache with frequently used templates
    
    const commonTemplates = [
      { path: 'default/index', context: { posts: [], site: this.getDefaultSiteContext() } },
      { path: 'default/projects', context: { projects: [], site: this.getDefaultSiteContext() } }
    ]

    for (const template of commonTemplates) {
      try {
        const contextHash = templateCacheService.generateContextHash(template.context)
        const startTime = Date.now()
        
        const output = await this.engine.renderFile(template.path, template.context)
        
        const renderTime = Date.now() - startTime
        templateCacheService.recordRenderTime(template.path, renderTime)
        templateCacheService.setRenderedOutput(template.path, contextHash, output)
        
        console.log(`Cache warmed up for template: ${template.path}`)
      } catch (error) {
        console.warn(`Failed to warm up cache for template ${template.path}:`, error)
      }
    }
  }

  private getDefaultSiteContext() {
    return {
      title: 'jason mcelhenney | software dev & ai tinkerer',
      description: 'portfolio and blog',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      author: 'jason mcelhenney',
      tagline: 'software dev & ai tinkerer',
      github_url: 'https://github.com/zudsniper',
      linkedin_url: 'https://linkedin.com/in/jason-mcelhenney',
      email: 'hello@zodworks.dev'
    }
  }
}

export const blogEngine = new LiquidBlogEngine()
