"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Github, Linkedin, Mail, Phone, Send, ExternalLink, Loader2, AlertTriangle, Maximize2, Minimize2, AlertCircle, AlertTriangleIcon, Circle, CircleCheck } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels"
import { Textarea } from "@/components/ui/textarea"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"

const TurnstileWidget = dynamic(() => import("./turnstile-widget"), {
  ssr: false,
})

const CONTACT_EMAIL = "hello@zodworks.dev"
const ACTUAL_PHONE_NUMBER = "+1 (512) 923-8947" // Keep this secure, only revealed after check

// Dev bypass flag (set NEXT_PUBLIC_TURNSTILE_BYPASS=1 to bypass)
const TURNSTILE_BYPASS = process.env.NEXT_PUBLIC_TURNSTILE_BYPASS === '1'

// Use environment variable to determine if we're in development
const TURNSTILE_SITE_KEY = process.env.NODE_ENV === 'development' 
  ? "1x00000000000000000000AA" // Test key that always passes for localhost
  : (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA")

// Debug logging
if (typeof window !== 'undefined') {
  console.log('Turnstile Config:', {
    NODE_ENV: process.env.NODE_ENV,
    TURNSTILE_SITE_KEY,
    TURNSTILE_BYPASS,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  })
}

export default function Contact() {
  const { theme } = useTheme()
  const isMobile = useIsMobile()
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [formMessage, setFormMessage] = useState("")
  const [emailValue, setEmailValue] = useState("")
  const [isEmailValid, setIsEmailValid] = useState(true)
  const [messageContent, setMessageContent] = useState("")
  const [isHumanVerified, setIsHumanVerified] = useState(false) // For Turnstile
  // If bypass enabled, auto-set verification
  useEffect(() => {
    if (TURNSTILE_BYPASS) {
      setIsHumanVerified(true)
      setFormMessage("")
    }
  }, [])
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [showPhoneNumber, setShowPhoneNumber] = useState(false)
  const [humanCheckboxChecked, setHumanCheckboxChecked] = useState(false)
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string | undefined>(undefined)
  const [isExpanded, setIsExpanded] = useState(false)
  const [priority, setPriority] = useState<string>("normal")

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
      toast.error("please enter a valid email address.")
      return
    }
    if (!TURNSTILE_BYPASS && !turnstileToken) {
      toast.error("please complete the human verification.")
      return
    }
    if (!messageContent.trim()) {
      toast.error("please enter a message.")
      return
    }

    setFormStatus("submitting")
    setFormMessage("")
    const formData = new FormData(event.currentTarget)
    // Append turnstile token and message content manually
    // Use bypass token if bypass is enabled
    const tokenToUse = TURNSTILE_BYPASS ? "bypass-token" : turnstileToken
    if (tokenToUse) {
      formData.append("cf-turnstile-response", tokenToUse)
    }
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
      toast.success("message sent successfully! jason will get back to you soon.")
      
      // Animate collapse
      setIsExpanded(false)
      
      // Reset form after animation
      setTimeout(() => {
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
        setFormStatus("idle")
      }, 500)
    } catch (error: any) {
      setFormStatus("error")
      toast.error(
        error.message ||
          "failed to send message. try emailing jason directly.",
      )
    }
  }

  const handleEditorFocus = useCallback(() => {
    // Don't auto-expand on focus - let user click the button
  }, [])

  const handleEditorBlur = useCallback(() => {
    // Don't auto-collapse on blur - let user control it
  }, [])

  return (
    <section id="contact" className="py-16">
      <h2 className="text-3xl font-bold font-mono text-center mb-10">
        <span className="text-primary normal-case">~$</span> mail -s "opportunity" {CONTACT_EMAIL}
      </h2>
      <AnimatePresence mode="wait">
        {isExpanded && !isMobile ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="max-w-6xl mx-auto p-6 rounded-lg border bg-card text-card-foreground shadow-lg"
          >
            <div className="space-y-6">
              {/* Header info moved to top when expanded */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold font-mono mb-2 text-accent-purple">get in touch</h3>
                  <p className="text-muted-foreground">always open to new projects, ideas, or just a chat.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minimize2 className="h-4 w-4 mr-1" /> minimize
                </Button>
              </div>
              
              {/* Full-width form */}
              <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-4">
                {/* Required fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="name">Your Name</Label>
                    <Input id="name" name="name" placeholder="John Doe" required />
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
                
                {/* Optional business fields and priority */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="business-name">
                      Business Name <span className="text-muted-foreground text-xs">(optional)</span>
                    </Label>
                    <Input 
                      id="business-name" 
                      name="businessName" 
                      placeholder="Acme Corp" 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="business-url">
                      Business URL <span className="text-muted-foreground text-xs">(optional)</span>
                    </Label>
                    <Input 
                      id="business-url" 
                      name="businessUrl" 
                      type="url"
                      placeholder="https://example.com" 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="priority">Priority</Label>
                    <Select name="priority" value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">
                          <div className="flex items-center gap-2">
                            <AlertTriangleIcon className="h-4 w-4 text-red-500" />
                            <span>Urgent</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <span>High</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="normal">
                          <div className="flex items-center gap-2">
                            <Circle className="h-4 w-4 text-blue-500" />
                            <span>Normal</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <CircleCheck className="h-4 w-4 text-gray-500" />
                            <span>Low</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Editor panels */}
                <div className="space-y-2">
                  <Label>Inquiry</Label>
                  <PanelGroup direction="horizontal" className="h-[500px] rounded-lg border">
                    <Panel defaultSize={50} minSize={30}>
                      <div className="h-full flex flex-col">
                        <div className="px-3 py-2 border-b bg-muted/50">
                          <span className="text-xs font-mono text-muted-foreground">write (markdown supported)</span>
                        </div>
                        <div className="flex-1 overflow-auto">
                          <Textarea
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            disabled={formStatus === "submitting"}
                            placeholder="type your message using markdown...\n\n# heading\n**bold** *italic*\n```code```\n- list item"
                            className="border-0 rounded-none h-full resize-none font-mono text-sm focus:outline-none focus:ring-0 p-3"
                            autoFocus
                            onFocus={handleEditorFocus}
                            onBlur={handleEditorBlur}
                          />
                        </div>
                      </div>
                    </Panel>
                    <PanelResizeHandle className="w-1 bg-border hover:bg-primary/20 transition-colors" />
                    <Panel defaultSize={50} minSize={30}>
                      <div className="h-full flex flex-col">
                        <div className="px-3 py-2 border-b bg-muted/50">
                          <span className="text-xs font-mono text-muted-foreground">preview</span>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            {messageContent ? (
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '')
                                    return !inline && match ? (
                                      <SyntaxHighlighter
                                        language={match[1]}
                                        style={oneDark}
                                        customStyle={{
                                          margin: 0,
                                          borderRadius: '0.375rem',
                                          fontSize: '0.875rem',
                                        }}
                                        {...props}
                                      >
                                        {String(children).replace(/\n$/, '')}
                                      </SyntaxHighlighter>
                                    ) : (
                                      <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
                                        {children}
                                      </code>
                                    )
                                  },
                                  h1: ({ children }) => <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>,
                                  h2: ({ children }) => <h2 className="text-xl font-semibold mt-3 mb-2">{children}</h2>,
                                  h3: ({ children }) => <h3 className="text-lg font-medium mt-2 mb-1">{children}</h3>,
                                  p: ({ children }) => <p className="mb-2">{children}</p>,
                                  ul: ({ children }) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
                                  blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic my-2">
                                      {children}
                                    </blockquote>
                                  ),
                                }}
                              >
                                {messageContent}
                              </ReactMarkdown>
                            ) : (
                              <p className="text-muted-foreground italic">preview will appear here...</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Panel>
                  </PanelGroup>
                </div>
                
                {/* Turnstile and submit */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {!TURNSTILE_BYPASS ? (
                      <TurnstileWidget
                        siteKey={TURNSTILE_SITE_KEY}
                        onSuccess={handleTurnstileSuccess}
                        onError={handleTurnstileError}
                        onExpire={handleTurnstileExpire}
                        theme={theme === "dark" ? "dark" : "light"}
                        onWidgetId={setTurnstileWidgetId}
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        (Turnstile bypassed in dev mode)
                      </div>
                    )}
                    {formMessage && (
                      <p className={`text-sm ${formStatus === "error" ? "text-destructive" : "text-muted-foreground"}`}>
                        {formMessage}
                      </p>
                    )}
                  </div>
                  <Button type="submit" disabled={formStatus === "submitting" || !isHumanVerified}>
                    {formStatus === "submitting" ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> sending...</>
                    ) : (
                      <><Send className="h-4 w-4 mr-2" /> send message</>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ 
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="max-w-3xl mx-auto grid md:grid-cols-2 gap-10 p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
          >
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
          {/* Required fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
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
          
          {/* Optional fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="business-name">
                Business <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input 
                id="business-name" 
                name="businessName" 
                placeholder="Acme Corp" 
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <AlertTriangleIcon className="h-4 w-4 text-red-500" />
                      <span>Urgent</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <span>High</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="normal">
                    <div className="flex items-center gap-2">
                      <Circle className="h-4 w-4 text-blue-500" />
                      <span>Normal</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <CircleCheck className="h-4 w-4 text-gray-500" />
                      <span>Low</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="message">Inquiry</Label>
              {!isMobile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Maximize2 className="h-4 w-4 mr-1" /> expand editor
                </Button>
              )}
            </div>
            
            <Textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              disabled={formStatus === "submitting"}
              placeholder="describe your project, question, or idea...\n\nmarkdown supported: **bold** *italic* # heading ```code```"
              className="font-mono text-sm min-h-[150px]"
              onFocus={handleEditorFocus}
              onBlur={handleEditorBlur}
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-md border border-accent-yellow/50 bg-accent-yellow/10 text-accent-yellow text-xs flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong className="font-semibold normal-case">note:</strong> human verification is required to send a
                message or view phone number.
              </span>
            </div>
            {!TURNSTILE_BYPASS && (
              <TurnstileWidget
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={handleTurnstileSuccess}
                onError={handleTurnstileError}
                onExpire={handleTurnstileExpire}
                theme={theme === "dark" ? "dark" : "light"}
                className="mx-auto w-min" // Center the widget
                onWidgetId={setTurnstileWidgetId}
              />
            )}
            {TURNSTILE_BYPASS && (
              <div className="text-center text-sm text-muted-foreground">
                (Turnstile bypassed in dev mode)
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono"
            disabled={formStatus === "submitting" || (!isHumanVerified && !TURNSTILE_BYPASS) || (!turnstileToken && !TURNSTILE_BYPASS)}
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
        </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
