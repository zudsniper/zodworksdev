import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Tags, Eye, Users } from 'lucide-react'
import type { BlogPost, User } from '@prisma/client'

type PostWithAuthorAndCount = BlogPost & {
  author: Pick<User, 'name'>
  _count: {
    tags: number
  }
}

async function getStats() {
  const [postsCount, tagsCount, publishedCount, usersCount] = await Promise.all([
    prisma.blogPost.count(),
    prisma.tag.count(),
    prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
    prisma.user.count(),
  ])

  return {
    totalPosts: postsCount,
    totalTags: tagsCount,
    publishedPosts: publishedCount,
    totalUsers: usersCount,
  }
}

async function getRecentPosts() {
  return prisma.blogPost.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true } },
      _count: { select: { tags: true } }
    }
  })
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const stats = await getStats()
  const recentPosts = await getRecentPosts()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your blog.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedPosts}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.publishedPosts / stats.totalPosts) * 100).toFixed(0)}% of total
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
              Organize your content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Total registered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
          <CardDescription>
            Your latest blog posts and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{post.title}</h3>
                  <div className="flex items-center mt-1 text-sm text-gray-500 space-x-4">
                    <span>By {post.author.name}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>{post._count.tags} tags</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      post.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800'
                        : post.status === 'DRAFT'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {post.status.toLowerCase()}
                  </span>
                </div>
              </div>
            ))}

            {recentPosts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No blog posts yet. Create your first post!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
