'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, X } from 'lucide-react'

export default function NewTagPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    color: '#64748b',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Please enter a tag name')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create tag')
      }

      router.push('/admin/tags')
    } catch (error) {
      console.error('Error creating tag:', error)
      alert('Failed to create tag. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Tag</h1>
          <p className="text-gray-600 mt-2">
            Add a new tag to organize your blog posts.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tag Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter tag name..."
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="tag-url-slug"
              />
              <p className="text-sm text-gray-500 mt-1">
                Used in URLs and for filtering. Auto-generated from name.
              </p>
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center space-x-3">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="#64748b"
                  className="font-mono"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Color for tag display (optional).
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Creating...' : 'Create Tag'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
