# Poker Pro

A modern web application for poker strategy and analysis.

## Project Structure

```
poker_pro/
├── frontend/          # Next.js frontend
└── backend/          # Express backend
```

## Getting Started

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following content:
```
PORT=3001
NODE_ENV=development
```

4. Run the development server:
```bash
npm run dev
```

The backend will be available at http://localhost:3001

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript files
- `npm start` - Start production server

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/hello` - Example endpoint

## Technologies Used

### Frontend
- Next.js
- TypeScript
- TailwindCSS

### Backend
- Node.js
- Express
- TypeScript
- CORS 