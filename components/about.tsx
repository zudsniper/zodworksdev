"use client"
// No longer importing useApiStatus or Loader2 for API loading
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const defaultAboutShort =
  "i'm jason, a software programmer working on ai research for quantitative trading, developing the social media platform sorter, and contributing to ndaexpress & snackers. my preference has subtly shifted to typescript, but i believe the tool isn't the solution—what matters is what you're building. as long as you've made it to mvp, we can iterate later."
const defaultAboutLong =
  "in the past, i've worked with cadence design systems on vlsi optimization software and designed e-commerce sites. beyond coding, i enjoy writing and playing music (guitar, bass, synth, piano, drums). always open to new opportunities!"

export default function About() {
  const aboutShort = defaultAboutShort
  const aboutLong = defaultAboutLong

  return (
    <section id="about" className="py-16">
      <h2 className="text-3xl font-bold font-mono text-center mb-12">
        <span className="text-primary normal-case">~$</span> whoami
      </h2>
      <div className="grid md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-1 flex justify-center">
          <Avatar className="w-40 h-40 sm:w-48 sm:h-48 border-4 border-primary">
            <AvatarImage src="/jason_cutout_25.png" alt="jason mcelhenney" className="object-cover" />
            <AvatarFallback className="text-4xl font-mono normal-case">jm</AvatarFallback>
          </Avatar>
        </div>
        <div className="md:col-span-2 space-y-4 text-muted-foreground">
          <>
            <p>{aboutShort}</p>
            <p>{aboutLong}</p>
          </>
          <div className="flex flex-wrap gap-2 mt-3">
            <img
              src="https://img.shields.io/badge/location-austin%2C%20tx-orange?style=flat-square"
              alt="location: austin, tx"
            />
            <img
              src="https://img.shields.io/badge/education-ut%20dallas%20cs-green?style=flat-square"
              alt="education: ut dallas cs"
            />
            <img src="https://img.shields.io/badge/linux-lover-blue?style=flat-square" alt="linux lover" />
            <img
              src="https://img.shields.io/badge/status-open%20to%20work-purple?style=flat-square"
              alt="status: open to work"
            />
            <a 
              href="https://github.com/zudsniper/zodworksdev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block hover:opacity-80 transition-opacity"
              title="View source code for this portfolio site"
            >
              <img
                src="https://img.shields.io/badge/this%20site-open%20source-brightgreen?style=flat-square&logo=github"
                alt="this site: open source"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
