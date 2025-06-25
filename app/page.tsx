import Hero from "@/components/hero"
import About from "@/components/about"
import GithubContributions from "@/components/github-contributions" // Import the new component
import Skills from "@/components/skills"
import Projects from "@/components/projects"
import Experience from "@/components/experience"
import Contact from "@/components/contact"

export default function HomePage() {
  return (
    <div className="space-y-16 md:space-y-24">
      <Hero />
      <About />
      <GithubContributions /> {/* Add the component here */}
      <Skills />
      <Projects />
      <Experience />
      <Contact />
    </div>
  )
}
