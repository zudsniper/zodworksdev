"use client"
import TypingEffect, { type TypingAction } from "./typing-effect"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowDown } from "lucide-react"

const defaultHeroTagline =
  "full-stack developer for ndaexpress & snackers, github enthusiast, ai-opinionated. currently working on ai research for quantitative trading and developing the social media platform sorter. always open to new opportunities!"

const commandSequences: TypingAction[][] = [
  // Sequence 1: Original
  [
    { type: "command", text: 'git commit -m "feat: initial commit"', clearPrevious: true, speed: 70 },
    { type: "pause", duration: 300 },
    { type: "delete", count: 20, speed: 40 }, // Delete "feat: initial commit"
    { type: "type", text: "npm run dev", speed: 90 },
    { type: "pause", duration: 2000 },
    { type: "delete", count: 11, speed: 50 }, // Delete "npm run dev"
    { type: "mistake", text: "build", speed: 100 },
    { type: "delete", count: 5, speed: 60 }, // Delete "build" + space
    { type: "type", text: "start", speed: 60 },
    { type: "pause", duration: 3000 },
  ],
  // Sequence 2: Python pyenv/uv hell
  [
    { type: "command", text: "python main.py", clearPrevious: true, speed: 80 },
    { type: "pause", duration: 500 },
    { type: "type", text: "\nTraceback (most recent call last):", speed: 40, clearPrevious: false },
    { type: "type", text: "\n  Could not find python3.9", speed: 40 },
    { type: "pause", duration: 1000 },
    { type: "delete", count: 70, speed: 30 }, // Clear error and command
    { type: "command", text: "pyenv versions", speed: 70 },
    { type: "type", text: "\n* system (set by /Users/.../.python-version)", speed: 50, clearPrevious: false },
    { type: "type", text: "\n  3.10.4", speed: 50 },
    { type: "type", text: "\n  3.11.2", speed: 50 },
    { type: "pause", duration: 1500 },
    { type: "delete", count: 90, speed: 30 },
    { type: "command", text: "pyenv local 3.10.4", speed: 70 },
    { type: "pause", duration: 500 },
    { type: "delete", count: 20, speed: 40 },
    { type: "command", text: "uv pip install -r requirements.txt", speed: 60 },
    { type: "type", text: "\nerror: `uv` is not installed.", speed: 50, clearPrevious: false },
    { type: "pause", duration: 1000 },
    { type: "delete", count: 70, speed: 30 },
    { type: "command", text: "pip install uv", speed: 70 },
    { type: "pause", duration: 1500 },
    { type: "delete", count: 15, speed: 40 },
    { type: "command", text: "uv pip sync", speed: 70 },
    { type: "pause", duration: 2000 },
    { type: "delete", count: 12, speed: 50 },
    { type: "command", text: "uv run python main.py", speed: 70 },
    { type: "pause", duration: 3000 },
  ],
  // Sequence 3: NPM peer dependency hell -> pnpm
  [
    { type: "command", text: "npm install", clearPrevious: true, speed: 80 },
    { type: "pause", duration: 1500 },
    { type: "type", text: "\nnpm err! ERESOLVE could not resolve", speed: 40, clearPrevious: false },
    { type: "type", text: '\nnpm err! peer react@">=16.8.0 <18.0.0" from some-package@1.2.3', speed: 40 },
    { type: "pause", duration: 1000 },
    { type: "delete", count: 120, speed: 20 },
    { type: "command", text: "npm install --legacy-peer-deps", speed: 60 },
    { type: "pause", duration: 2000 },
    { type: "type", text: "\nwarning: deprecated", speed: 50, clearPrevious: false },
    { type: "pause", duration: 1000 },
    { type: "delete", count: 60, speed: 30 },
    { type: "command", text: "pnpm install", speed: 70 },
    { type: "pause", duration: 1500 },
    { type: "type", text: "\nsuccess!", speed: 100, clearPrevious: false },
    { type: "pause", duration: 3000 },
  ],
  // Sequence 4: javac CLI for JAR
  [
    { type: "command", text: "javac -cp lib/*:. com/example/Main.java", clearPrevious: true, speed: 50 },
    { type: "pause", duration: 1000 },
    { type: "delete", count: 45, speed: 30 },
    { type: "command", text: "jar cfe Main.jar com.example.Main -C . com/example/*.class -C lib .", speed: 40 },
    { type: "pause", duration: 2000 },
    { type: "delete", count: 80, speed: 25 },
    { type: "command", text: "java -jar Main.jar", speed: 70 },
    { type: "pause", duration: 3000 },
  ],
  // Sequence 5: Docker ghcr.io credentials in DevContainer
  [
    { type: "command", text: "docker pull ghcr.io/owner/image:latest", clearPrevious: true, speed: 60 },
    { type: "pause", duration: 1000 },
    { type: "type", text: "\nError response from daemon: unauthorized", speed: 40, clearPrevious: false },
    { type: "pause", duration: 1000 },
    { type: "delete", count: 80, speed: 30 },
    { type: "command", text: "cat ~/.docker/config.json", speed: 70 },
    { type: "type", text: '\n{ "auths": { "ghcr.io": { "auth": "bW9..." } } }', speed: 50, clearPrevious: false },
    { type: "pause", duration: 1500 },
    { type: "delete", count: 90, speed: 30 },
    { type: "command", text: "echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin", speed: 40 },
    { type: "pause", duration: 2000 },
    { type: "type", text: "\nLogin Succeeded", speed: 80, clearPrevious: false },
    { type: "pause", duration: 3000 },
  ],
]

export default function Hero() {
  const heroTagline = defaultHeroTagline

  return (
    <section
      id="hero"
      className="min-h-[calc(100vh-10rem)] flex flex-col justify-center items-center text-center py-16"
    >
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-mono mb-6 normal-case">jason mcelhenney</h1>
      <div className="text-lg sm:text-xl md:text-2xl mb-10 h-12 sm:h-16">
        {commandSequences.length > 0 && <TypingEffect sequences={commandSequences} loop={true} giveUpChance={0.09} />}
      </div>
      <p className="max-w-xl text-md text-muted-foreground mb-10">{heroTagline}</p>
      <div className="space-x-4">
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="#projects">see projects</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
          <Link href="#contact">say hi</Link>
        </Button>
      </div>
      <div className="absolute bottom-16 animate-bounce hidden sm:block">
        <ArrowDown className="h-8 w-8 text-muted-foreground" />
      </div>
    </section>
  )
}
