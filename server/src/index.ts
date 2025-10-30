import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"]
  }
});

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// In-memory store for demo purposes
type Video = {
  id: string;
  title: string;
  description?: string;
  url: string; // could be a static file or external URL
  likes: number;
  createdAt: string;
};

const videos: Video[] = [
  {
    id: '1',
    title: 'Sample Video 1',
    description: 'A short sample video hosted externally',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    likes: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Sample Video 2',
    description: 'Another demo video',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    likes: 0,
    createdAt: new Date().toISOString()
  }
];

// Simple comments store per video (in-memory)
const comments: Record<string, Array<{ id: string; user: string; text: string; ts: string }>> = {};

app.use(cors());
app.use(express.json());
// Serve the frontend static files from ../public
app.use(express.static(path.join(__dirname, '..', 'public')));

// Root route
app.get('/', (req: express.Request, res: express.Response) => {
    res.json({ message: 'Welcome to the Real-time Chat Server' });
});

// Basic health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'ok' });
});

// List videos
app.get('/videos', (req: express.Request, res: express.Response) => {
  res.json(videos.map(v => ({ id: v.id, title: v.title, description: v.description, likes: v.likes })));
});

// Get video details
app.get('/videos/:id', (req: express.Request, res: express.Response) => {
  const vid = videos.find(v => v.id === req.params.id);
  if (!vid) return res.status(404).json({ error: 'Video not found' });
  res.json(vid);
});

// Create video metadata (no file upload for MVP)
app.post('/videos', (req: express.Request, res: express.Response) => {
  const { title, description, url } = req.body;
  if (!title || !url) return res.status(400).json({ error: 'title and url required' });
  const id = String(Date.now());
  const newVideo: Video = { id, title, description, url, likes: 0, createdAt: new Date().toISOString() };
  videos.push(newVideo);
  res.status(201).json(newVideo);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // join a video room to receive comments/likes for that video
  socket.on('joinVideo', (videoId: string) => {
    socket.join(`video_${videoId}`);
    console.log(`Socket ${socket.id} joined room video_${videoId}`);

    // send existing comments for that video
    const existing = comments[videoId] || [];
    socket.emit('comments:init', existing);

    // send current like count
    const vid = videos.find(v => v.id === videoId);
    socket.emit('likes:update', { videoId, likes: vid ? vid.likes : 0 });
  });

  // handle new comment
  socket.on('comment', (data: { videoId: string; user: string; text: string }) => {
    const { videoId, user, text } = data;
    const entry = { id: String(Date.now()), user, text, ts: new Date().toISOString() };
    if (!comments[videoId]) comments[videoId] = [];
    comments[videoId].push(entry);
    // broadcast to room
    io.to(`video_${videoId}`).emit('comment:new', entry);
    console.log(`Comment on video ${videoId} by ${user}: ${text}`);
  });

  // handle like
  socket.on('like', (data: { videoId: string }) => {
    const { videoId } = data;
    const vid = videos.find(v => v.id === videoId);
    if (vid) {
      vid.likes = (vid.likes || 0) + 1;
      io.to(`video_${videoId}`).emit('likes:update', { videoId, likes: vid.likes });
      console.log(`Video ${videoId} liked (total ${vid.likes})`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});