"use client"
import { Briefcase, CalendarDays, ExternalLink } from "lucide-react" // Added ExternalLink

interface ExperienceItem {
  id: string | number
  role: string
  company: string
  period: string
  description: string
  liveLink?: string | null
}

const defaultExperiences: ExperienceItem[] = [
  {
    id: "ndaexpress",
    role: "full-stack developer",
    company: "nda express",
    period: "october 2024 – present",
    description: "full-stack development, feature enhancement, and ai integration for an e-signature platform.",
    liveLink: "https://ndaexpress.ai",
  },
  {
    id: "snackers-exp",
    role: "full-stack developer",
    company: "snackers",
    period: "ongoing",
    description: "developing a social media platform for snack food reviews in collaboration with @grocery_obsessed on instagram, covering all aspects of development.",
    liveLink: "https://allsnackers.com",
  },
  {
    id: "fluentsocial",
    role: "search engine optimization consultant",
    company: "fluent social",
    period: "june 2023 – september 2024",
    description: "managed and oversaw ad campaigns, seo optimizations, and client solution implementation.",
  },
  {
    id: "spookytf-exp",
    role: "co-founder & lead developer",
    company: "spooky.tf",
    period: "may 2022 – march 2023",
    description:
      "co-founded project, led development team, managed project aspects, hiring, and social media. gained exposure to diverse perspectives and cultures.",
  },
  {
    id: "cadence",
    role: "research and development intern",
    company: "cadence design systems",
    period: "may 2021 – august 2021",
    description: "updated and developed new solutions/scripts for vlsi optimization debug flow.",
  },
  {
    id: "sherryes",
    role: "web developer",
    company: "sherrye’s luxurious skincare",
    period: "july 2020 – november 2020",
    description: "built e-commerce store sherryesluxuriousskincare.com using shopify with custom front-end pages.",
    liveLink: "https://sherryesluxuriousskincare.com",
  },
  {
    id: "sector7",
    role: "web developer",
    company: "sector7 usa inc",
    period: "july 2019 – december 2019",
    description: "updated dreamweaver website sector7.com to improve seo and readability; managed seo tools.",
  },
  {
    id: "kendallbeard",
    role: "web developer",
    company: "kendall beard (musician)",
    period: "august 2018 – july 2019",
    description: "built kendallbeard.com to promote music, including digital art and spotify management.",
  },
  {
    id: "civilgoat",
    role: "web developer",
    company: "civil goat coffee",
    period: "july 2017 – july 2018",
    description: "built civilgoat.com, including custom subscription javascript front-end with shopify api endpoints.",
    liveLink: "https://civilgoat.com",
  },
  {
    id: "iscoeseo",
    role: "software engineer",
    company: "iscoe seo",
    period: "august 2016 – april 2017",
    description:
      "built tool to aggregate data into an easy-to-read google sheet; used google rest api endpoints and spring web framework.",
  },
].sort(
  (a, b) =>
    (b.period.includes("present") || b.period.includes("ongoing") ? 1 : -1) -
      (a.period.includes("present") || a.period.includes("ongoing") ? 1 : -1) || b.period.localeCompare(a.period),
)

const ExperienceEntry = ({ exp, index }: { exp: ExperienceItem; index: number }) => (
  <div className="grid md:grid-cols-[1fr_auto_1fr] md:gap-x-12 items-start mb-10">
    <div className={`md:text-right ${index % 2 === 0 ? "md:order-1" : "md:order-3"}`}>
      <h3 className="text-xl font-semibold font-mono text-accent-yellow">{exp.role}</h3>
      <p className="text-md font-medium text-foreground">
        {exp.company}
        {exp.liveLink && (
          <a
            href={exp.liveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-primary hover:underline inline-flex items-center text-sm"
            aria-label={`visit ${exp.company} website`}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            site
          </a>
        )}
      </p>
      <div className="text-sm text-muted-foreground flex items-center md:justify-end mt-1">
        <CalendarDays className="h-4 w-4 mr-1.5" /> {exp.period}
      </div>
    </div>
    <div className={`flex items-center justify-center my-4 md:my-0 ${index % 2 === 0 ? "md:order-2" : "md:order-2"}`}>
      <span className="absolute left-[calc(-1.5rem_-_1px)] md:static flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Briefcase className="h-4 w-4" />
      </span>
    </div>
    <div className={`text-muted-foreground ${index % 2 === 0 ? "md:order-3" : "md:order-1"}`}>
      <p>{exp.description}</p>
    </div>
  </div>
)

export default function Experience() {
  const experiences = defaultExperiences

  return (
    <section id="experience" className="py-16">
      <h2 className="text-3xl font-bold font-mono text-center mb-12">
        <span className="text-primary normal-case">~$</span> cat /var/log/career.log
      </h2>
      {experiences.length === 0 ? (
        <p className="text-center text-muted-foreground">no experience to display currently.</p>
      ) : (
        <div className="relative pl-6 after:absolute after:inset-y-0 after:w-px after:bg-muted-foreground/20 after:left-0">
          {experiences.map((exp, index) => (
            <ExperienceEntry key={exp.id} exp={exp} index={index} />
          ))}
        </div>
      )}
    </section>
  )
}
