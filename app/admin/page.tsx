'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Tags, Eye, Loader2 } from 'lucide-react'

type DashboardStats = {
  totalPosts: number
  totalTags: number
  publishedPosts: number
}

type RecentPost = {
  id: string
  title: string
  authorName: string | null
  authorEmail: string
  status: string
  createdAt: string
  tagCount: number
}

type DashboardData = {
  stats: DashboardStats
  recentPosts: RecentPost[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/admin/dashboard')
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        
        const dashboardData: DashboardData = await response.json()
        setData(dashboardData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  const { stats, recentPosts } = data

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your blog content and activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedPosts} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTags}</div>
            <p className="text-xs text-muted-foreground">
              Content categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedPosts}</div>
            <p className="text-xs text-muted-foreground">
              Live content
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
          <CardDescription>
            Latest blog posts in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between border-b pb-4 last:border-b-0"
              >
                <div className="space-y-1">
                  <h3 className="font-medium leading-none">{post.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>By {post.authorName || post.authorEmail}</span>
                    <span>•</span>
                    <span>{post.tagCount} tags</span>
                    <span>•</span>
                    <span className={
                      post.status === 'PUBLISHED' 
                        ? 'text-green-600' 
                        : post.status === 'DRAFT' 
                        ? 'text-yellow-600' 
                        : 'text-gray-600'
                    }>
                      {post.status}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            
            {recentPosts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No posts yet. Create your first post to get started!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
