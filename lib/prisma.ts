import { PrismaClient } from '@prisma/client/edge'
import { PrismaD1 } from '@prisma/adapter-d1'

// Global instance cache
let globalPrismaClient: PrismaClient | null = null

// Check if we're running in Cloudflare Workers
function isCloudflareWorkers(): boolean {
  return typeof (globalThis as any).Cloudflare !== 'undefined'
}

// Check if we're in a build environment
function isBuildTime(): boolean {
  return process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build'
}

// Get D1 database from various sources
function getD1Database(): any {
  // Try various ways to access the D1 binding
  
  // Method 1: Check if DB is available on globalThis (most common in CF Workers)
  if ((globalThis as any).DB) {
    console.log('Found DB on globalThis')
    return (globalThis as any).DB
  }
  
  // Method 2: Check process.env.DB (might be set by opennextjs-cloudflare)
  if (process.env.DB) {
    console.log('Found DB in process.env')
    return process.env.DB
  }
  
  // Method 3: Check Cloudflare env (if available)
  if (isCloudflareWorkers()) {
    const cf = (globalThis as any).Cloudflare
    if (cf && cf.env && cf.env.DB) {
      console.log('Found DB in Cloudflare.env')
      return cf.env.DB
    }
  }
  
  return null
}

// Dynamic import for Node.js Prisma client during build
async function getNodePrismaClient(): Promise<any> {
  const { PrismaClient: NodePrismaClient } = await import('@prisma/client')
  return new NodePrismaClient({
    datasourceUrl: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

// Function to get Prisma client with proper environment detection
export function getPrismaClient(env?: any): PrismaClient {
  // If env is explicitly passed, try to use D1 from it
  if (env?.DB) {
    console.log('Using D1 database adapter from env parameter')
    const adapter = new PrismaD1(env.DB)
    return new PrismaClient({
      adapter,
      log: ['query'],
    })
  }
  
  // Try to get D1 from the environment
  const d1Database = getD1Database()
  
  if (d1Database) {
    console.log('Using D1 database adapter from environment')
    const adapter = new PrismaD1(d1Database)
    return new PrismaClient({
      adapter,
      log: ['query'],
    })
  }
  
  // During build time, return a client that will be replaced
  if (isBuildTime()) {
    console.log('Build time detected - using placeholder client')
    // Return a dummy client for build time
    return {} as PrismaClient
  }
  
  // Fall back to local SQLite for development
  console.log('Using local SQLite database for development')
  return new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

// Build-time safe Prisma client getter
export async function getBuildSafePrismaClient(): Promise<any> {
  if (isBuildTime()) {
    console.log('Using Node.js Prisma client for build')
    return await getNodePrismaClient()
  }
  return getPrismaClient()
}

// Lazy-loading prisma client - only initializes when first accessed
export function getPrisma(env?: any): PrismaClient {
  if (!globalPrismaClient) {
    globalPrismaClient = getPrismaClient(env)
  }
  return globalPrismaClient
}

// Default export for backward compatibility - but this might cause issues in CF Workers
// We'll keep it for now but recommend using getPrisma() instead
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    // Lazy initialize the client when any property is accessed
    if (!globalPrismaClient) {
      globalPrismaClient = getPrismaClient()
    }
    return (globalPrismaClient as any)[prop]
  }
})

// Initialize function to be called with environment context
export function initializePrisma(env: any): PrismaClient {
  const client = getPrismaClient(env)
  globalPrismaClient = client
  return client
}
