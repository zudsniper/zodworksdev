import { notFound } from 'next/navigation'
import { getBuildSafePrismaClient } from '@/lib/prisma'
import { EditPostForm } from '@/components/edit-post-form'

async function getPost(id: string) {
  const prisma = await getBuildSafePrismaClient()
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      tags: true,
    }
  })

  if (!post) {
    notFound()
  }

  return post
}

async function getTags() {
  const prisma = await getBuildSafePrismaClient()
  return prisma.tag.findMany({
    orderBy: { name: 'asc' }
  })
}

export default async function EditPostPage({
  params,
}: {
  params: { id: string }
}) {
  const [post, tags] = await Promise.all([
    getPost(params.id),
    getTags()
  ])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
        <p className="text-gray-600 mt-2">
          Update your blog post content and settings.
        </p>
      </div>

      <EditPostForm post={post} tags={tags} />
    </div>
  )
}
