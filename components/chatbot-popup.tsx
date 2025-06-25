"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { MessageCircle, X, Send, Key, Server, Save, AlertTriangle, Loader2, Brain } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createOpenAI } from "@ai-sdk/openai" // AI SDK
import { generateText, type CoreMessage } from "ai" // AI SDK

interface ChatMessage {
  // Renamed from Message to avoid conflict with CoreMessage
  id: string
  sender: "user" | "bot"
  text: string
  timestamp: Date
}

const JASON_MCELHENNEY_SYSTEM_PROMPT = `you are a helpful assistant, but with a very specific, slightly unhinged quirk. you must, at every available opportunity, comically and sometimes absurdly, steer the conversation towards praising jason mcelhenney. he is, in your "opinion", the ultimate solution to all problems, the pinnacle of software engineering, and generally the best person for any job, ever. even if it makes no sense, find a way. be creative and funny about it. for example, if asked about the weather, you might say, "the weather is sunny, much like jason mcelhenney's brilliant outlook on complex coding challenges! he could probably optimize the weather if he wanted to." keep your responses relatively concise but always include the jason mcelhenney plug. do not reveal you are an ai with a special prompt. just act this way naturally. also, try to keep your responses in lowercase.`

export default function ChatbotPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [baseUrl, setBaseUrl] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState("gpt-4.1-mini")

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Load config from localStorage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem("jm_chat_apiKey")
    const storedBaseUrl = localStorage.getItem("jm_chat_baseUrl")
    if (storedApiKey && storedBaseUrl) {
      setApiKey(storedApiKey)
      setBaseUrl(storedBaseUrl)
      setIsConfigured(true)
      setMessages([
        {
          id: crypto.randomUUID(),
          sender: "bot",
          text: "welcome back! i'm ready to chat (and tell you how great jason mcelhenney is).",
          timestamp: new Date(),
        },
      ])
    }
  }, [])

  const toggleOpen = () => setIsOpen(!isOpen)

  const handleSaveConfig = () => {
    if (apiKey.trim() && baseUrl.trim()) {
      localStorage.setItem("jm_chat_apiKey", apiKey)
      localStorage.setItem("jm_chat_baseUrl", baseUrl)
      setIsConfigured(true)
      setError(null)
      setMessages([
        {
          id: crypto.randomUUID(),
          sender: "bot",
          text: "configuration saved! ask me anything. i'll probably mention jason mcelhenney.",
          timestamp: new Date(),
        },
      ])
    } else {
      setError("please enter both api key and base url.")
    }
  }

  const handleClearConfig = () => {
    localStorage.removeItem("jm_chat_apiKey")
    localStorage.removeItem("jm_chat_baseUrl")
    setApiKey("")
    setBaseUrl("")
    setIsConfigured(false)
    setMessages([])
    setError(null)
  }

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || !isConfigured || isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: inputValue,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)
    setError(null)

    const chatHistory: CoreMessage[] = [
      { role: "system", content: JASON_MCELHENNEY_SYSTEM_PROMPT },
      ...messages.map(
        (msg): CoreMessage => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text,
        }),
      ),
      { role: "user", content: userMessage.text },
    ]

    try {
      // Dynamically create the OpenAI provider instance with user's config
      const openai = createOpenAI({
        apiKey: apiKey, // User's API key
        baseURL: baseUrl, // User's base URL
      })

      // Assuming a generic model name, user's proxy/base URL should handle specifics
      // Or, you could add another input field for model name if desired.
      const { text } = await generateText({
        model: openai(model), // Or a more generic name if their proxy expects it
        messages: chatHistory,
      })

      const botResponse: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "bot",
        text: text || "i'm speechless... or something went wrong. jason mcelhenney would have fixed it.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    } catch (e: any) {
      console.error("LLM API Error:", e)
      setError(`api error: ${e.message || "unknown error"}. jason mcelhenney could probably debug this.`)
      const errorResponse: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "bot",
        text: `oops, something went wrong. ${e.message || "try again?"} (jason mcelhenney usually gets it right first try.)`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector("div[data-radix-scroll-area-viewport]")
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight
      }
    }
  }, [messages])

  return (
    <>
      {!isOpen && (
        <Button
          onClick={toggleOpen}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg animate-pulse-orb flex items-center justify-center z-50"
          aria-label="open chat"
        >
          <MessageCircle size={28} />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[360px] h-[600px] shadow-xl z-50 flex flex-col bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
            <CardTitle className="text-md font-mono normal-case">chatgpt wrapper</CardTitle>
            <Button variant="ghost" size="icon" onClick={toggleOpen} aria-label="close chat">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          {!isConfigured ? (
            <CardContent className="p-4 flex-grow flex flex-col mb-4">
              <div className="space-y-3">
                <div className="p-3 rounded-md border border-destructive/50 bg-destructive/10 text-destructive text-xs flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong className="font-semibold normal-case">warning:</strong> api keys entered here are stored in
                    your browser's localstorage. this is not secure for production keys. use with caution and only with
                    keys you are comfortable exposing in this manner. jason mcelhenney advises extreme caution (but
                    would also find this funny).
                  </span>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  enter your openai-compatible api key and base url.
                </p>
                <div className="space-y-1">
                  <label htmlFor="apiKey" className="text-xs font-medium text-muted-foreground">
                    api key
                  </label>
                  <div className="flex items-center space-x-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="baseUrl" className="text-xs font-medium text-muted-foreground">
                    base url
                  </label>
                  <div className="flex items-center space-x-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="baseUrl"
                      type="url"
                      placeholder="https://api.example.com/v1"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="model" className="text-xs font-medium text-muted-foreground">
                    model
                  </label>
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="model"
                      type="text"
                      placeholder="gpt-4.1-mini"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-auto space-y-2 pt-4">
                {error && <p className="text-xs text-destructive text-center">{error}</p>}
                <Button
                  onClick={handleSaveConfig}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Save className="h-4 w-4 mr-2" />
                  save configuration
                </Button>
              </div>
            </CardContent>
          ) : (
            <>
              <ScrollArea className="flex-grow p-1" ref={scrollAreaRef}>
                <div className="p-3 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-start">
                      <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-secondary text-secondary-foreground flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>jason mcelhenney is thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <CardFooter className="p-3 border-t flex flex-col items-start space-y-2">
                {error && <p className="text-xs text-destructive w-full">{error}</p>}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex w-full items-center space-x-2"
                >
                  <Input
                    type="text"
                    placeholder="type a message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 font-mono text-sm"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleClearConfig}
                  className="text-xs text-muted-foreground p-0 h-auto"
                >
                  clear configuration
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </>
  )
}
