# FireBuildai - Contractor Management Platform

A comprehensive contractor management platform that provides real-time GPS tracking, automated expense processing, client communication tools, and business analytics for construction companies.

## Features

- **Professional Estimates System**: Joist-inspired interface with status tracking and monthly grouping
- **Client Management**: Complete customer profiles with communication history
- **Job Tracking**: Real-time project management and contractor assignment
- **Document Management**: Cloud-based file storage and organization
- **Mobile Optimized**: Field-ready responsive design
- **Payment Processing**: Stripe and PayPal integration ready
- **Real-time Dashboard**: Live metrics and business analytics

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, PostgreSQL, Drizzle ORM
- **Database**: Neon PostgreSQL with connection pooling
- **Real-time**: WebSocket integration for live updates
- **Storage**: Google Cloud Storage integration

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Environment variables configured

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL=your_postgresql_connection_string
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
SENDGRID_API_KEY=your_sendgrid_key
```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   └── lib/           # Utilities and helpers
├── server/                # Express backend
│   ├── routes.ts          # API endpoints
│   └── storage.ts         # Database operations
├── shared/                # Shared types and schemas
└── marketing/             # Landing page
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open database studio

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
