'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { RichTextEditor } from '@/components/rich-text-editor'
import { X, Save, Eye } from 'lucide-react'

interface Tag {
  id: string
  name: string
  slug: string
}

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  status: string
  template: string
  tags: Tag[]
}

interface EditPostFormProps {
  post: Post
  tags: Tag[]
}

export function EditPostForm({ post, tags }: EditPostFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>(
    post.tags.map(tag => tag.id)
  )
  const [formData, setFormData] = useState({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    content: post.content,
    status: post.status as 'DRAFT' | 'PUBLISHED',
    template: post.template,
  })

  const handleSubmit = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/blog/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status,
          tags: selectedTags,
          publishDate: status === 'PUBLISHED' && post.status !== 'PUBLISHED' ? new Date().toISOString() : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update post')
      }

      const updatedPost = await response.json()
      
      if (status === 'PUBLISHED') {
        router.push(`/blog/${updatedPost.slug}`)
      } else {
        router.push('/admin/posts')
      }
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Failed to update post. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags(prev => [...prev, tagId])
    }
  }

  const removeTag = (tagId: string) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId))
  }

  const selectedTagObjects = tags.filter(tag => selectedTags.includes(tag.id))

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Post Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter your post title..."
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="post-url-slug"
              />
              <p className="text-sm text-gray-500 mt-1">
                URL: /blog/{formData.slug}
              </p>
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="A brief description of your post..."
                rows={3}
              />
            </div>

            <div>
              <Label>Content</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Edit your blog post content..."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" onClick={() => router.back()} className="w-full">
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleSubmit('DRAFT')}
              disabled={isLoading}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button 
              onClick={() => handleSubmit('PUBLISHED')}
              disabled={isLoading}
              className="w-full"
            >
              <Eye className="mr-2 h-4 w-4" />
              {isLoading ? 'Updating...' : 'Update & Publish'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Post Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'DRAFT' | 'PUBLISHED') => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="template">Template</Label>
              <Select 
                value={formData.template} 
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, template: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">Default Post</SelectItem>
                  <SelectItem value="feature">Feature Post</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedTagObjects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTagObjects.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => removeTag(tag.id)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <Select onValueChange={addTag}>
                <SelectTrigger>
                  <SelectValue placeholder="Add a tag..." />
                </SelectTrigger>
                <SelectContent>
                  {tags
                    .filter(tag => !selectedTags.includes(tag.id))
                    .map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {tags.length === 0 && (
                <p className="text-sm text-gray-500">
                  No tags available. Create some tags first.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
