import { Code, Cloud, Brain, Settings, Database, Palette } from "lucide-react"

const skillCategories = [
  {
    name: "ai / ml & data science",
    icon: <Brain className="h-5 w-5 mr-2 text-accent-purple" />,
    skills: [
      "llm fine-tuning",
      "rag pipelines",
      "prompt engineering",
      "vector databases",
      "tensorflow/pytorch",
      "pandas/numpy",
      "speech-to-text (whisper)",
      "influxdb (time-series)",
    ],
    shieldColor: "purple",
  },
  {
    name: "full-stack & backend",
    icon: <Code className="h-5 w-5 mr-2 text-accent-green" />,
    skills: [
      "typescript",
      "python (fastapi/flask)",
      "node.js (express)",
      "react (next.js)",
      "clojure",
      "java",
      "rest apis",
      "websockets",
      "auth0/oidc",
      "stripe api",
    ],
    shieldColor: "green",
  },
  {
    name: "cloud, devops & iac",
    icon: <Cloud className="h-5 w-5 mr-2 text-accent-orange" />,
    skills: [
      "aws (ec2, s3, rds)",
      "cloudflare (workers, r2, inference)",
      "docker & docker compose",
      "github actions (ci/cd)",
      "terraform",
      "nginx",
      "pm2/systemd",
      "linux/unix admin",
    ],
    shieldColor: "orange",
  },
  {
    name: "frontend & ui/ux",
    icon: <Palette className="h-5 w-5 mr-2 text-accent-pink" />, // Using Palette for frontend
    skills: [
      "javascript (es2023)",
      "html5/css3 (sass)",
      "vue 3",
      "tailwind css",
      "shadcn/ui",
      "responsive design",
      "pwa development",
      "figma/miro",
    ],
    shieldColor: "pink",
  },
  {
    name: "databases & data engineering",
    icon: <Database className="h-5 w-5 mr-2 text-accent-yellow" />,
    skills: [
      "postgresql",
      "mysql/mariadb",
      "mongodb",
      "cloudflare d1",
      "sql optimization",
      "orm usage",
      "data modeling",
    ],
    shieldColor: "yellow",
  },
  {
    name: "tooling, security & other",
    icon: <Settings className="h-5 w-5 mr-2 text-accent-gray" />, // Changed icon color
    skills: [
      "git & github",
      "vim/tmux",
      "vs code/intellij",
      "regex mastery",
      "selenium automation",
      "jest/pytest (testing)",
      "shell scripting (bash/zsh)",
      "cloudflare zero trust",
      "seo tech",
      "agile/scrum",
    ],
    shieldColor: "gray",
  },
]

export default function Skills() {
  return (
    <section id="skills" className="py-16">
      <h2 className="text-3xl font-bold font-mono text-center mb-12">
        <span className="text-primary normal-case">~$</span> ls /usr/local/bin | head -n 5
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skillCategories.map((category) => (
          <div key={category.name} className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="text-xl font-semibold font-mono mb-4 flex items-center">
              {category.icon}
              {category.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <img
                  key={skill}
                  src={`https://img.shields.io/badge/${encodeURIComponent(skill.replace(/-/g, "--"))}-${category.shieldColor}?style=flat-square&logoColor=white`}
                  alt={skill}
                  className="h-5"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
