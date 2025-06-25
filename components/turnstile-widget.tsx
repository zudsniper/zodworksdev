"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"

interface TurnstileWidgetProps {
  siteKey: string
  onSuccess: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  theme?: "light" | "dark" | "auto"
  className?: string
  onWidgetId?: (widgetId: string | undefined) => void
}

declare global {
  interface Window {
    turnstile: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          "error-callback"?: () => void
          "expired-callback"?: () => void
          theme?: "light" | "dark" | "auto"
        },
      ) => string | undefined
      reset: (widgetId?: string) => void
      remove: (widgetId: string) => void
      getResponse: (widgetId?: string) => string | undefined
    }
    turnstileLoadCallbacks?: Array<() => void>
  }
}

// Load script once globally
if (typeof window !== "undefined" && !document.querySelector('script[src*="turnstile"]')) {
  const script = document.createElement("script")
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
  script.async = true
  script.defer = true
  document.head.appendChild(script)
}

const TurnstileWidget = React.forwardRef<HTMLDivElement, TurnstileWidgetProps>(({
  siteKey,
  onSuccess,
  onError,
  onExpire,
  theme = "auto",
  className = "",
  onWidgetId,
}, forwardedRef) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | undefined>(undefined)
  const [isReady, setIsReady] = useState(false)

  // Check if Turnstile is loaded
  useEffect(() => {
    const checkTurnstile = () => {
      if (typeof window.turnstile !== "undefined") {
        setIsReady(true)
        return true
      }
      return false
    }

    // Check immediately
    if (checkTurnstile()) return

    // Poll for Turnstile to be ready
    const interval = setInterval(() => {
      if (checkTurnstile()) {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Render widget when ready
  useEffect(() => {
    if (!isReady || !containerRef.current || widgetIdRef.current) {
      return
    }

    console.log("DEBUG: Rendering Turnstile with sitekey:", siteKey)

    try {
      const id = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          console.log("DEBUG: Turnstile success callback triggered")
          onSuccess(token)
        },
        "error-callback": () => {
          console.log("DEBUG: Turnstile error callback triggered")
          onError?.()
        },
        "expired-callback": () => {
          console.log("DEBUG: Turnstile expired callback triggered")
          onExpire?.()
        },
        theme: theme,
      })

      if (id) {
        widgetIdRef.current = id
        onWidgetId?.(id)
        console.log("DEBUG: Turnstile widget rendered with ID:", id)
      }
    } catch (error) {
      console.error("DEBUG: Failed to render Turnstile widget:", error)
      onError?.()
    }

    // Cleanup function
    return () => {
      if (widgetIdRef.current && typeof window.turnstile !== "undefined") {
        try {
          console.log("DEBUG: Removing Turnstile widget:", widgetIdRef.current)
          window.turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = undefined
        } catch (error) {
          console.error("DEBUG: Failed to remove Turnstile widget:", error)
        }
      }
    }
  }, [isReady, siteKey, theme]) // Removed callback dependencies to prevent re-renders

  return (
    <div ref={containerRef} className={className}>
      {/* Turnstile widget will render here */}
    </div>
  )
})

TurnstileWidget.displayName = "TurnstileWidget"

export default TurnstileWidget
