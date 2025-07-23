import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create sample tags
  const frontendTag = await prisma.tag.upsert({
    where: { name: 'Frontend' },
    update: {},
    create: {
      name: 'Frontend',
      slug: 'frontend',
      color: '#3B82F6'
    }
  })

  const backendTag = await prisma.tag.upsert({
    where: { name: 'Backend' },
    update: {},
    create: {
      name: 'Backend',
      slug: 'backend',
      color: '#10B981'
    }
  })

  const tutorialTag = await prisma.tag.upsert({
    where: { name: 'Tutorial' },
    update: {},
    create: {
      name: 'Tutorial',
      slug: 'tutorial',
      color: '#F59E0B'
    }
  })

  // Create sample blog posts
  const samplePost1 = await prisma.blogPost.upsert({
    where: { slug: 'welcome-to-zodworks' },
    update: {},
    create: {
      title: 'Welcome to ZodWorks',
      slug: 'welcome-to-zodworks',
      content: `# Welcome to ZodWorks

This is your first blog post! This platform is built with:

- **Next.js 15** - React framework with App Router
- **Cloudflare Workers** - Edge runtime deployment
- **Prisma** - Type-safe database access
- **SQLite** - Local development database
- **Cloudflare Access** - Authentication and security

## Getting Started

You can edit this post or create new ones using the admin interface. The platform supports:

- Markdown content
- Liquid templating
- Multiple themes
- Tag management
- File-based content sync

Happy blogging!`,
      excerpt: 'Welcome to your new blog platform built with Next.js and Cloudflare Workers.',
      status: 'PUBLISHED',
      template: 'post',
      theme: 'default',
      publishDate: new Date(),
      authorEmail: 'admin@zodworks.dev',
      authorName: 'Admin',
      tags: {
        connect: [{ id: frontendTag.id }, { id: tutorialTag.id }]
      }
    }
  })

  const samplePost2 = await prisma.blogPost.upsert({
    where: { slug: 'building-with-cloudflare-workers' },
    update: {},
    create: {
      title: 'Building with Cloudflare Workers',
      slug: 'building-with-cloudflare-workers',
      content: `# Building with Cloudflare Workers

Cloudflare Workers provide an excellent platform for deploying Next.js applications at the edge.

## Benefits

- **Global Performance** - Deploy to 200+ cities worldwide
- **Zero Cold Starts** - Instant response times
- **Cost Effective** - Pay per request model
- **Easy Integration** - Works seamlessly with Next.js

## Getting Started

This blog is running on Cloudflare Workers using OpenNext for compatibility. The entire stack is optimized for edge deployment.`,
      excerpt: 'Learn how to deploy Next.js applications on Cloudflare Workers for global performance.',
      status: 'PUBLISHED',
      template: 'post',
      theme: 'default',
      publishDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      authorEmail: 'admin@zodworks.dev',
      authorName: 'Admin',
      tags: {
        connect: [{ id: backendTag.id }, { id: tutorialTag.id }]
      }
    }
  })

  // Create default theme
  await prisma.theme.upsert({
    where: { name: 'default' },
    update: {},
    create: {
      name: 'default',
      displayName: 'Default Theme',
      version: '1.0.0',
      description: 'Clean and minimal blog theme',
      author: 'ZodWorks',
      templates: JSON.stringify(['post', 'page', 'index']),
      assets: JSON.stringify({
        css: ['/themes/default/style.css'],
        js: []
      }),
      isActive: true
    }
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
