# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 marketing website for Creative Milk, an AI consulting business. The site is built using the App Router with TypeScript, Tailwind CSS v4 (alpha), and features a custom WebGL2 background shader. It's a server-rendered application with client-side interactivity for navigation, forms, and visual effects.

## Development Commands

```bash
# Development server (runs on http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Node Version

- Required: Node.js 22.x (see `.nvmrc` and `package.json` engines)
- Use `nvm use` to switch to the correct version if you have nvm installed

## Architecture

### App Structure

The application uses Next.js App Router with a single-page layout:

- `app/page.tsx` - Main entry point, composes all section components
- `app/layout.tsx` - Root layout with metadata, Google Analytics, and font definitions
- `app/components/` - All UI components (Nav, Hero, Services, Work, Process, Contact, Footer)
- `app/api/send-email/route.ts` - API route for contact form submissions via Resend
- `app/globals.css` - Complete design system with CSS custom properties

### Component Philosophy

All components are either Server Components (default) or Client Components (marked with `"use client"`). Client components are used for:
- Interactive navigation (`Nav.tsx`)
- Form handling (`Contact.tsx`)
- WebGL rendering (`WebGLBackground.tsx`)
- Event listeners and state management

### Styling System

Uses Tailwind CSS v4 alpha with a custom design system defined in `globals.css`:

- **Design tokens**: CSS custom properties (`--midnight-ink`, `--liquid-gold`, `--warm-cream`, etc.)
- **Typography**: Three font families loaded via next/font
  - Display: Cormorant Garamond (serif, for headings)
  - Sans: Syne (primary UI font)
  - Mono: DM Mono (eyebrows, labels, code-style text)
- **Utility classes**: Custom utilities like `.eyebrow`, `.h-display`, `.cta`, `.section`
- **Motion**: CSS animations with reduced-motion support

When styling components, prefer inline styles using CSS custom properties to maintain consistency with the design tokens.

### Email Integration

Contact form uses Resend API:
- Environment variables: `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_TO`
- Custom HTML email template is inline in `app/api/send-email/route.ts`
- Form validation on both client and server sides

### WebGL Background

`WebGLBackground.tsx` is a vanilla WebGL2 implementation (no Three.js):
- Fragment shader creates domain-warped FBM noise
- Responsive to mouse movement (parallax) and scroll position
- Falls back to CSS gradient for reduced-motion users or unsupported browsers
- Uses IntersectionObserver to pause rendering when off-screen

## Environment Variables

Required for production:
- `RESEND_API_KEY` - Resend API key for email sending
- `RESEND_FROM` - Email address to send from (optional, defaults to onboarding@resend.dev)
- `RESEND_TO` - Recipient email address (optional, defaults to drleewarden@gmail.com)

## Deployment

- Configured for Vercel deployment
- Node version pinned to 22.x for consistency
- Next.js performs automatic static optimization where possible
- Google Analytics and Tag Manager scripts are included in production

## Code Patterns

### Path Aliases

TypeScript is configured with `@/*` path alias mapping to project root:
```typescript
"paths": {
  "@/*": ["./*"]
}
```

### Component Imports

Components import other components using relative paths:
```typescript
import Nav from "./components/Nav";
```

### Client-Side State

When client interactivity is needed, components use React hooks:
- `useState` for local state
- `useEffect` for side effects (scroll listeners, IntersectionObserver)
- `useRef` for DOM references

### Accessibility

The codebase follows web accessibility practices:
- Semantic HTML (`<nav>`, `<section>`, `<main>`)
- ARIA labels and roles where appropriate
- Focus-visible styles defined globally
- Skip link for keyboard navigation
- Min touch target sizes (44px)
