# Overview

This project is a full-stack web application called **KasiViral** - an AI-powered social media thread generator that helps users create viral content in seconds. The application features a React frontend with modern UI components, an Express.js backend, and is designed to generate engaging social media threads using AI technology. The platform supports multiple social media platforms including Facebook, LinkedIn, Twitter/X, and Threads.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Routing**: Wouter for client-side routing (lightweight React router alternative)
- **State Management**: TanStack React Query for server state management and data fetching
- **Form Handling**: React Hook Form with Zod validation schemas
- **Styling**: Tailwind CSS with custom CSS variables for theming, PostCSS for processing

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure with `/api` prefix for all endpoints
- **Development**: Hot reload with tsx for development server
- **Build**: esbuild for production bundling with external package handling

## Database & ORM
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: Configured for PostgreSQL with Neon Database serverless driver
- **Schema**: Centralized schema definition in `shared/schema.ts`
- **Migrations**: Drizzle Kit for database migrations and schema management

## Project Structure
- **Monorepo**: Single repository with separate client, server, and shared directories
- **Client**: React frontend located in `/client` directory
- **Server**: Express backend in `/server` directory  
- **Shared**: Common types, schemas, and utilities in `/shared` directory
- **Component Library**: Comprehensive UI component system in `/client/src/components/ui`

## Development Tools
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared code
- **Code Quality**: Consistent import paths using TypeScript path mapping
- **Development Experience**: Vite dev server with HMR, runtime error overlay for development
- **Replit Integration**: Cartographer plugin for Replit-specific development features

## Storage Layer
- **Interface Pattern**: Abstract storage interface (`IStorage`) for flexible data access
- **Implementation**: In-memory storage implementation (`MemStorage`) for development
- **Production Ready**: Designed to easily swap to database-backed storage using Drizzle ORM

## Authentication & Session Management
- **Session Storage**: PostgreSQL session store using `connect-pg-simple`
- **User Management**: User schema with username/password authentication structure
- **Validation**: Zod schemas for user input validation and type safety

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL database provider
- **Connection**: Uses `DATABASE_URL` environment variable for database connectivity

## UI Components & Styling
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom color scheme
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Carousel/slider component for content display

## Development & Build Tools
- **Vite**: Fast build tool and development server with React plugin
- **esbuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer
- **TypeScript**: Static type checking across the entire codebase

## Data Fetching & State
- **TanStack React Query**: Server state management with caching and synchronization
- **Wouter**: Lightweight routing solution for React applications

## Validation & Forms
- **Zod**: TypeScript-first schema validation library
- **React Hook Form**: Performant forms library with minimal re-renders
- **Hookform Resolvers**: Integration between React Hook Form and Zod

## Utilities
- **date-fns**: Modern JavaScript date utility library
- **clsx & tailwind-merge**: Utility for conditional CSS class names
- **nanoid**: URL-safe unique string ID generator
- **class-variance-authority**: Utility for creating variant-based component APIs