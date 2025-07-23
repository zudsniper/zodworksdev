interface CacheEntry<T> {
  data: T
  timestamp: number
  hits: number
  lastAccessed: number
  ttl?: number
}

interface CacheStats {
  hits: number
  misses: number
  evictions: number
  size: number
  hitRate: number
}

interface CacheOptions {
  maxSize?: number
  defaultTtl?: number
  enableStats?: boolean
  cleanupInterval?: number
}

/**
 * High-performance in-memory cache with TTL support and statistics
 */
class PerformanceCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private stats = { hits: 0, misses: 0, evictions: 0 }
  private options: Required<CacheOptions>
  private cleanupTimer?: NodeJS.Timeout

  constructor(options: CacheOptions = {}) {
    this.options = {
      maxSize: options.maxSize ?? 1000,
      defaultTtl: options.defaultTtl ?? 1000 * 60 * 60, // 1 hour
      enableStats: options.enableStats ?? true,
      cleanupInterval: options.cleanupInterval ?? 1000 * 60 * 5, // 5 minutes
    }

    if (this.options.cleanupInterval > 0) {
      this.startCleanupTimer()
    }
  }

  set(key: string, value: T, ttl?: number): void {
    const now = Date.now()
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: now,
      hits: 0,
      lastAccessed: now,
      ttl: ttl ?? this.options.defaultTtl,
    }

    // Evict if cache is full
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evictLeastRecentlyUsed()
    }

    this.cache.set(key, entry)
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    
    if (!entry) {
      if (this.options.enableStats) this.stats.misses++
      return undefined
    }

    const now = Date.now()
    
    // Check TTL
    if (entry.ttl && (now - entry.timestamp) > entry.ttl) {
      this.cache.delete(key)
      if (this.options.enableStats) this.stats.misses++
      return undefined
    }

    // Update access info
    entry.hits++
    entry.lastAccessed = now
    
    if (this.options.enableStats) this.stats.hits++
    return entry.data
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    // Check TTL
    if (entry.ttl && (Date.now() - entry.timestamp) > entry.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0, evictions: 0 }
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    }
  }

  private evictLeastRecentlyUsed(): void {
    let lruKey: string | undefined
    let lruTime = Date.now()

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed
        lruKey = key
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey)
      if (this.options.enableStats) this.stats.evictions++
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.options.cleanupInterval)
  }

  private cleanup(): void {
    const now = Date.now()
    const toDelete: string[] = []

    for (const [key, entry] of this.cache) {
      if (entry.ttl && (now - entry.timestamp) > entry.ttl) {
        toDelete.push(key)
      }
    }

    for (const key of toDelete) {
      this.cache.delete(key)
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.clear()
  }
}

/**
 * Template cache service with multiple cache layers and performance monitoring
 */
export class TemplateCacheService {
  private compiledTemplateCache: PerformanceCache<any>
  private renderedOutputCache: PerformanceCache<string>
  private performanceMetrics: Map<string, number[]> = new Map()
  private isEnabled: boolean

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production' || process.env.ENABLE_TEMPLATE_CACHE === 'true'
    
    this.compiledTemplateCache = new PerformanceCache({
      maxSize: 500,
      defaultTtl: 1000 * 60 * 60 * 24, // 24 hours for compiled templates
      enableStats: true,
    })

