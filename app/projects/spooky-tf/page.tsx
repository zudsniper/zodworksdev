import BlogPostLayout from "@/components/blog-post-layout"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'spooky.tf - team fortress 2 community project | jason mcelhenney',
  description: 'The story behind spooky.tf, a TF2 community project involving team leadership, technical challenges, and valuable lessons learned.',
  openGraph: {
    title: 'spooky.tf - team fortress 2 community project',
    description: 'The story behind spooky.tf, a TF2 community project involving team leadership, technical challenges, and valuable lessons learned.',
    images: ['/projects/spookytf.png'],
  },
}

export default function SpookyTFPage() {
  return (
    <BlogPostLayout
      title="spooky.tf"
      description="Co-founded and led development for a Team Fortress 2 community project, managing team, social media, and hiring"
      publishDate="2023-03-01"
      tags={["project management", "team lead", "community", "game server", "tf2", "leadership"]}
      repoLink="https://github.com/spooky.tf"
      imageUrl="/projects/spookytf.png"
      projectStatus="completed (mar 2023)"
    >
      <section>
        <h2 className="text-2xl font-bold mb-4">The Beginning</h2>
        <p>
          In late 2022, I co-founded spooky.tf, an ambitious community project aimed at creating premium 
          Team Fortress 2 servers with a focus on competitive gameplay and community building. What started 
          as a passion project between friends evolved into a complex undertaking involving team management, 
          technical infrastructure, and community growth.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Leadership & Team Building</h2>
        <p>
          As co-founder and lead developer, I took on multiple responsibilities that extended far beyond code:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Team leadership</strong> - Managed a distributed team of 8+ contributors across development, operations, and community management</li>
          <li><strong>Hiring & recruitment</strong> - Developed interview processes and onboarded new team members</li>
          <li><strong>Social media strategy</strong> - Grew our Discord community to 1,200+ members and managed Twitter presence</li>
          <li><strong>Technical architecture</strong> - Designed and implemented server infrastructure and custom game modes</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Technical Achievements</h2>
        <p>
          Despite the project's eventual challenges, we built some impressive technical solutions:
        </p>
        <p>
          <strong>Custom SourceMod plugins:</strong> Developed specialized plugins for competitive TF2, including 
          advanced statistics tracking, anti-cheat measures, and custom game mode implementations.
        </p>
        <p>
          <strong>Infrastructure automation:</strong> Built Docker-based deployment systems for rapid server 
          provisioning and automated backups across multiple geographic regions.
        </p>
        <p>
          <strong>Community tools:</strong> Created Discord bots for server status, player statistics, and 
          automated tournament management.
        </p>
        <p>
          Much of this work was open-sourced and continues to benefit the TF2 community today.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Challenges & Learning Moments</h2>
        <p>
          Running a gaming community project taught me valuable lessons about project management and team dynamics:
        </p>
        <p>
          <strong>Scope creep management:</strong> Initial plans were ambitious but realistic. As the project grew, 
          feature requests and community demands multiplied faster than our capacity to deliver. Learning to say 
          "no" and maintain focus became crucial.
        </p>
        <p>
          <strong>Volunteer team dynamics:</strong> Managing volunteers requires different skills than managing 
          paid employees. Motivation, recognition, and clear communication became essential for maintaining 
          team morale and productivity.
        </p>
        <p>
          <strong>Community expectations:</strong> Balancing what the community wanted with what was technically 
          feasible and financially sustainable proved challenging. We learned the importance of clear communication 
          about project limitations and timelines.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Why We Stopped & What We Gained</h2>
        <p>
          In March 2023, we made the difficult decision to wind down spooky.tf. The combination of increasing 
          operational costs, declining TF2 player base, and team burnout made continuation unsustainable.
        </p>
        <p>
          However, the project was far from a failure:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Built a passionate community that many members still reference fondly</li>
          <li>Open-sourced several tools that continue to benefit the TF2 ecosystem</li>
          <li>Gained invaluable experience in project leadership and team management</li>
          <li>Developed skills in community building and social media growth</li>
          <li>Created lasting relationships with team members and community participants</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Lessons for Future Projects</h2>
        <p>
          The spooky.tf experience shaped my approach to every subsequent project:
        </p>
        <p>
          <strong>Sustainable growth:</strong> Rapid expansion without corresponding infrastructure investment 
          leads to technical debt and operational stress. Better to grow steadily with solid foundations.
        </p>
        <p>
          <strong>Clear governance:</strong> Community projects need clear decision-making processes and 
          defined roles. Democracy is great for some decisions, but technical choices need technical leadership.
        </p>
        <p>
          <strong>Financial planning:</strong> Even passion projects need realistic financial models. 
          Understanding operational costs and potential revenue streams upfront prevents later crises.
        </p>
        <p>
          These lessons have proven invaluable in my current projects, including sorter and other ventures 
          where community and technical excellence must coexist.
        </p>
      </section>
    </BlogPostLayout>
  )
}
