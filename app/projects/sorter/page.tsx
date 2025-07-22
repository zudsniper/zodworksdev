import BlogPostLayout from "@/components/blog-post-layout"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'sorter - democratic content ranking platform | jason mcelhenney',
  description: 'Deep dive into sorter, a social media platform built with Clojure, Rust, and Node.js that uses democratic consensus for content ranking.',
  openGraph: {
    title: 'sorter - democratic content ranking platform',
    description: 'Deep dive into sorter, a social media platform built with Clojure, Rust, and Node.js that uses democratic consensus for content ranking.',
    images: ['/projects/sorter.png'],
  },
}

export default function SorterPage() {
  return (
    <BlogPostLayout
      title="sorter"
      description="A social media platform for democratic content ranking by group consensus, built with Clojure, Rust, and Node.js"
      publishDate="2024-01-15"
      tags={["social media", "clojure", "rust", "node.js", "democracy", "full-stack"]}
      liveLink="https://sorter.social"
      repoLink="https://github.com/sorterisntonline"
      imageUrl="/projects/sorter.png"
      projectStatus="ongoing"
    >
      <section>
        <h2 className="text-2xl font-bold mb-4">The Vision</h2>
        <p>
          Sorter started as an experiment in democratic content curation. The idea was simple: what if 
          communities could collectively decide what content deserves attention through a transparent, 
          gamified voting system?
        </p>
        <p>
          Unlike traditional social media algorithms that operate as black boxes, Sorter puts the power 
          of content ranking directly into users' hands through a consensus-based approach.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Technical Architecture</h2>
        <p>
          The platform is built on a polyglot architecture, leveraging different languages for their strengths:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Clojure backend</strong> - Handles complex consensus algorithms and functional data processing</li>
          <li><strong>Rust services</strong> - High-performance content processing and real-time vote aggregation</li>
          <li><strong>Node.js API layer</strong> - RESTful endpoints and WebSocket connections for real-time updates</li>
          <li><strong>React frontend</strong> - Responsive, interactive user interface</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Key Features</h2>
        <p>
          Sorter implements several innovative features that differentiate it from traditional social platforms:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Consensus-based ranking</strong> - Content rises based on group agreement, not engagement metrics</li>
          <li><strong>Transparent algorithms</strong> - All ranking logic is open-source and auditable</li>
          <li><strong>Community moderation</strong> - Democratic voting on content policies and enforcement</li>
          <li><strong>Real-time collaboration</strong> - Live voting and discussion features</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Challenges & Solutions</h2>
        <p>
          Building a consensus-based platform presented unique technical challenges:
        </p>
        <p>
          <strong>Scaling democratic processes:</strong> Traditional voting systems don't scale well to large user bases. 
          We developed a hierarchical consensus model where communities can form sub-groups with their own ranking criteria.
        </p>
        <p>
          <strong>Preventing gaming:</strong> Any voting system is susceptible to manipulation. We implemented reputation 
          weighting, temporal vote decay, and anomaly detection to maintain system integrity.
        </p>
        <p>
          <strong>Real-time performance:</strong> Consensus calculations need to happen quickly for good UX. The Rust 
          services handle the heavy computational lifting while Clojure manages the complex state transitions.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Current Status & Future</h2>
        <p>
          Sorter is currently in active development with a growing community of beta users. The platform has 
          successfully processed over 10,000 community votes and hosts several active communities.
        </p>
        <p>
          Upcoming features include mobile apps, advanced analytics dashboards for community moderators, 
          and integration with existing social platforms through our Python SDK.
        </p>
      </section>
    </BlogPostLayout>
  )
}
