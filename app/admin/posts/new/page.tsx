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

export default function NewPostPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    template: 'post',
  })

  useEffect(() => {
    // Fetch available tags
    fetch('/api/tags')
      .then(res => res.json())
      .then(data => setTags(data))
      .catch(console.error)
  }, [])

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.title, formData.slug])

  const handleSubmit = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status,
          tags: selectedTags,
          publishDate: status === 'PUBLISHED' ? new Date().toISOString() : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create post')
      }

      const post = await response.json()
      
      if (status === 'PUBLISHED') {
        router.push(`/blog/${post.slug}`)
      } else {
        router.push('/admin/posts')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
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
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
          <p className="text-gray-600 mt-2">
            Write a new blog post and share your thoughts with the world.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSubmit('DRAFT')}
            disabled={isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button 
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={isLoading}
          >
            <Eye className="mr-2 h-4 w-4" />
            {isLoading ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

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
                  placeholder="Start writing your blog post..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
    </div>
  )
}
