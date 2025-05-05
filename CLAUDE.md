# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shopify Menu Copier is a Chrome extension that allows users to:
1. Copy existing menus from Shopify stores
2. Export menus as JSON for backup or transfer
3. Import menus from JSON files

## Commands

### Development

```bash
# Install dependencies
npm install

# Start development server with hot-reloading
npm run dev

# Build for production
npm run build

# Download latest Shopify GraphQL schema (optional)
npm run download-schema
```

## Architecture

- **Content Script**: `src/content-script.ts` - Injected into Shopify Admin pages to make authenticated GraphQL requests
- **Popup UI**: `src/popup/index.tsx` - React application for the extension popup
- **Menu Service**: `src/popup/lib/menu-service.ts` - Service for menu-related operations (fetch, copy, import, export)
- **GraphQL Client**: `src/popup/lib/graphql.ts` - Handles communication with the Shopify GraphQL API via the content script

### Data Flow

1. User interacts with popup UI
2. Popup components call menu service methods
3. Menu service makes GraphQL requests using the GraphQL client
4. GraphQL client sends messages to the content script
5. Content script executes authenticated API requests
6. Results flow back through the same chain

### Authentication

The extension leverages the user's existing Shopify admin session by making API requests from the content script, which has access to the user's cookies. No API keys or tokens are needed.

## Key Files

- `/src/popup/components/` - React components for the UI
- `/src/popup/lib/menu-types.ts` - TypeScript interfaces for menu data structures
- `/src/popup/lib/menu-service.ts` - Service for interacting with Shopify menus
- `/src/content-script.ts` - Handles authenticated API requests
- `/src/manifest.json` - Chrome extension configuration