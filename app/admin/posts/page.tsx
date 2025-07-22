import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { PostActions } from '@/components/post-actions'

async function getPosts() {
  return prisma.blogPost.findMany({
    include: {
      author: { select: { name: true } },
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
          <p className="text-gray-600 mt-2">
            Manage your blog posts, create new content, and organize your articles.
          </p>
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
                        <span>By {post.author.name}</span>
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
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {post.status.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/blog/${post.slug}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/posts/${post.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <PostActions postId={post.id} postTitle={post.title} />
                </div>
              </div>
            ))}

            {posts.length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-sm mx-auto">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <Plus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-500 mb-4">
                      Get started by creating your first blog post.
                    </p>
                    <Link href="/admin/posts/new">
                      <Button>Create your first post</Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
