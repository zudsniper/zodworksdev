#!/usr/bin/env tsx

import { syncContentToDatabase } from '../lib/content-parser'

async function syncContent() {
  console.log('🔄 Syncing file-based content to database...\n')

  try {
    // Sync blog content
    console.log('📝 Syncing blog content...')
    await syncContentToDatabase('blog')
    
    // Sync project content
    console.log('🚀 Syncing project content...')  
    await syncContentToDatabase('projects')
    
    console.log('\n✅ Content sync completed successfully!')
    console.log('💡 Your file-based content is now available in the database and will be served by the blog routes.')
    
  } catch (error) {
    console.error('❌ Content sync failed:', error)
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const type = args[0] as 'blog' | 'projects' | undefined

if (type && !['blog', 'projects'].includes(type)) {
  console.error('❌ Invalid content type. Use "blog" or "projects"')
  process.exit(1)
}

// Run sync
if (type) {
  console.log(`🔄 Syncing ${type} content to database...\n`)
  syncContentToDatabase(type)
    .then(() => {
      console.log(`\n✅ ${type} content sync completed successfully!`)
    })
    .catch(error => {
      console.error(`❌ ${type} content sync failed:`, error)
      process.exit(1)
    })
} else {
  syncContent()
} 