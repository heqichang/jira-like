require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { sequelize } = require('./models/associations');
const { errorHandler } = require('./utils/errors');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const sprintRoutes = require('./routes/sprintRoutes');
const epicRoutes = require('./routes/epicRoutes');
const timeLogRoutes = require('./routes/timeLogRoutes');
const tagRoutes = require('./routes/tagRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const ganttRoutes = require('./routes/ganttRoutes');
const config = require('./config');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  req.io = io;
  next();
});

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskFlow API',
      version: '1.0.0',
      description: '面向研发团队的项目任务管理系统 API',
    },
    servers: [{ url: `http://localhost:${config.port}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/routes/*.js'],
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects', taskRoutes);
app.use('/api/projects', sprintRoutes);
app.use('/api/projects', epicRoutes);
app.use('/api/projects', timeLogRoutes);
app.use('/api/projects', tagRoutes);
app.use('/api/projects', ganttRoutes);
app.use('/api', notificationRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('join', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined their room`);
  });
  
  socket.on('leave', (userId) => {
    socket.leave(`user:${userId}`);
    console.log(`User ${userId} left their room`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const start = async () => {
  try {
    await sequelize.sync({ alter: true });
  } catch (err) {
    console.warn('⚠️ alter 模式同步失败，尝试强制重建表结构...');
    await sequelize.sync({ force: true });
  }
  server.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
    console.log(`📚 API Docs at http://localhost:${config.port}/api/docs`);
    console.log(`🔌 WebSocket running on ws://localhost:${config.port}`);
  });
};

start();
