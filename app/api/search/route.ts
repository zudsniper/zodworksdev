import { NextRequest, NextResponse } from 'next/server'
import { getAllBlogPosts } from '@/lib/content-utils'

// Static projects data (same as in projects/page.tsx)
const projectsData = [
  {
    id: "sorter",
    title: "sorter",
    description: "social media platform for democratic content ranking by group consensus. built with clojure, rust, node.js.",
    tags: ["social media", "clojure", "rust", "node.js", "democracy"],
    liveLink: "https://sorter.social",
    repoLink: "https://github.com/sorterisntonline",
    status: "ongoing",
    imageUrl: "/projects/sorter.png",
    projectUrl: "/projects/sorter",
    type: "project"
  },
  {
    id: "sorterpy",
    title: "sorterpy",
    description: "Python SDK for the Sorter API with automated PyPI publishing and ReadTheDocs generation",
    tags: ["python", "sdk", "api client", "ci/cd", "documentation", "pypi", "automation"],
    liveLink: "https://pypi.org/project/sorterpy/",
    repoLink: "https://github.com/sorterisntonline/sorterpy",
    status: "live",
    imageUrl: "/projects/sorterpy.png",
    projectUrl: "/projects/sorterpy",
    type: "project"
  },
  {
    id: "spookytf",
    title: "spooky.tf",
    description: "Co-founded and led development for a Team Fortress 2 community project, managing team, social media, and hiring",
    tags: ["project management", "team lead", "community", "game server", "tf2", "leadership"],
    repoLink: "https://github.com/spooky.tf",
    status: "completed",
    imageUrl: "/projects/spookytf.png",
    projectUrl: "/projects/spooky-tf",
    type: "project"
  },
  {
    id: "tmvisuals",
    title: "tmvisuals",
    description: "Building tmvisuals, a mind-map style visualizer for the TaskMaster AI MCP server with interactive task relationship visualization.",
    tags: ["visualization", "mind-map", "taskmaster", "mcp", "ai", "task management"],
    repoLink: "https://github.com/zudsniper/tmvisuals",
    status: "beta",
    imageUrl: "/projects/tmvisuals.png",
    projectUrl: "/projects/tmvisuals",
    type: "project"
  }
]

interface SearchResult {
  id: string
  title: string
  description: string
  excerpt?: string
  tags: string[]
  url: string
  type: 'blog' | 'project'
  status?: string
  publishDate?: string
  author?: string
  score?: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')?.toLowerCase().trim() || ''
    const tagFilter = searchParams.get('tags')?.toLowerCase().trim() || ''
    const typeFilter = searchParams.get('type')?.toLowerCase().trim() || '' // 'blog' or 'project'
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query && !tagFilter) {
      return NextResponse.json({ 
        error: 'Query or tag filter is required' 
      }, { status: 400 })
    }

    const results: SearchResult[] = []

    // Search blog posts from database
    if (!typeFilter || typeFilter === 'blog') {
      try {
        const blogPosts = await getAllBlogPosts(false) // false = only published
        
        const blogResults = blogPosts
          .filter(post => {
            // Text search
            const textMatch = !query || (
              post.title.toLowerCase().includes(query) ||
              (post.excerpt || '').toLowerCase().includes(query) ||
              post.content.toLowerCase().includes(query)
            )
            
            // Tag filter
            const tagMatch = !tagFilter || (
              post.tags && post.tags.some(tag => 
                tag.toLowerCase().includes(tagFilter)
              )
            )
            
            return textMatch && tagMatch
          })
          .map(post => ({
            id: post.id,
            title: post.title,
            description: post.excerpt || post.content.substring(0, 200).replace(/<[^>]*>/g, '') + '...',
            excerpt: post.excerpt,
            tags: post.tags || [],
            url: `/blog/${post.slug}`,
            type: 'blog' as const,
            publishDate: post.publishDate,
            author: post.author,
            score: calculateScore(post.title, post.excerpt || '', post.tags || [], query)
          }))

        results.push(...blogResults)
      } catch (error) {
        console.error('Error searching blog posts:', error)
        // Continue with project search even if blog search fails
      }
    }

    // Search projects from static data
    if (!typeFilter || typeFilter === 'project') {
      const projectResults = projectsData
        .filter(project => {
          // Text search
          const textMatch = !query || (
            project.title.toLowerCase().includes(query) ||
            project.description.toLowerCase().includes(query)
          )
          
          // Tag filter
          const tagMatch = !tagFilter || (
            project.tags.some(tag => 
              tag.toLowerCase().includes(tagFilter)
            )
          )
          
          return textMatch && tagMatch
        })
        .map(project => ({
          id: project.id,
          title: project.title,
          description: project.description,
          tags: project.tags,
          url: project.projectUrl,
          type: 'project' as const,
          status: project.status,
          score: calculateScore(project.title, project.description, project.tags, query)
        }))

      results.push(...projectResults)
    }

    // Sort by relevance score (higher is better)
    results.sort((a, b) => (b.score || 0) - (a.score || 0))

    // Apply limit
    const limitedResults = results.slice(0, limit)

    return NextResponse.json({
      query,
      tagFilter,
      typeFilter,
      totalResults: results.length,
      results: limitedResults,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error during search',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * Calculate relevance score for search results
 * Higher scores indicate better matches
 */
function calculateScore(title: string, description: string, tags: string[], query: string): number {
  if (!query) return 0

  const queryLower = query.toLowerCase()
  let score = 0

  // Title matches are most important
  if (title.toLowerCase().includes(queryLower)) {
    score += 10
    // Exact title match gets bonus
    if (title.toLowerCase() === queryLower) {
      score += 20
    }
    // Title starts with query gets bonus
    if (title.toLowerCase().startsWith(queryLower)) {
      score += 5
    }
  }

  // Tag matches are very important
  tags.forEach(tag => {
    if (tag.toLowerCase().includes(queryLower)) {
      score += 8
      // Exact tag match gets bonus
      if (tag.toLowerCase() === queryLower) {
        score += 12
      }
    }
  })

  // Description matches are less important
  if (description.toLowerCase().includes(queryLower)) {
    score += 3
    // Multiple occurrences in description
    const occurrences = (description.toLowerCase().match(new RegExp(queryLower, 'g')) || []).length
    score += Math.min(occurrences - 1, 5) // Cap bonus at 5 points
  }

  return score
} 