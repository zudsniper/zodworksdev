import type { Metadata } from 'next'
import { blogEngine } from '@/lib/liquid-engine'

export const metadata: Metadata = {
  title: 'Projects | jason mcelhenney',
  description: 'Software projects and experiments by jason mcelhenney',
  openGraph: {
    title: 'Projects | jason mcelhenney',
    description: 'Software projects and experiments by jason mcelhenney',
    type: 'website',
  },
}

// Projects data (this could be moved to a database later)
const projectsData = [
  {
    id: "sorter",
    title: "sorter",
    description: "social media platform for democratic content ranking by group consensus. built with clojure, rust, node.js.",
    tags: ["social media", "clojure", "rust", "node.js", "democracy"],
    liveLink: "https://sorter.social",
    repoLink: "https://github.com/sorterisntonline",
    status: "ongoing",
    imageUrl: "/projects/sorter.png",
    projectUrl: "/projects/sorter"
  },
  {
    id: "sorterpy",
    title: "sorterpy",
    description: "Python SDK for the Sorter API with automated PyPI publishing and ReadTheDocs generation",
    tags: ["python", "sdk", "api client", "ci/cd", "documentation", "pypi", "automation"],
    liveLink: "https://pypi.org/project/sorterpy/",
    repoLink: "https://github.com/sorterisntonline/sorterpy",
    status: "live",
    imageUrl: "/projects/sorterpy.png",
    projectUrl: "/projects/sorterpy"
  },
  {
    id: "spookytf",
    title: "spooky.tf",
    description: "Co-founded and led development for a Team Fortress 2 community project, managing team, social media, and hiring",
    tags: ["project management", "team lead", "community", "game server", "tf2", "leadership"],
    repoLink: "https://github.com/spooky.tf",
    status: "completed",
    imageUrl: "/projects/spookytf.png",
    projectUrl: "/projects/spooky-tf"
  },
  {
    id: "tmvisuals",
    title: "tmvisuals",
    description: "Building tmvisuals, a mind-map style visualizer for the TaskMaster AI MCP server with interactive task relationship visualization.",
    tags: ["visualization", "mind-map", "taskmaster", "mcp", "ai", "task management"],
    repoLink: "https://github.com/zudsniper/tmvisuals",
    status: "beta",
    imageUrl: "/projects/tmvisuals.png",
    projectUrl: "/projects/tmvisuals"
  }
]

export default async function ProjectsIndexPage() {
  try {
    // Try to render with Liquid templates using the dedicated projects template
    const renderedContent = await blogEngine.renderProjects(projectsData, 'default')
    
    return (
      <div 
        className="liquid-content"
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    )
  } catch (error) {
    console.error('Error rendering projects with Liquid:', error)
    
    // Fallback to React rendering if Liquid fails
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Projects</h1>
          <p className="text-muted-foreground">Software projects and experiments</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsData.map((project) => (
            <article 
              key={project.id} 
              className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {project.imageUrl && (
                <div className="aspect-video">
                  <img 
                    src={project.imageUrl} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                <header className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold">
                    <a 
                      href={project.projectUrl}
                      className="text-foreground hover:text-accent transition-colors"
                    >
                      {project.title}
                    </a>
                  </h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'live' ? 'bg-green-100 text-green-800' :
                    project.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'beta' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </header>
                
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-muted rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>
                
                <footer className="flex gap-3 flex-wrap">
                  <a 
                    href={project.projectUrl}
                    className="text-accent hover:text-accent-foreground transition-colors font-medium"
                  >
                    Read More →
                  </a>
                  {project.liveLink && (
                    <a 
                      href={project.liveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      View Live ↗
                    </a>
                  )}
                  {project.repoLink && (
                    <a 
                      href={project.repoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Source ↗
                    </a>
                  )}
                </footer>
              </div>
            </article>
          ))}
        </div>
      </div>
    )
  }
} 