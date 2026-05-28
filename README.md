# Creative Milk Website

Next.js 15 marketing website for Creative Milk, an AI consulting business. Built with App Router, TypeScript, Tailwind CSS v4, and custom WebGL2 background shader.

## Tech Stack

- **Framework**: Next.js 15.5.15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (alpha)
- **Fonts**: Cormorant Garamond, Syne, DM Mono (via next/font)
- **Email**: Resend API
- **Database**: Supabase (for AI Readiness assessment)
- **Deployment**: Vercel

## Local Development

### Prerequisites

- Node.js 22.x (see `.nvmrc`)
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file (see `.env.example` for required variables)

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production build locally
npm run lint     # Run ESLint
npm test         # Run Jest tests
```

## Environment Variables

Required for production (see `.env.example`):

### Email (Contact Form)
- `RESEND_API_KEY` - Resend API key
- `RESEND_FROM` - Sender email address (optional, defaults to onboarding@resend.dev)
- `RESEND_TO` - Recipient email address (optional, defaults to contact@creative-milk.com.au)

### Supabase (AI Readiness Assessment)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXT_PUBLIC_SITE_URL` - Full production domain (e.g., `https://www.creative-milk.com.au`) - **Required for AI Readiness result pages to work correctly**

## Deployment to Vercel

### First-Time Setup

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import your Git repository
   - Vercel will auto-detect Next.js

2. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables from `.env.example`
   - Set for Production, Preview, and Development as needed

3. **Configure Build Settings** (should be auto-detected)
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Node Version: 22.x (set in Project Settings → General)

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically

### Subsequent Deployments

Every push to your main branch will automatically trigger a deployment. Pull requests create preview deployments.

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Project Structure

```
app/
├── components/          # Shared UI components (Nav, Footer, etc.)
├── (site)/             # Route group for main site pages
│   ├── about/
│   ├── contact/
│   ├── insights/       # Blog posts
│   ├── ai-readiness/   # Assessment tool
│   └── ...
├── api/                # API routes
│   ├── send-email/     # Contact form handler
│   └── readiness/      # AI assessment endpoints
├── layout.tsx          # Root layout with fonts & metadata
└── globals.css         # Design system & Tailwind config

lib/                    # Shared utilities
├── readiness/          # AI assessment logic
└── supabase/          # Database client

public/                 # Static assets
```

## Key Features

- **Server-Side Rendering**: Fast page loads with Next.js App Router
- **Client-Side Interactivity**: React hooks for nav, forms, and WebGL
- **WebGL Background**: Custom shader with parallax and scroll effects
- **Contact Form**: Email integration via Resend API
- **AI Readiness Assessment**: Interactive quiz with Supabase storage
- **SEO Optimized**: Metadata, OpenGraph, structured data
- **Analytics**: Google Analytics & Tag Manager integration
- **Accessibility**: WCAG compliant with semantic HTML

## Design System

Design tokens defined in `app/globals.css`:
- **Colors**: Midnight Ink, Liquid Gold, Warm Cream
- **Typography**: Display (Cormorant), UI (Syne), Mono (DM Mono)
- **Components**: `.eyebrow`, `.h-display`, `.cta`, `.section`
- **Animations**: CSS animations with reduced-motion support

See `CLAUDE.md` for detailed architecture documentation.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- WebGL 2.0 support (gracefully degrades to CSS gradient)
- Reduced-motion preferences respected

## License

Proprietary - Creative Milk
