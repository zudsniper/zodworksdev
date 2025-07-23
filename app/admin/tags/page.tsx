import Link from 'next/link'
import { getBuildSafePrismaClient } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { TagActions } from '@/components/tag-actions'

async function getTags() {
  const prisma = await getBuildSafePrismaClient()
  return prisma.tag.findMany({
    include: {
      _count: {
        select: { posts: true }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export default async function TagsPage() {
  const tags = await getTags()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
          <p className="text-gray-600 mt-2">
            Organize your blog posts with tags and manage your taxonomy.
          </p>
        </div>
        <Link href="/admin/tags/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Tag
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tags ({tags.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Badge 
                    style={{ 
                      backgroundColor: tag.color || '#64748b',
                      color: 'white'
                    }}
                    className="min-w-fit"
                  >
                    {tag.name}
                  </Badge>
                  <div>
                    <p className="text-sm text-gray-600">
                      Slug: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{tag.slug}</code>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {tag._count.posts} {tag._count.posts === 1 ? 'post' : 'posts'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/tags/${tag.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <TagActions tagId={tag.id} tagName={tag.name} postCount={tag._count.posts} />
                </div>
              </div>
            ))}

            {tags.length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-sm mx-auto">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <Plus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tags yet</h3>
                    <p className="text-gray-500 mb-4">
                      Create tags to organize your blog posts by topic, category, or theme.
                    </p>
                    <Link href="/admin/tags/new">
                      <Button>Create your first tag</Button>
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
