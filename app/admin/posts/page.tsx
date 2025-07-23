import Link from 'next/link'
import { getBuildSafePrismaClient } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { PostActions } from '@/components/post-actions'

async function getPosts() {
  const prisma = await getBuildSafePrismaClient()
  return prisma.blogPost.findMany({
    include: {
      tags: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function PostsPage() {
  const posts = await getPosts()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600">Manage your blog posts and content</p>
        </div>
        <Link href="/admin/posts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts ({posts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{post.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>By {post.authorName || post.authorEmail}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        {post.publishDate && (
                          <span>Published {new Date(post.publishDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.tags.map((tag) => (
                            <Badge key={tag.slug} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge
                        variant={
                          post.status === 'PUBLISHED'
                            ? 'default'
                            : post.status === 'DRAFT'
                            ? 'secondary'
                            : 'outline'
                        }
                        className={
                          post.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : post.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : ''
                        }
                      >
                        {post.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <PostActions post={post} />
              </div>
            ))}
            
            {posts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                <p className="mb-4">Get started by creating your first blog post.</p>
                <Link href="/admin/posts/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Post
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Posts:</span>
                <span className="font-medium">{posts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Published:</span>
                <span className="font-medium text-green-600">
                  {posts.filter(p => p.status === 'PUBLISHED').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Drafts:</span>
                <span className="font-medium text-yellow-600">
                  {posts.filter(p => p.status === 'DRAFT').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {posts.slice(0, 3).map((post) => (
                <div key={post.id} className="text-sm">
                  <div className="font-medium truncate">{post.title}</div>
                  <div className="text-gray-500">
                    {new Date(post.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/admin/posts/new" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  New Post
                </Button>
              </Link>
              <Link href="/admin/tags" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Badge className="mr-2 h-4 w-4" />
                  Manage Tags
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
