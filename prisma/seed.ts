import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@zodworks.dev'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (existingAdmin) {
    console.log('Admin user already exists')
    return
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log(`Created admin user: ${admin.email}`)

  // Create a default theme
  const defaultTheme = await prisma.theme.create({
    data: {
      name: 'default',
      displayName: 'Default Theme',
      version: '1.0.0',
      description: 'The default blog theme with clean, modern styling',
      author: 'ZodWorks',
      isActive: true,
      templates: JSON.stringify([
        'post.liquid',
        'index.liquid',
        'layout.liquid'
      ]),
      assets: JSON.stringify({
        css: [],
        js: []
      }),
      config: JSON.stringify({
        colors: {
          primary: '#3b82f6',
          secondary: '#64748b'
        }
      })
    }
  })

  console.log(`Created default theme: ${defaultTheme.name}`)

  // Create a sample blog post
  const samplePost = await prisma.blogPost.create({
    data: {
      title: 'Welcome to the Blog',
      slug: 'welcome-to-the-blog',
      content: `
        <p>Welcome to our new blog system! This post demonstrates the power of Liquid templating combined with Next.js.</p>
        
        <h2>Features</h2>
        <ul>
          <li>Rich text editing with TipTap</li>
          <li>Liquid templating for flexible theming</li>
          <li>Tag management</li>
          <li>Admin authentication</li>
        </ul>
        
        <p>We're excited to share more content with you soon!</p>
      `,
      excerpt: 'Welcome to our new blog system! This post demonstrates the power of Liquid templating combined with Next.js.',
      status: 'PUBLISHED',
      publishDate: new Date(),
      authorId: admin.id,
    }
  })

  console.log(`Created sample post: ${samplePost.title}`)

  // Create some sample tags
  const tags = await prisma.tag.createMany({
    data: [
      { name: 'Welcome', slug: 'welcome' },
      { name: 'Features', slug: 'features' },
      { name: 'Next.js', slug: 'nextjs' },
      { name: 'TypeScript', slug: 'typescript' },
    ]
  })

  console.log(`Created ${tags.count} sample tags`)

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
