const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path'); // Add path module

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

const regions = {
  region1: { owner: null, question: 'What is 2 + 2?', answer: '4' },
  region2: { owner: null, question: 'What is the capital of France?', answer: 'Paris' },
  region3: { owner: null, question: 'What is 3 + 5?', answer: '8' },
  region4: { owner: null, question: 'What is the largest planet?', answer: 'Jupiter' },
};

let players = {};

io.on('connection', (socket) => {
  console.log('New player connected', socket.id);
  players[socket.id] = { score: 0 };

  socket.on('getQuestion', (data) => {
    const { regionId } = data;
    const region = regions[regionId];

    if (region) {
      if (!region.owner) {
        socket.emit('question', { question: region.question });
      } else {
        socket.emit('question', { question: 'This region is already claimed.' });
      }
    } else {
      socket.emit('question', { question: 'Invalid region.' });
    }
  });

  socket.on('claimRegion', (data) => {
    const { regionId, answer } = data;
    const region = regions[regionId];

    if (region && region.answer.toLowerCase() === answer.toLowerCase() && !region.owner) {
      region.owner = socket.id;
      players[socket.id].score += 1;
      io.emit('regionClaimed', { regionId, owner: socket.id });
    } else {
      socket.emit('wrongAnswer');
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected', socket.id);
    Object.keys(regions).forEach(regionId => {
      if (regions[regionId].owner === socket.id) {
        regions[regionId].owner = null;
      }
    });
    delete players[socket.id];
  });
});

// Serve the login page
// Modify the route to serve the login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle login POST request
app.post('/login', (req, res) => {
  // Check credentials and authenticate user
  const { username, password } = req.body; // Assuming you're using a form POST request
  if (isValidCredentials(username, password)) {
    // Redirect to game page on successful login
    res.redirect('/game');
  } else {
    // Redirect back to login page with error message
    res.redirect('/?error=1');
  }
});

// Serve the game page
app.get('/game', (req, res) => {
  // Check if user is authenticated (you can use session, JWT, etc.)
  // If not authenticated, redirect to login page
  // If authenticated, serve the game page
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 4595;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});











