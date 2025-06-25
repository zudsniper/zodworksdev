"use client"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Github, Linkedin, Menu, X } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card" // Import HoverCard
import DiscordProfileTooltip from "./discord-profile-tooltip" // Import the new tooltip content component
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "#about", label: "about" },
  { href: "#skills", label: "skills" },
  { href: "#projects", label: "projects" },
  { href: "#experience", label: "experience" },
  { href: "#contact", label: "contact" },
]

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => setMounted(true), [])

  const headerTopClass = "top-0"

  if (!mounted) {
    // Simplified skeleton loader for header
    return (
      <header
        className={cn(
          "sticky z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16",
          headerTopClass,
        )}
      >
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-8 bg-muted rounded-md animate-pulse"></div> {/* Logo placeholder */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
            <div className="md:hidden h-8 w-8 bg-muted rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    )
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header
      className={cn(
        "sticky z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
        headerTopClass,
      )}
    >
      <div className="container relative flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <HoverCard openDelay={200} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Link href="/" className="flex items-center" aria-label="homepage">
              <Image
                src={theme === "dark" ? "/zod-logo-white.png" : "/zod-logo-black.png"}
                alt="site logo"
                width={32}
                height={32}
              />
            </Link>
          </HoverCardTrigger>
          <HoverCardContent
            side="bottom"
            align="start"
            className="w-auto p-0 border-none bg-transparent shadow-none" // Remove default HoverCard styling
          >
            <DiscordProfileTooltip theme={theme} />
          </HoverCardContent>
        </HoverCard>

        <nav className="hidden md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:flex md:items-center md:space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-1 sm:space-x-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="toggle theme">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <a href="https://github.com/zudsniper" target="_blank" rel="noopener noreferrer" aria-label="github">
            <Button variant="ghost" size="icon">
              <Github className="h-5 w-5" />
            </Button>
          </a>
          <a
            href="https://linkedin.com/in/jason-mcelhenney"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="linkedin"
          >
            <Button variant="ghost" size="icon">
              <Linkedin className="h-5 w-5" />
            </Button>
          </a>

          <div className="md:hidden">
            <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="open menu"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {navLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} onClick={() => setMobileMenuOpen(false)}>
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
