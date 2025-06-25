"use client"
import { Github } from "lucide-react"

const GITHUB_USERNAME = "zudsniper"

export default function GithubContributions() {
  // Using a theme that should be transparent or dark-friendly.
  // `transparent` might not be supported by all services, `dracula` or `gruvbox` are good dark alternatives.
  // rshah.org themes: https://github.com/2016rshah/ghchart-themes/tree/master/themes
  // Using 'transparent' if available, otherwise a dark theme.
  // For rshah.org, specific color codes can be used for more control e.g. ?bg=181A1F&color=B0B8C5&line=FFB366&point=FFB366
  // Let's try to make it blend with the --card background.
  const graphUrl = `https://ghchart.rshah.org/${GITHUB_USERNAME}?bg=181A1F&color=B0B8C5&line=FFB366&point=FFB366` // Using HSL for dark bg, text will be auto.

  return (
    <section id="github-contributions" className="pt-12 pb-16">
      {" "}
      {/* Adjusted padding as it's part of 'whoami' flow */}
      {/* Header removed */}
      <div className="flex justify-center">
        {" "}
        {/* Removed p-4, border, bg-card, shadow-sm */}
        <a
          href={`https://github.com/${GITHUB_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${GITHUB_USERNAME}'s github contributions`}
        >
          <img
            // It's better to let the image service handle background or use a wrapper if needed
            // Forcing a transparent background on the image itself can be tricky if the service doesn't support it well.
            // The new URL attempts to set a background color matching the theme.
            src={graphUrl || "/placeholder.svg"}
            alt={`${GITHUB_USERNAME}'s github contribution graph`}
            className="max-w-full h-auto rounded"
          />
        </a>
      </div>
      <p className="text-center mt-4 text-sm text-muted-foreground">
        <a
          href={`https://github.com/${GITHUB_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors flex items-center justify-center"
        >
          <Github className="h-4 w-4 mr-2" />
          view profile on github
        </a>
      </p>
    </section>
  )
}
