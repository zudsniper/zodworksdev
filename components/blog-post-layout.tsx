import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Github, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface BlogPostProps {
  title: string
  description: string
  publishDate: string
  tags: string[]
  liveLink?: string
  repoLink?: string
  imageUrl?: string
  children: React.ReactNode
  projectStatus?: string
}

export default function BlogPostLayout({
  title,
  description,
  publishDate,
  tags,
  liveLink,
  repoLink,
  imageUrl,
  children,
  projectStatus
}: BlogPostProps) {
  return (
    <article className="max-w-4xl mx-auto">
      {/* Back to projects button */}
      <div className="mb-8">
        <Link href="/#projects">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            back to projects
          </Button>
        </Link>
      </div>

      {/* Hero section */}
      <header className="mb-12">
        {imageUrl && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden bg-muted">
            <img
              src={imageUrl || "/placeholder.svg?width=800&height=400"}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-mono text-primary">
            {title}
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed">
            {description}
          </p>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={publishDate}>
                {new Date(publishDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
            
            {projectStatus && (
              <div className="flex items-center gap-2">
                <span>status:</span>
                <Badge variant="secondary" className="text-xs">
                  {projectStatus}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          {(liveLink || repoLink) && (
            <div className="flex gap-3 pt-2">
              {liveLink && (
                <Button asChild variant="default" size="sm">
                  <a href={liveLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    view live
                  </a>
                </Button>
              )}
              {repoLink && (
                <Button asChild variant="outline" size="sm">
                  <a href={repoLink} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    view source
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <Card className="border-0 bg-transparent shadow-none">
        <CardContent className="px-0 pt-0">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="space-y-6 text-foreground leading-relaxed">
              {children}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer navigation */}
      <footer className="mt-16 pt-8 border-t border-border">
        <div className="flex justify-center">
          <Link href="/#projects">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              back to all projects
            </Button>
          </Link>
        </div>
      </footer>
    </article>
  )
}
