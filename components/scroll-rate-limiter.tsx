"use client"

import { useEffect, useRef, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

const MIN_FIDGET_SCROLL_Y = 80 // Min pixels for a scroll segment to be considered part of a fidget
const MIN_FIDGET_VELOCITY = 1.2 // Min pixels/ms for a scroll segment
const REQUIRED_FIDGET_POINTS = 3 // How many "fidgety" scrolls (quick, opposite/changed direction) to trigger
const FIDGET_RESET_TIMEOUT = 750 // If no fidgety scroll for this long, reset points
const SLOWDOWN_DURATION = 3000 // 3 seconds
const SLOWDOWN_FACTOR = 4 // Scroll will be 4x slower
const EFFECT_COOLDOWN_PERIOD = 15000 // 15 seconds cooldown for the entire effect

export default function ScrollRateLimiter() {
  const { toast } = useToast()

  const lastScrollY = useRef(0)
  const lastScrollTime = useRef(0)
  const lastScrollDirection = useRef<"up" | "down" | null>(null)
  const fidgetPoints = useRef(0)
  const fidgetResetTimer = useRef<NodeJS.Timeout | null>(null)

  const isSlowingScroll = useRef(false)
  const slowdownTimer = useRef<NodeJS.Timeout | null>(null)
  const effectCooldownTimer = useRef<NodeJS.Timeout | null>(null)

  const handleWheelDuringSlowdown = useCallback((event: WheelEvent) => {
    if (isSlowingScroll.current) {
      event.preventDefault()
      window.scrollBy(0, event.deltaY / SLOWDOWN_FACTOR)
    }
  }, [])

  useEffect(() => {
    if (isSlowingScroll.current) {
      window.addEventListener("wheel", handleWheelDuringSlowdown, { passive: false })
    } else {
      window.removeEventListener("wheel", handleWheelDuringSlowdown)
    }
    // Cleanup function for the wheel listener when component unmounts or isSlowingScroll changes
    return () => {
      window.removeEventListener("wheel", handleWheelDuringSlowdown)
    }
  }, [handleWheelDuringSlowdown]) // Dependency on isSlowingScroll.current is implicit via its effect on listener attachment

  useEffect(() => {
    const handleScroll = () => {
      if (isSlowingScroll.current || effectCooldownTimer.current) {
        // If actively slowing or on global cooldown, don't process for new trigger
        lastScrollY.current = window.scrollY
        lastScrollTime.current = performance.now()
        return
      }

      const currentY = window.scrollY
      const currentTime = performance.now()

      const deltaY = currentY - lastScrollY.current
      const deltaTime = currentTime - lastScrollTime.current

      if (deltaTime === 0) return // Avoid division by zero

      const velocity = Math.abs(deltaY) / deltaTime
      const currentDirection = deltaY > 0 ? "down" : deltaY < 0 ? "up" : null

      if (fidgetResetTimer.current) {
        clearTimeout(fidgetResetTimer.current)
      }
      fidgetResetTimer.current = setTimeout(() => {
        fidgetPoints.current = 0
        lastScrollDirection.current = null
      }, FIDGET_RESET_TIMEOUT)

      if (currentDirection && Math.abs(deltaY) > MIN_FIDGET_SCROLL_Y && velocity > MIN_FIDGET_VELOCITY) {
        if (lastScrollDirection.current && currentDirection !== lastScrollDirection.current) {
          fidgetPoints.current++
        } else if (!lastScrollDirection.current) {
          // First significant scroll can count as 1 point
          fidgetPoints.current = 1
        }
        lastScrollDirection.current = currentDirection
      } else if (velocity < MIN_FIDGET_VELOCITY / 2) {
        // If scrolling slows significantly, reset points faster
        fidgetPoints.current = 0
        lastScrollDirection.current = null
        if (fidgetResetTimer.current) clearTimeout(fidgetResetTimer.current)
      }

      if (fidgetPoints.current >= REQUIRED_FIDGET_POINTS) {
        toast({
          variant: "destructive",
          title: "rate limit exceeded",
          description: '{"status": 429, "message": "you are being rate limited."}',
        })

        isSlowingScroll.current = true
        // Manually trigger re-evaluation of the wheel listener effect
        // This is a bit of a hack; ideally, a state variable would trigger this.
        // For simplicity here, we rely on the next render cycle or a forced update if needed.
        // A better way: set a state variable that `isSlowingScroll.current` is derived from or syncs with.
        // For now, let's assume the useEffect for wheel listener will pick up the change.
        // To be safe, we can explicitly add/remove here, but that duplicates logic.
        // The existing useEffect for the wheel listener should handle it.
        window.addEventListener("wheel", handleWheelDuringSlowdown, { passive: false })

        if (slowdownTimer.current) clearTimeout(slowdownTimer.current)
        slowdownTimer.current = setTimeout(() => {
          isSlowingScroll.current = false
          window.removeEventListener("wheel", handleWheelDuringSlowdown) // Ensure removal
        }, SLOWDOWN_DURATION)

        fidgetPoints.current = 0 // Reset points
        lastScrollDirection.current = null
        if (fidgetResetTimer.current) clearTimeout(fidgetResetTimer.current)

        // Start global cooldown for the effect
        if (effectCooldownTimer.current) clearTimeout(effectCooldownTimer.current)
        effectCooldownTimer.current = setTimeout(() => {
          effectCooldownTimer.current = null
        }, EFFECT_COOLDOWN_PERIOD)
      }

      lastScrollY.current = currentY
      lastScrollTime.current = currentTime
    }

    // Initialize last scroll values
    lastScrollY.current = window.scrollY
    lastScrollTime.current = performance.now()

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("wheel", handleWheelDuringSlowdown)
      if (fidgetResetTimer.current) clearTimeout(fidgetResetTimer.current)
      if (slowdownTimer.current) clearTimeout(slowdownTimer.current)
      if (effectCooldownTimer.current) clearTimeout(effectCooldownTimer.current)
    }
  }, [toast, handleWheelDuringSlowdown]) // handleWheelDuringSlowdown is stable

  return null
}
