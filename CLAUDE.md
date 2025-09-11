# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Jason McElhenney built with Next.js 15 and deployed on Cloudflare Workers using OpenNext.js. The site features a dark theme, AI chatbot integration, and various interactive components.

## Tech Stack

- **Framework**: Next.js 15 with React 19
- **Deployment**: Cloudflare Workers via OpenNext.js
- **Styling**: Tailwind CSS with shadcn/ui components
- **Language**: TypeScript
- **Package Manager**: pnpm
- **Forms**: React Hook Form with Zod validation
- **Email**: Resend API
- **Security**: Cloudflare Turnstile for CAPTCHA

## Development Commands

```bash
# Development
pnpm dev                 # Start development server

# Build and Deploy
pnpm build              # Build for production
pnpm preview            # Build and preview on Cloudflare
pnpm deploy             # Build and deploy to Cloudflare
pnpm upload             # Build and upload to Cloudflare

# Linting
pnpm lint               # Run Next.js linter

# Type Generation
pnpm cf-typegen         # Generate Cloudflare types
```

## Project Structure

```
/
├── app/                # Next.js app directory
│   ├── api/           # API routes
│   │   └── contact/   # Contact form endpoint with Turnstile verification
│   ├── layout.tsx     # Root layout with providers
│   └── page.tsx       # Home page with component sections
├── components/        # React components
│   ├── ui/           # shadcn/ui components
│   └── *.tsx         # Feature components (hero, about, skills, etc.)
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── public/           # Static assets
└── styles/           # Global CSS
```

## Key Architecture Decisions

### Cloudflare Workers Deployment
The application uses OpenNext.js to deploy on Cloudflare Workers with:
- R2 bucket for incremental static regeneration cache
- Custom domains configured in `wrangler.jsonc`
- Worker self-reference for internal requests

### Component Architecture
- All components are client-side by default unless marked with server directives
- Heavy use of shadcn/ui for consistent UI patterns
- Theme provider wraps the entire application for dark/light mode support

### API Routes
- Contact form endpoint (`/api/contact`) handles email submissions
- Uses Cloudflare Turnstile for bot protection
- Automatically switches to test keys when running on localhost
- Sends Discord webhook notifications for new submissions
- Uses Resend API for email delivery with proper reply-to headers

### Configuration Notes
The project has ESLint and TypeScript build errors disabled in `next.config.mjs` for rapid development. Re-enable these for production:
```js
eslint: { ignoreDuringBuilds: false }
typescript: { ignoreBuildErrors: false }
```

## Environment Variables

Required environment variables:
- `RESEND_API_KEY` - Resend API key for sending emails
- `TURNSTILE_SECRET_KEY` - Cloudflare Turnstile secret key (production only)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Cloudflare Turnstile site key

Optional environment variables:
- `DISCORD_WEBHOOK_URL` - Discord webhook for contact form notifications
- `DISCORD_ADMIN_USER_ID` - Discord user ID to ping on new submissions
- `NEXT_PUBLIC_TURNSTILE_BYPASS` - Set to 1 to bypass Turnstile in development

## Import Aliases

The project uses `@/` as an alias for the root directory, configured in `tsconfig.json`.