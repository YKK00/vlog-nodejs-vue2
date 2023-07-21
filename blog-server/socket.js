const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let users = {};
let messageHistory = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', ({ username, userId }) => {
    users[socket.id] = { username, userId, socketId: socket.id };

    // Send message history to the newly joined user
    socket.emit('messageHistory', messageHistory);

    const joinMessage = { username, userId, text: `${username} has joined the chat` };
    messageHistory.push(joinMessage);
    socket.broadcast.emit('message', joinMessage);
    console.log('User joined:', username);
  });

  socket.on('message', (message) => {
    if (!users[socket.id]) {
      console.log('Received message from unknown user:', socket.id);
      return;
    }
    const userMessage = { username: users[socket.id].username, userId: users[socket.id].userId, text: message };
    messageHistory.push(userMessage);
    io.emit('message', userMessage);
  });

  socket.on('disconnect', () => {
    if (!users[socket.id]) {
      console.log('Unknown user disconnected:', socket.id);
      return;
    }
    const username = users[socket.id].username;
    const userId = users[socket.id].userId;
    delete users[socket.id];

    const disconnectMessage = { username, userId, text: `${username} has left the chat` };
    messageHistory.push(disconnectMessage);
    io.emit('message', disconnectMessage);
    console.log('User disconnected:', username);
  });
});

const port = 3001;
server.listen(port, () => {
  console.log(`端口正在${port}运行`);
});
