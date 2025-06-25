"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea" // Will still use for basic structure
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Github, Linkedin, Mail, Phone, Send, ExternalLink, Loader2, Eye, Code2, AlertTriangle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"

const TurnstileWidget = dynamic(() => import("./turnstile-widget"), {
  ssr: false,
})

const CONTACT_EMAIL = "hello@zodworks.dev"
const ACTUAL_PHONE_NUMBER = "+1 (512) 923-8947" // Keep this secure, only revealed after check

// Use test keys for localhost/development, production keys for production
const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.includes('localhost')
)

const TURNSTILE_SITE_KEY = isLocalhost 
  ? "1x00000000000000000000AA" // Test key that always passes for localhost
  : (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA")

export default function Contact() {
  const { theme } = useTheme()
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [formMessage, setFormMessage] = useState("")
  const [emailValue, setEmailValue] = useState("")
  const [isEmailValid, setIsEmailValid] = useState(true)
  const [messageContent, setMessageContent] = useState("")
  const [isHumanVerified, setIsHumanVerified] = useState(false) // For Turnstile
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [showPhoneNumber, setShowPhoneNumber] = useState(false)
  const [humanCheckboxChecked, setHumanCheckboxChecked] = useState(false)
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string | undefined>(undefined)

  const formRef = useRef<HTMLFormElement>(null)

  // Load message from localStorage
  useEffect(() => {
    const savedMessage = localStorage.getItem("contactFormMessage")
    if (savedMessage) {
      setMessageContent(savedMessage)
    }
  }, [])

  // Save message to localStorage
  useEffect(() => {
    localStorage.setItem("contactFormMessage", messageContent)
  }, [messageContent])

  const validateEmail = (email: string) => {
    // Basic email validation regex
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmailValue(newEmail)
    setIsEmailValid(validateEmail(newEmail))
  }

  const resetTurnstileWidget = useCallback(() => {
    if (turnstileWidgetId && typeof window !== 'undefined' && window.turnstile) {
      window.turnstile.reset(turnstileWidgetId)
    }
  }, [turnstileWidgetId])

  const handleTurnstileSuccess = useCallback((token: string) => {
    setTurnstileToken(token)
    setIsHumanVerified(true)
    setFormMessage("") // Clear any previous errors
    setFormStatus("idle") // Reset form status
    
    // Update phone visibility if checkbox is also checked
    if (humanCheckboxChecked) {
      setShowPhoneNumber(true)
    }
  }, [humanCheckboxChecked])

  const handleTurnstileError = useCallback(() => {
    setIsHumanVerified(false)
    setTurnstileToken(null)
    setShowPhoneNumber(false) // Hide phone number on error
    setFormMessage("human verification failed. please try again.")
    setFormStatus("error")
    
    // Reset the widget after a short delay to allow user to retry
    setTimeout(() => {
      resetTurnstileWidget()
      setFormMessage("") // Clear error message after reset
      setFormStatus("idle")
    }, 2000)
  }, [resetTurnstileWidget])

  const handleTurnstileExpire = useCallback(() => {
    setIsHumanVerified(false)
    setTurnstileToken(null)
    setShowPhoneNumber(false)
    setFormMessage("verification expired. retrying...")
    resetTurnstileWidget()
  }, [resetTurnstileWidget])

  const handleHumanCheckboxChange = useCallback((checked: boolean | "indeterminate") => {
    setHumanCheckboxChecked(checked === true)
    
    if (checked === true && turnstileToken) {
      // Only allow showing phone if Turnstile also succeeded
      setShowPhoneNumber(true)
    } else {
      setShowPhoneNumber(false)
      if (checked === true && !turnstileToken) {
        setFormMessage("please complete the human verification challenge first.")
        setFormStatus("error")
      }
    }
  }, [turnstileToken])

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isEmailValid || emailValue.trim() === "") {
      setIsEmailValid(false)
      setFormMessage("please enter a valid email address.")
      return
    }
    if (!turnstileToken) {
      setFormMessage("please complete the human verification.")
      return
    }

    setFormStatus("submitting")
    setFormMessage("")
    const formData = new FormData(event.currentTarget)
    // Append turnstile token and message content manually
    formData.append("cf-turnstile-response", turnstileToken)
    formData.set("message", messageContent) // Ensure messageContent is used

    const data = Object.fromEntries(formData.entries())

    try {
      // **Actual Submission Logic with Turnstile Verification**
      const response = await fetch(`/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to send message.');
      }

      setFormStatus("success")
      setFormMessage("message sent successfully! jason will get back to you (maybe).")
      formRef.current?.reset()
      setEmailValue("")
      setMessageContent("")
      localStorage.removeItem("contactFormMessage")
      
      // Reset all Turnstile and verification states
      setIsHumanVerified(false)
      setTurnstileToken(null)
      setShowPhoneNumber(false)
      setHumanCheckboxChecked(false)
      resetTurnstileWidget()
    } catch (error: any) {
      setFormStatus("error")
      setFormMessage(
        error.message ||
          "failed to send message. try emailing jason directly. he'd probably fix this bug faster than i can.",
      )
      // Optionally reset Turnstile on error too
      // window.turnstile?.reset(); // If you have a ref to the widgetId
    }
  }

  return (
    <section id="contact" className="py-16">
      <h2 className="text-3xl font-bold font-mono text-center mb-10">
        <span className="text-primary normal-case">~$</span> mail -s "opportunity" {CONTACT_EMAIL}
      </h2>
      <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-10 p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold font-mono mb-2 text-accent-purple">get in touch</h3>
            <p className="text-muted-foreground">always open to new projects, ideas, or just a chat.</p>
          </div>
          <div className="space-y-3">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-5 w-5 mr-3 text-primary" /> {CONTACT_EMAIL}
            </a>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="human-check-phone"
                  onCheckedChange={handleHumanCheckboxChange}
                  disabled={!turnstileToken && process.env.NODE_ENV === "production"}
                />
                <Label htmlFor="human-check-phone" className="text-sm text-muted-foreground">
                  i am human (reveals phone)
                </Label>
              </div>
              {showPhoneNumber && turnstileToken && (
                <a
                  href={`tel:${ACTUAL_PHONE_NUMBER.replace(/\s|$$|$$|-/g, "")}`}
                  className="flex items-center text-muted-foreground hover:text-primary transition-colors pl-7" // Indent revealed phone
                >
                  <Phone className="h-5 w-5 mr-3 text-primary" /> {ACTUAL_PHONE_NUMBER}
                </a>
              )}
            </div>

            <a
              href="https://github.com/zudsniper"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-5 w-5 mr-3 text-primary" /> github.com/zudsniper
            </a>
            <a
              href="https://linkedin.com/in/jason-mcelhenney"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin className="h-5 w-5 mr-3 text-primary" /> linkedin.com/in/jason-mcelhenney
            </a>
            <a
              href="https://zodworks.dev" // Updated domain
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="h-5 w-5 mr-3 text-primary" /> zodworks.dev
            </a>
            <a
              href="https://jasonmcelhenney.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="h-5 w-5 mr-3 text-primary" /> jasonmcelhenney.com (redirects here)
            </a>
          </div>
        </div>
        <form ref={formRef} className="space-y-4" onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" name="name" placeholder="Jason McElhenney" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Your Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={emailValue}
                onChange={handleEmailChange}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="message">Your Message</Label>
            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-auto">
                <TabsTrigger value="write" className="font-mono">
                  <Code2 className="h-4 w-4 mr-2" />
                  write
                </TabsTrigger>
                <TabsTrigger value="preview" className="font-mono">
                  <Eye className="h-4 w-4 mr-2" />
                  preview
                </TabsTrigger>
              </TabsList>
              <TabsContent value="write">
                <Textarea
                  id="message"
                  name="message_hidden" // Name changed so it's not directly submitted if JS fails
                  rows={6}
                  required
                  placeholder="your message..."
                  className="font-mono mt-2 min-h-[150px]"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  disabled={formStatus === "submitting"}
                />
              </TabsContent>
              <TabsContent value="preview">
                <div className="prose prose-sm dark:prose-invert min-h-[150px] mt-2 rounded-md border p-3 bg-muted/50 overflow-auto">
                  {messageContent ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{messageContent}</ReactMarkdown>
                  ) : (
                    <p className="text-muted-foreground italic">preview will appear here...</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-md border border-accent-yellow/50 bg-accent-yellow/10 text-accent-yellow text-xs flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong className="font-semibold normal-case">note:</strong> human verification is required to send a
                message or view phone number.
              </span>
            </div>
            <TurnstileWidget
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={handleTurnstileSuccess}
              onError={handleTurnstileError}
              onExpire={handleTurnstileExpire}
              theme={theme === "dark" ? "dark" : "light"}
              className="mx-auto w-min" // Center the widget
              onWidgetId={setTurnstileWidgetId}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono"
            disabled={formStatus === "submitting" || !isHumanVerified || !turnstileToken}
          >
            {formStatus === "submitting" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {formStatus === "submitting" ? "sending..." : "send message"}
          </Button>
          {formMessage && (
            <p
              className={`text-sm text-center ${
                formStatus === "success"
                  ? "text-green-500"
                  : formStatus === "error"
                    ? "text-destructive"
                    : "text-muted-foreground"
              }`}
            >
              {formMessage}
            </p>
          )}
        </form>
      </div>
    </section>
  )
}
