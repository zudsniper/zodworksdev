import { Github } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  return (
    <footer className="border-t border-border/40 py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
        <p>&copy; {currentYear} Jason McElhenney. All rights reserved.</p>
        <p className="mt-1">Built with Next.js and Tailwind CSS. Inspired by the command line.</p>
        <div className="mt-3 flex items-center justify-center gap-1 text-xs">
          <span>This site is open source</span>
          <a 
            href="https://github.com/zudsniper/zodworksdev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors underline decoration-dotted underline-offset-2"
            aria-label="View source code on GitHub"
          >
            <Github className="h-3 w-3" />
            <span>view source</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
