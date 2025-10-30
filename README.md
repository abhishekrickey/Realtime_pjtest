# Real-time Chat Application

A real-time chat application built with React, Node.js, and Socket.IO.



## Project Structure

- `/client` - React frontend application
- `/server` - Node.js backend server

## Getting Started
- First, make sure you're in the server directory and install the dependencies:
  `cd server; npm install express socket.io cors typescript @types/express @types/cors @types/node ts-node-dev`

 - I see we're still having permission issues with PowerShell. Let's try with the Node terminal that's available:
    `pm install express socket.io cors typescript @types/express @types/cors @types/node ts-node-dev`
   
- After the installation is complete, start the servnpx ts-node-dev src/index.tser:
- `npx ts-node-dev src/index.ts`
1. Install dependencies:
   ```bash
   npm run install-all

   npx
   ```

2. Start the development servers:
   ```bash
   npm start
   ```



This will start both the client (React) and server (Node.js) applications.

- Client runs on: http://localhost:3000
- Server runs on: http://localhost:3001

## Features

- Real-time messaging
- TypeScript support
- Scalable architecture

## Update summary:

Added a minimal in-memory video store and endpoints:
GET /videos — list videos
GET /videos/:id — get video details
POST /videos — create video metadata (title + url required)
Added an in-memory comments store placeholder
Left real-time Socket.IO connection in place (we'll wire rooms/events next)
