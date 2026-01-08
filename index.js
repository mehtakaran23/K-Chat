


// core modules
const http = require('http');
const fs = require('fs');
const path = require('path');

// socket.io
const { Server } = require('socket.io');

const PORT = process.env.PORT || 8000;

// ==================
// HTTP SERVER
// ==================
const server = http.createServer((req, res) => {

    let filePath = path.join(
        __dirname,
        'public',
        req.url === '/' ? 'index.html' : req.url
    );

    const ext = path.extname(filePath);

    const contentType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.mp3': 'audio/mpeg'
    }[ext] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('404 Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

// ==================
// SOCKET.IO SERVER
// ==================
const io = new Server(server);

const users = {};

io.on('connection', socket => {

    socket.on('new-user-joined', name => {
        if (!name) return;
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

   socket.on('send', message => {
    io.emit('receive', {
        message: message,
        name: users[socket.id]
    });
});


    socket.on('disconnecting', () => {
        const name = users[socket.id];
        if (name) {
            socket.broadcast.emit('left', name);
            delete users[socket.id];
        }
    });
});

// ==================
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

