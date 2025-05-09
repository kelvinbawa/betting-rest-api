# Sports Betting API

A production-ready RESTful API for sports betting data, focused on managing betting markets with event-driven updates for odds changes. Built following industry best practices including idempotency and The Twelve-Factor App methodology.

## Architecture Overview

This application is built with Node.js and TypeScript, using Express as the web framework. It follows clean architecture principles with clear separation of concerns between controllers, services, and data access layers. The application uses an event-driven pattern for odds updates, leveraging Node.js's built-in EventEmitter to notify subscribers when odds change.

The API is organized around domain-driven concepts (Sport, Event, Market, Selection) and implements best practices like idempotency for resilient client-server communication.

## The Twelve-Factor App Implementation
https://12factor.net/
This application follows the Twelve-Factor App methodology for building modern, scalable applications:

1. **Codebase**: One codebase tracked in version control (Git), deployable to multiple environments
2. **Dependencies**: Explicitly declared in package.json and isolated via npm/Docker
3. **Config**: Stored in environment variables, loaded via dotenv, centralized in config/env.ts
4. **Backing Services**: Designed to treat databases and other services as attached resources
5. **Build, Release, Run**: Separated via npm scripts and Docker build process
6. **Processes**: Designed as stateless processes, enabling horizontal scaling
7. **Port Binding**: Service exported via port binding (see Dockerfile)
8. **Concurrency**: Designed to scale out via the process model (see docker-compose.yml)
9. **Disposability**: Implements graceful shutdown for robust operation
10. **Dev/Prod Parity**: Environment-specific configurations with same codebase
11. **Logs**: Implemented as event streams using Winston logger
12. **Admin Processes**: Support for one-off administrative tasks (can be added as needed)

## Idempotency Implementation

Idempotency is a critical property for reliable betting operations. This API implements idempotency through:

- **Idempotency Keys**: Clients can provide an idempotency key in the request header
- **Result Caching**: The server stores the result of the first request with a given key
- **Safe Retries**: Subsequent identical requests return the cached result
- **Request Deduplication**: Prevents duplicate bets/operations in case of network issues

This ensures that even if a client retries a request (e.g., creating a bet slip, updating odds), the operation will only be performed once, preventing issues like duplicate bets or double-charging customers.

## Key Technical Decisions

- **TypeScript**: Provides type safety and better developer experience
- **Environment-based Configuration**: Configuration via environment variables for different deployment environments
- **Containerization**: Docker support for consistent deployments
- **Request Tracing**: Request IDs for tracking requests through the system
- **Rate Limiting**: Protection against excessive requests
- **Error Handling**: Centralized error handling with proper logging
- **Event-driven Architecture**: Real-time odds updates via event emitters
- **Graceful Shutdown**: Proper handling of termination signals

## API Endpoints

### Markets

- **GET /api/v1/markets** - Get all markets with optional filtering
  - Query parameters: `sportId`, `eventId`, `status`
  - Example: `GET /api/v1/markets?sportId=sport1&status=open`

- **GET /api/v1/markets/:id** - Get a specific market by ID
  - Example: `GET /api/v1/markets/market1`

- **POST /api/v1/markets** - Create a new market
  - Example request:
    ```json
    {
      "eventId": "event1",
      "name": "Win Market",
      "selections": [
        { "name": "Selection 1", "odds": 2.0 },
        { "name": "Selection 2", "odds": 3.0 }
      ]
    }
    ```

- **PATCH /api/v1/markets/:id/odds** - Update odds for selections in a market
  - Example request:
    ```json
    {
      "updates": [
        { "selectionId": "sel1", "odds": 2.5 },
        { "selectionId": "sel2", "odds": 2.8 }
      ]
    }
    ```

## Setup and Running

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sports-betting-api.git
cd sports-betting-api

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start the server
npm start
```

The server will be running at http://localhost:3000 by default.
API documentation will be available at http://localhost:3000/api-docs

## Assumptions

- This is a simple but production grade api server, so some features like user authentication, rate limiting, and persistence are omitted
- Events and sports are pre-loaded or managed through separate endpoints (not fully implemented in this)
- The system prioritizes read performance over write consistency, as betting systems typically have more reads than writes
- Odds updates are expected to be frequent, hence the dedicated endpoint and event mechanism
- Filter parameters in the query string are AND conditions (all must match)

## AI Tool Usage

I used GitHub Copilot during this assessment primarily for:

- Generating boilerplate code structure and interface definitions
- Suggesting TypeScript interfaces for domain models
- Helping with repetitive pattern implementations

All AI-generated code was reviewed, refined, and integrated manually to ensure it matched the requirements and architecture. I particularly improved upon AI suggestions in:

- The event-driven design for odds updates
- The structure of the filtering logic
- Error handling patterns

I also used Grok during this assessment primarily for understanding how sport betting works: https://grok.com/share/bGVnYWN5_8b35376c-10dd-4402-9af6-a177ee54d79d



