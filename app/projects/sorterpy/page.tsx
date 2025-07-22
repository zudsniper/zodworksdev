import BlogPostLayout from "@/components/blog-post-layout"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'sorterpy - python sdk with automated ci/cd | jason mcelhenney',
  description: 'How I built sorterpy, a Python SDK for the Sorter API with automated PyPI publishing and ReadTheDocs generation.',
  openGraph: {
    title: 'sorterpy - python sdk with automated ci/cd',
    description: 'How I built sorterpy, a Python SDK for the Sorter API with automated PyPI publishing and ReadTheDocs generation.',
    images: ['/projects/sorterpy.png'],
  },
}

export default function SorterPyPage() {
  return (
    <BlogPostLayout
      title="sorterpy"
      description="Python SDK for the Sorter API with automated PyPI publishing and ReadTheDocs generation"
      publishDate="2024-02-01"
      tags={["python", "sdk", "api client", "ci/cd", "documentation", "pypi", "automation"]}
      liveLink="https://pypi.org/project/sorterpy/"
      repoLink="https://github.com/sorterisntonline/sorterpy"
      imageUrl="/projects/sorterpy.png"
      projectStatus="live"
    >
      <section>
        <h2 className="text-2xl font-bold mb-4">Project Overview</h2>
        <p>
          SorterPy is the official Python SDK for the Sorter API, designed to make integration with the Sorter 
          platform seamless for Python developers. The project demonstrates modern Python packaging practices, 
          automated documentation generation, and continuous integration workflows.
        </p>
        <p>
          What makes this project particularly interesting isn't just the SDK itself, but the comprehensive 
          automation pipeline that ensures code quality, documentation accuracy, and seamless distribution 
          to the Python Package Index (PyPI).
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Technical Implementation</h2>
        <p>
          The SDK is built with modern Python best practices and developer experience in mind:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Type hints throughout</strong> - Full mypy compatibility for excellent IDE support</li>
          <li><strong>Async/await support</strong> - Both synchronous and asynchronous API clients</li>
          <li><strong>Pydantic models</strong> - Robust data validation and serialization</li>
          <li><strong>Comprehensive error handling</strong> - Custom exceptions with detailed error context</li>
          <li><strong>Retry logic</strong> - Built-in exponential backoff for network resilience</li>
        </ul>
        
        <p>
          The codebase follows PEP 8 standards with Black formatting, isort import organization, 
          and flake8 linting enforced through pre-commit hooks.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Automation Pipeline</h2>
        <p>
          One of the most valuable aspects of this project is the fully automated CI/CD pipeline:
        </p>
        
        <h3 className="text-xl font-semibold mb-2 mt-4">Automated Testing</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>GitHub Actions run tests across Python 3.8, 3.9, 3.10, and 3.11</li>
          <li>Integration tests against live Sorter API endpoints</li>
          <li>Coverage reporting with codecov integration</li>
          <li>Security vulnerability scanning with Safety</li>
        </ul>

        <h3 className="text-xl font-semibold mb-2 mt-4">PyPI Publishing</h3>
        <p>
          Every tag push triggers an automated PyPI release:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Semantic version validation</li>
          <li>Automated wheel and source distribution building</li>
          <li>GPG signing of packages</li>
          <li>Automatic PyPI upload with proper metadata</li>
        </ul>

        <h3 className="text-xl font-semibold mb-2 mt-4">Documentation Generation</h3>
        <p>
          ReadTheDocs automatically builds documentation from docstrings and markdown files:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Sphinx-based documentation with custom theme</li>
          <li>Auto-generated API reference from docstrings</li>
          <li>Code examples with syntax highlighting</li>
          <li>Version-specific documentation branches</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Developer Experience Focus</h2>
        <p>
          Creating a great SDK isn't just about functionality – it's about developer experience:
        </p>
        
        <p>
          <strong>Intuitive API design:</strong> The SDK follows Python conventions and provides both 
          high-level convenience methods and low-level control when needed.
        </p>
        
        <p>
          <strong>Excellent documentation:</strong> Every public method has comprehensive docstrings, 
          and the documentation includes practical examples for common use cases.
        </p>
        
        <p>
          <strong>Easy installation:</strong> Simple pip install with minimal dependencies, and optional 
          extras for additional features like async support.
        </p>

        <p>
          <strong>Debugging support:</strong> Comprehensive logging throughout the SDK makes troubleshooting 
          straightforward for developers integrating with Sorter.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Usage & Adoption</h2>
        <p>
          SorterPy has seen steady adoption within the Sorter ecosystem:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Over 500 downloads per month on PyPI</li>
          <li>Used by several community-built tools and bots</li>
          <li>Integrated into Sorter's own internal tools</li>
          <li>Featured in Sorter's official documentation</li>
        </ul>
        
        <p>
          The automated release process has enabled rapid iteration – we've published 15+ versions 
          with bug fixes and feature additions based on community feedback.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Technical Challenges Solved</h2>
        <p>
          Building a robust SDK presented several interesting challenges:
        </p>
        
        <p>
          <strong>API versioning:</strong> The Sorter API evolves rapidly. We implemented automatic 
          backward compatibility checking and deprecation warnings to help developers migrate smoothly.
        </p>
        
        <p>
          <strong>Rate limiting:</strong> The SDK automatically handles Sorter's rate limits with 
          intelligent retry logic that doesn't overwhelm the API while providing responsive user experience.
        </p>
        
        <p>
          <strong>Authentication handling:</strong> Secure token management with automatic refresh 
          and multiple authentication method support (API keys, OAuth, etc.).
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Future Development</h2>
        <p>
          The project continues to evolve alongside the Sorter platform:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>GraphQL support for more efficient data fetching</li>
          <li>WebSocket integration for real-time features</li>
          <li>Command-line interface for administrative tasks</li>
          <li>Plugin system for custom extensions</li>
        </ul>
        
        <p>
          The automation pipeline serves as a template for other SDK projects, demonstrating how 
          modern Python packaging and distribution can be completely automated while maintaining 
          high quality standards.
        </p>
      </section>
    </BlogPostLayout>
  )
}
