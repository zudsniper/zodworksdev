import { NextRequest } from 'next/server'
import { jwtVerify, importX509 } from 'jose'
import { PrismaClient } from '@prisma/client/edge'

const TEAM_NAME = process.env.CLOUDFLARE_ACCESS_TEAM_NAME
const APPLICATION_AUD = process.env.CLOUDFLARE_ACCESS_APPLICATION_AUD

// Cache for Cloudflare's public keys
let publicKeys: any[] | null = null
let keysCacheTime = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

async function getCloudflarePublicKeys() {
  if (!TEAM_NAME) {
    throw new Error('CLOUDFLARE_ACCESS_TEAM_NAME environment variable is required')
  }
  
  const now = Date.now()
  
  // Use cached keys if still valid
  if (publicKeys && (now - keysCacheTime) < CACHE_DURATION) {
    return publicKeys
  }
  
  try {
    const response = await fetch(`https://${TEAM_NAME}.cloudflareaccess.com/cdn-cgi/access/certs`)
    const data = await response.json()
    
    publicKeys = data.keys
    keysCacheTime = now
    
    return publicKeys
  } catch (error) {
    console.error('Failed to fetch Cloudflare public keys:', error)
    return []
  }
}

export async function validateCloudflareAccess(request: NextRequest): Promise<{ isValid: boolean; email?: string }> {
  if (!TEAM_NAME || !APPLICATION_AUD) {
    console.error('Missing Cloudflare Access environment variables')
    return { isValid: false }
  }
  
  try {
    // Get the JWT token from the CF-Access-Jwt-Assertion header
    const token = request.headers.get('CF-Access-Jwt-Assertion')
    
    if (!token) {
      return { isValid: false }
    }
    
    // Get Cloudflare's public keys
    const keys = await getCloudflarePublicKeys()
    
    if (!keys || keys.length === 0) {
      return { isValid: false }
    }
    
    // Try to verify the token with each key
    for (const key of keys) {
      try {
        const publicKey = await importX509(key.x5c[0], 'RS256')
        
        const { payload } = await jwtVerify(token, publicKey, {
          issuer: `https://${TEAM_NAME}.cloudflareaccess.com`,
          audience: APPLICATION_AUD,
        })
        
        // Token is valid, extract email
        const email = payload.email as string
        
        return { isValid: true, email }
      } catch (keyError) {
        // Try next key
        continue
      }
    }
    
    return { isValid: false }
  } catch (error) {
    console.error('Error validating Cloudflare Access token:', error)
    return { isValid: false }
  }
}

// Simple session management (no database needed)
export function createSession(email: string) {
  return {
    user: {
      email,
      role: 'ADMIN' // Since only admins can access through Zero Trust
    }
  }
}

export async function getSession(request: NextRequest) {
  const validation = await validateCloudflareAccess(request)
  
  if (validation.isValid && validation.email) {
    return createSession(validation.email)
  }
  
  return null
}
