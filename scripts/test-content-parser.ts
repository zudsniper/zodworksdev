#!/usr/bin/env tsx

import { contentParser, loadBlogContent, syncContentToDatabase } from '../lib/content-parser'
import path from 'path'

async function testContentParser() {
  console.log('🧪 Testing Content Parser...\n')

  try {
    // Test 1: Parse individual file
    console.log('1️⃣ Testing individual file parsing...')
    const sampleFile = path.join(process.cwd(), 'content', 'blog', 'sample-post.md')
    const parsedContent = await contentParser.parseFile(sampleFile, { processLiquid: true })
    
    console.log('✅ Successfully parsed file:')
    console.log(`   Title: ${parsedContent.frontmatter.title}`)
    console.log(`   Slug: ${parsedContent.frontmatter.slug}`)
    console.log(`   Status: ${parsedContent.frontmatter.status}`)
    console.log(`   Tags: ${parsedContent.frontmatter.tags?.join(', ')}`)
    console.log(`   Has Liquid: ${parsedContent.content.includes('{{') || parsedContent.content.includes('{%')}`)
    console.log(`   Compiled: ${!!parsedContent.compiledContent}\n`)

    // Test 2: Load all blog content
    console.log('2️⃣ Testing bulk content loading...')
    const allBlogContent = await loadBlogContent()
    
    console.log(`✅ Loaded ${allBlogContent.length} blog posts:`)
    allBlogContent.forEach(content => {
      console.log(`   - ${content.frontmatter.title} (${content.frontmatter.status})`)
    })
    console.log()

    // Test 3: Content validation
    console.log('3️⃣ Testing content validation...')
    const validContent = allBlogContent.filter(content => {
      return content.frontmatter.title && 
             ['draft', 'published'].includes(content.frontmatter.status || 'draft')
    })
    
    console.log(`✅ ${validContent.length}/${allBlogContent.length} posts passed validation\n`)

    // Test 4: Liquid compilation check
    console.log('4️⃣ Testing Liquid compilation...')
    const liquidContent = allBlogContent.filter(content => 
      content.content.includes('{{') || content.content.includes('{%')
    )
    
    console.log(`✅ ${liquidContent.length} posts contain Liquid syntax`)
    liquidContent.forEach(content => {
      console.log(`   - ${content.frontmatter.title}: ${content.compiledContent ? 'Compiled ✅' : 'Failed ❌'}`)
    })
    console.log()

    console.log('🎉 All tests completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testContentParser()
}

export { testContentParser } 