const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const users = {};

io.on('connection', (socket) => {
  socket.on('join', (username) => {
    users[socket.id] = username;
    io.emit('updateUsers', Object.values(users));
    io.emit('chatMessage', {
      user: 'System',
      message: `${username} has joined the chat.`,
    });
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    delete users[socket.id];
    io.emit('updateUsers', Object.values(users));
    io.emit('chatMessage', {
      user: 'System',
      message: `${username} has left the chat.`,
    });
  });

  socket.on('chatMessage', (message) => {
    io.emit('chatMessage', {
      user: users[socket.id],
      message: message,
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
