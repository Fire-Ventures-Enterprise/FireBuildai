# Overview

FireBuild.ai is a comprehensive contractor management platform that provides real-time GPS tracking, automated expense processing, client communication tools, and business analytics for construction companies. The application enables contractors to track their workforce, manage jobs, process payments, and communicate with clients through a unified dashboard interface.

## Recent Updates (January 2025)
- ✅ **Critical Navigation Fix**: Dashboard button now correctly routes to application dashboard (/dashboard) instead of marketing landing page
- ✅ **Mobile Optimization**: Comprehensive mobile scrolling fixes with webkit-overflow-scrolling and touch-action support
- ✅ **Client Portal Enhancement**: Added invoice/estimate creation buttons directly in client details dialog
- ✅ **Database Schema**: Fixed missing address column in jobs table with proper migration
- ✅ **UI/UX Improvements**: Smooth mobile experience with proper container layouts and scroll behavior

## Domain Architecture (Implemented)

**Professional Dual-Domain Structure:**
- **Marketing Website**: `firebuildai.com` - Professional landing page with feature showcase, pricing, and CTAs
- **Application Platform**: `appfirebuildai.com` - Full contractor management application with dashboard

This follows SaaS industry best practices with separate domains for marketing and application hosting.

# User Preferences

Preferred communication style: Simple, everyday language.
Platform Strategy: Desktop as main control hub with full functionality, mobile as companion app for field operations.
Dashboard Design: Professional, clean interface with all elements clickable and functional navigation to corresponding pages.
Dark Mode: Preferred over light mode for better visual experience.
Domain Architecture: firebuildai.com for marketing website, app.firebuildai.com for application (SaaS industry best practice).

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with custom styling through shadcn/ui
- **Real-time Updates**: WebSocket connection for live data updates

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket server for live contractor tracking and notifications
- **File Structure**: Monorepo structure with shared schema between client and server

## Data Layer
- **ORM**: Drizzle with Neon Database (PostgreSQL)
- **Schema**: Shared TypeScript schema definitions for type safety across frontend and backend
- **Migrations**: Drizzle Kit for database migrations and schema management
- **Connection**: Neon serverless driver for PostgreSQL connectivity

## Authentication & Security
- **Session Management**: Cookie-based authentication with credential inclusion
- **Database Security**: Environment-based database URL configuration
- **CORS**: Configured for cross-origin requests with credentials

## Real-time Features
- **GPS Tracking**: Live contractor location updates via WebSocket
- **Notifications**: Real-time job status updates and payment notifications
- **Dashboard Updates**: Live metrics and contractor status updates

## Module Organization
- **Components**: Modular React components organized by feature (Analytics, Tracking, Expenses, etc.)
- **Shared Types**: Common TypeScript interfaces shared between client and server
- **API Layer**: RESTful endpoints with WebSocket integration for real-time features
- **Storage Layer**: Abstracted storage interface for data operations

# External Dependencies

## Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database toolkit and query builder

## Payment Processing
- **Stripe**: Payment processing and subscription management
- **Stripe React**: Frontend components for payment forms

## File Storage & Upload
- **Google Cloud Storage**: Cloud file storage for receipts and documents
- **Uppy**: File upload components with drag-and-drop support

## UI & Styling
- **Radix UI**: Headless UI component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Chart.js**: Data visualization and analytics charts

## Development & Build Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across the application
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment plugins and error handling

## GPS & Location Services
- **WebSocket API**: Custom real-time location tracking
- **Browser Geolocation API**: Client-side location services

## Communication
- **SMS Integration**: Automated client notifications (implementation ready)
- **Email Services**: Client communication and review requests