    this.renderedOutputCache = new PerformanceCache({
      maxSize: 1000,
      defaultTtl: 1000 * 60 * 15, // 15 minutes for rendered output
      enableStats: true,
    })
  }

  /**
   * Cache compiled template
   */
  setCompiledTemplate(templatePath: string, compiledTemplate: any): void {
    if (!this.isEnabled) return
    
    const cacheKey = `compiled:${templatePath}`
    this.compiledTemplateCache.set(cacheKey, compiledTemplate)
  }

  /**
   * Get cached compiled template
   */
  getCompiledTemplate(templatePath: string): any | undefined {
    if (!this.isEnabled) return undefined
    
    const cacheKey = `compiled:${templatePath}`
    return this.compiledTemplateCache.get(cacheKey)
  }

  /**
   * Cache rendered output with context-aware key
   */
  setRenderedOutput(templatePath: string, contextHash: string, output: string, ttl?: number): void {
    if (!this.isEnabled) return
    
    const cacheKey = `rendered:${templatePath}:${contextHash}`
    this.renderedOutputCache.set(cacheKey, output, ttl)
  }

  /**
   * Get cached rendered output
   */
  getRenderedOutput(templatePath: string, contextHash: string): string | undefined {
    if (!this.isEnabled) return undefined
    
    const cacheKey = `rendered:${templatePath}:${contextHash}`
    return this.renderedOutputCache.get(cacheKey)
  }

  /**
   * Generate context hash for cache key
   */
  generateContextHash(context: any): string {
    // Simple hash for context - in production, consider using a proper hash function
    const contextString = JSON.stringify(context, Object.keys(context).sort())
    let hash = 0
    for (let i = 0; i < contextString.length; i++) {
      const char = contextString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Record performance metrics
   */
  recordRenderTime(templatePath: string, renderTime: number): void {
    if (!this.isEnabled) return
    
    const metrics = this.performanceMetrics.get(templatePath) || []
    metrics.push(renderTime)
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift()
    }
    
    this.performanceMetrics.set(templatePath, metrics)
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): Record<string, any> {
    const stats = {
      compiledTemplates: this.compiledTemplateCache.getStats(),
      renderedOutput: this.renderedOutputCache.getStats(),
      renderTimes: {} as Record<string, any>,
      isEnabled: this.isEnabled,
    }

    // Calculate render time statistics
    for (const [templatePath, times] of this.performanceMetrics) {
      if (times.length === 0) continue
      
      const sorted = [...times].sort((a, b) => a - b)
      const avg = times.reduce((sum, time) => sum + time, 0) / times.length
      const median = sorted[Math.floor(sorted.length / 2)]
      const p95 = sorted[Math.floor(sorted.length * 0.95)]
      
      stats.renderTimes[templatePath] = {
        average: Math.round(avg * 100) / 100,
        median: Math.round(median * 100) / 100,
        p95: Math.round(p95 * 100) / 100,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        count: times.length,
      }
    }

    return stats
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidateByPattern(pattern: string): number {
    let invalidated = 0
    
    // Invalidate compiled templates
    for (const key of this.compiledTemplateCache['cache'].keys()) {
      if (key.includes(pattern)) {
        this.compiledTemplateCache.delete(key)
        invalidated++
      }
    }
    
    // Invalidate rendered outputs
    for (const key of this.renderedOutputCache['cache'].keys()) {
      if (key.includes(pattern)) {
        this.renderedOutputCache.delete(key)
        invalidated++
      }
    }
    
    return invalidated
  }

  /**
   * Invalidate all template caches
   */
  invalidateAll(): void {
    this.compiledTemplateCache.clear()
    this.renderedOutputCache.clear()
    this.performanceMetrics.clear()
  }

  /**
   * Invalidate caches for specific template
   */
  invalidateTemplate(templatePath: string): void {
    this.invalidateByPattern(templatePath)
  }

  /**
   * Get cache status and health
   */
  getHealthStatus(): { status: 'healthy' | 'warning' | 'error', details: any } {
    const compiledStats = this.compiledTemplateCache.getStats()
    const renderedStats = this.renderedOutputCache.getStats()
    
    const health = {
      status: 'healthy' as const,
      details: {
        enabled: this.isEnabled,
        compiledTemplates: compiledStats,
        renderedOutput: renderedStats,
        memoryUsage: {
          compiled: compiledStats.size,
          rendered: renderedStats.size,
        }
      }
    }

    // Warning conditions
    if (compiledStats.hitRate < 0.5 && compiledStats.hits + compiledStats.misses > 100) {
      health.status = 'warning'
      health.details.warning = 'Low cache hit rate for compiled templates'
    }
    
    if (renderedStats.hitRate < 0.3 && renderedStats.hits + renderedStats.misses > 100) {
      health.status = 'warning'
      health.details.warning = 'Low cache hit rate for rendered output'
    }

    return health
  }

  /**
   * Cleanup and destroy cache service
   */
  destroy(): void {
    this.compiledTemplateCache.destroy()
    this.renderedOutputCache.destroy()
    this.performanceMetrics.clear()
  }
}

// Singleton instance
export const templateCacheService = new TemplateCacheService()

// Cache performance monitoring utilities
export const withCacheMetrics = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  metricName: string
): T => {
  return (async (...args: any[]) => {
    const startTime = Date.now()
    try {
      const result = await fn(...args)
      const renderTime = Date.now() - startTime
      templateCacheService.recordRenderTime(metricName, renderTime)
      return result
    } catch (error) {
      const renderTime = Date.now() - startTime
      templateCacheService.recordRenderTime(`${metricName}:error`, renderTime)
      throw error
    }
  }) as T
}

export type { CacheStats, CacheOptions } 