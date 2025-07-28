# NewsAI - AI-Powered News Aggregation Platform

## Overview

NewsAI is a modern news aggregation platform that combines real-time news fetching with AI-powered content analysis. The application provides users with intelligent news summaries, categorization, and personalized reading experiences through a mobile-first interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)

### New Features Added:
- **Dark Mode Support**: Complete dark theme implementation with toggle in header and profile settings
- **Bilingual Interface**: Full English/Arabic language support with RTL layout for Arabic
- **WhatsApp Sharing**: Direct WhatsApp sharing buttons for articles with formatted message text
- **Enhanced Profile Page**: Settings panel with theme toggle and language switcher
- **Improved Navigation**: Language indicator and theme controls in header

### Technical Improvements:
- Added ThemeProvider context for persistent dark mode state
- Added LanguageProvider context with comprehensive translation system
- Enhanced all UI components with dark mode and RTL support
- Updated news cards with WhatsApp sharing functionality
- Improved accessibility with proper language attributes and direction switching

## System Architecture

The application follows a full-stack architecture with clear separation between client and server components:

- **Frontend**: React-based Single Page Application (SPA) with TypeScript
- **Backend**: Express.js REST API server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Build System**: Vite for frontend bundling and development
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript and JSX
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **State Management**: TanStack Query for server state, local state with React hooks
- **Mobile-First**: Responsive design optimized for mobile devices with bottom navigation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints for news articles, user preferences, and saved items
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **External Services**: Integration with News API and OpenAI for content enhancement
- **Session Management**: Built-in session handling with PostgreSQL session store

### Database Schema
- **Articles**: Core news articles with AI-generated summaries and metadata
- **Saved Articles**: User bookmarking system linking users to articles
- **Users**: Basic user authentication and preferences
- **Categories**: News categorization (politics, tech, sports, business, breaking)

### AI Integration
- **Content Analysis**: OpenAI GPT-4o integration for article summarization
- **Smart Categorization**: Automatic article classification based on content
- **Reading Time Estimation**: AI-powered reading time calculation
- **Breaking News Detection**: Intelligent identification of urgent news

## Data Flow

1. **News Ingestion**: External news sources fetched via News API
2. **AI Processing**: Articles processed through OpenAI for summaries and categorization
3. **Database Storage**: Processed articles stored with metadata in PostgreSQL
4. **Client Requests**: Frontend queries REST API endpoints for news data
5. **Real-time Updates**: TanStack Query handles caching and background updates
6. **User Interactions**: Bookmarking, sharing, and category filtering handled via API

## External Dependencies

### Core Services
- **News API**: Primary news content source
- **OpenAI API**: Content analysis and summarization
- **Neon Database**: PostgreSQL hosting service

### Frontend Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **TanStack Query**: Server state management
- **Wouter**: Lightweight routing solution
- **React Hook Form**: Form handling with validation

### Backend Libraries
- **Drizzle ORM**: Type-safe database operations
- **Express**: Web application framework
- **Zod**: Runtime type validation
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

The application is designed for modern cloud deployment:

- **Development**: Vite dev server with hot module replacement
- **Production Build**: Static frontend assets served alongside Express API
- **Database**: PostgreSQL with migration support via Drizzle Kit
- **Environment**: Configuration via environment variables for API keys and database connections
- **Asset Handling**: Vite handles frontend asset optimization and bundling

### Build Process
1. **Frontend**: Vite builds React application to static assets
2. **Backend**: esbuild bundles Express server for production
3. **Database**: Drizzle migrations ensure schema consistency
4. **Deployment**: Single container with both frontend and backend components

The architecture prioritizes developer experience with TypeScript throughout, modern tooling, and clear separation of concerns while maintaining simplicity for deployment and maintenance.