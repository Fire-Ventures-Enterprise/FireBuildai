# Contributing to FireBuild.ai

Thank you for your interest in contributing to FireBuild.ai! This document provides guidelines for contributing to the project.

## Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/Fire-Ventures-Enterprise/FireBuildai.git
cd FireBuildai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up database**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

## Project Architecture

### Frontend (client/)
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS with shadcn/ui components
- TanStack Query for state management
- Wouter for routing

### Backend (server/)
- Node.js with Express
- PostgreSQL with Drizzle ORM
- Zod for validation
- WebSocket for real-time features

### Shared (shared/)
- Common TypeScript types
- Database schema definitions
- Validation schemas

## Code Standards

### TypeScript
- Use strict type checking
- Define interfaces for all data structures
- Use Zod schemas for runtime validation

### React Components
- Use functional components with hooks
- Implement proper error boundaries
- Follow React Query patterns for data fetching

### Database
- Use Drizzle ORM for all database operations
- Define schema in shared/schema.ts
- Use migrations for schema changes

### API Design
- RESTful endpoints with proper HTTP methods
- Consistent error response format
- Input validation with Zod schemas

## Pull Request Process

1. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
- Follow the code standards above
- Add tests for new functionality
- Update documentation as needed

3. **Test your changes**
```bash
npm run test
npm run build
```

4. **Commit with descriptive messages**
```bash
git commit -m "feat: add client management dashboard"
```

5. **Push and create PR**
```bash
git push origin feature/your-feature-name
```

## Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots if applicable

## Feature Requests

For feature requests, please:
- Describe the use case
- Explain the business value
- Provide mockups or examples if applicable
- Consider the impact on existing functionality

## Questions?

- Check existing issues and discussions
- Create a new issue with the "question" label
- Join our community discussions

Thank you for contributing to FireBuild.ai!