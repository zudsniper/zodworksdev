"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, BookOpen } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string | number
  title: string
  description: string
  tags: string[]
  liveLink?: string | null
  repoLink?: string | null
  status: string
  shieldColor: string
  imageUrl?: string | null
  hasBlogPost?: boolean
}

// Projects that have detailed blog posts
const PROJECTS_WITH_BLOG_POSTS = new Set([
  'sorter',
  'spookytf', 
  'sorterpy',
  'tmvisuals'
]);

// Helper function to get blog post URL
const getBlogPostUrl = (projectId: string): string => {
  const urlMap: Record<string, string> = {
    'sorter': '/projects/sorter',
    'spookytf': '/projects/spooky-tf',
    'sorterpy': '/projects/sorterpy',
    'tmvisuals': '/projects/tmvisuals'
  };
  return urlMap[projectId] || '';
};

const defaultProjectsData: Project[] = [
  {
    id: "sorter",
    title: "sorter",
    description:
      "social media platform for democratic content ranking by group consensus. built with clojure, rust, node.js.",
    tags: ["social media", "clojure", "rust", "node.js", "democracy"],
    liveLink: "https://sorter.social",
    repoLink: null,
    status: "ongoing",
    shieldColor: "blue",
    imageUrl: "/projects/sorter.png?width=400&height=250",
  },
  {
    id: "salonchat",
    title: "salonchat",
    description: "embeddable ai chatbot using rag for hairstyling/cut service recommendations with limited context.",
    tags: ["ai chatbot", "rag", "nlp", "react", "embeddable"],
    liveLink: "https://salonchat.zodworks.dev",
    repoLink: "https://github.com/zudsniper/salonchat",
    status: "live",
    shieldColor: "red",
    imageUrl: "/projects/salonchat.png?width=400&height=250",
  },
  {
    id: "tmvisuals",
    title: "tmvisuals (taskmaster ai visualizer)",
    description: "mind-map style visualizer for the mcp server 'claude-task-master' (taskmaster ai).",
    tags: ["ai", "visualization", "react", "task automation"],
    liveLink: null,
    repoLink: "https://github.com/zudsniper/tmvisuals",
    status: "maintained",
    shieldColor: "teal",
    imageUrl: "/projects/tmvisuals.png?width=400&height=250",
  },
  {
    id: "sorterpy",
    title: "sorterpy (python sdk)",
    description: "python sdk for the v1 sorter api. automated pypi publishing & readthedocs generation.",
    tags: ["python", "sdk", "api client", "ci/cd", "documentation"],
    liveLink: "https://pypi.org/project/sorterpy/",
    repoLink: "https://github.com/sorterisntonline/sorterpy",
    status: "live",
    shieldColor: "green",
    imageUrl: "/projects/sorterpy.png?width=400&height=250",
  },
  {
    id: "spookytf",
    title: "spooky.tf",
    description: "co-founded and led development for a community project, managing team, social media, and hiring.",
    tags: ["project management", "team lead", "community", "game server"],
    liveLink: null,
    repoLink: "https://github.com/spooky.tf",
    status: "completed (mar 2023)",
    shieldColor: "purple",
    imageUrl: "/projects/spookytf.png?width=400&height=250",
  },
  {
    id: "mcp-notifications",
    title: "mcp-notifications",
    description:
      "allows agents to send rich status notifications via a simple mcp server. supports various webhooks, prominently discord embeds.",
    tags: ["notifications", "discord api", "webhooks", "backend"],
    liveLink: null,
    repoLink: "https://github.com/zudsniper/mcp-notifications",
    status: "maintained",
    shieldColor: "indigo",
    imageUrl: "/projects/mcp-notifications.png?width=400&height=250",
  },
  {
    id: "bashbits",
    title: "bashbits",
    description: "collection of personal bash & zsh scripts for linux & macos; installers, os-setup wizards, etc.",
    tags: ["bash", "zsh", "linux", "macos", "devops", "scripts"],
    liveLink: null,
    repoLink: "https://github.com/zudsniper/bashbits",
    status: "maintained",
    shieldColor: "gray",
    imageUrl: "/projects/bashbits.png?width=400&height=250",
  },
  {
    id: "snackers",
    title: "snackers",
    description:
      "social media platform for snack food reviews – like rotten tomatoes for m&ms. full-stack development in collaboration with @grocery_obsessed on instagram.",
    tags: ["social media", "reviews", "full-stack", "community", "next.js"],
    liveLink: "https://allsnackers.com",
    repoLink: null,
    status: "ongoing",
    shieldColor: "pink",
    imageUrl: "/projects/snackers.png?width=400&height=250",
  },
  {
    id: "ndaexpress",
    title: "nda express",
    description: "full-stack development for an e-signature platform, enhancing features and user experience.",
    tags: ["full-stack", "web app", "saas", "ai"],
    liveLink: "https://ndaexpress.ai",
    repoLink: null,
    status: "completed",
    shieldColor: "orange",
    imageUrl: "/projects/NDAExpress.png?width=400&height=250",
  },
]

const ProjectCard = ({ project }: { project: Project }) => {
  const hasBlogPost = PROJECTS_WITH_BLOG_POSTS.has(project.id as string);
  const blogPostUrl = hasBlogPost ? getBlogPostUrl(project.id as string) : '';

  return (
    <Card className="flex flex-col bg-card border-border shadow-sm">
      <CardHeader>
        {project.imageUrl && (
          <img
            src={project.imageUrl || "/placeholder.svg?width=400&height=250"}
            alt={project.title}
            className="rounded-t-lg mb-4 w-full h-48 object-cover bg-muted"
            onError={(e) => (e.currentTarget.src = "/placeholder.svg?width=400&height=250")}
          />
        )}
        <CardTitle className="font-mono text-xl text-accent-orange">{project.title}</CardTitle>
        <CardDescription className="text-muted-foreground">{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags?.map((tag: string) => (
            <img
              key={tag}
              src={`https://img.shields.io/badge/${encodeURIComponent(tag)}-${project.shieldColor || "gray"}?style=flat-square&logoColor=white`}
              alt={tag}
              className="h-5"
            />
          ))}
        </div>
        {project.status && (
          <p className="text-xs text-muted-foreground">
            status: <span className="font-semibold text-foreground">{project.status}</span>
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {hasBlogPost && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-accent-orange text-accent-orange hover:bg-accent-orange/10"
          >
            <Link href={blogPostUrl}>
              <BookOpen className="h-4 w-4 mr-2" /> read more
            </Link>
          </Button>
        )}
        {project.liveLink && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-accent-green text-accent-green hover:bg-accent-green/10"
          >
            <a href={project.liveLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" /> live
            </a>
          </Button>
        )}
        {project.repoLink && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-accent-purple text-accent-purple hover:bg-accent-purple/10"
          >
            <a href={project.repoLink} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4 mr-2" /> repo
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export default function Projects() {
  const projects = defaultProjectsData

  return (
    <section id="projects" className="py-16">
      <h2 className="text-3xl font-bold font-mono text-center mb-12">
        <span className="text-primary normal-case">~$</span> cd /srv/git; ls -a
      </h2>
      {projects.length === 0 ? (
        <p className="text-center text-muted-foreground">no projects to display currently.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  )
}
