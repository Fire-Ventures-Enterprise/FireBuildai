# FireBuild.ai Marketing Website

This is the marketing website for FireBuild.ai that will be deployed to `firebuildai.com`.

## Features

- **Professional Landing Page**: Modern, responsive design with gradient hero section
- **Feature Showcase**: Six key features with interactive cards and hover effects
- **Pricing Section**: Three-tier pricing structure (Free, Professional, Enterprise)
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode Support**: Built-in dark/light theme switching
- **Call-to-Action Integration**: Direct links to application at `appfirebuildai.com`

## Technology Stack

- **Frontend**: HTML5, Tailwind CSS (CDN), Vanilla JavaScript
- **Backend**: Node.js with Express for static file serving
- **Deployment**: Replit with custom domain configuration

## Deployment Architecture

- **Marketing Site**: `firebuildai.com` (this directory)
- **Application**: `appfirebuildai.com` (main application in root directory)

## Getting Started

1. Install dependencies:
   ```bash
   cd marketing
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Visit `http://localhost:3000` to view the marketing site

## Key Sections

1. **Hero Section**: Primary value proposition with dual CTAs
2. **Features Section**: Six core platform capabilities
3. **Pricing Section**: Transparent pricing with clear CTAs
4. **Contact/Footer**: Company information and links

## Integration Points

- All CTAs link to `https://appfirebuildai.com` for user onboarding
- Consistent branding with main application
- SEO optimized with proper meta tags and Open Graph data

## Customization

The site uses CSS custom properties and Tailwind classes for easy theming. Key brand colors:
- Primary: Blue (#3b82f6) to Purple (#8b5cf6) gradient
- Dark mode fully supported
- Professional color scheme matching SaaS industry standards