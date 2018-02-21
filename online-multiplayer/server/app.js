/* global  */
// eslint-disable no-console
// nodejs so allow console logs

const app = require('express')();
const http = require('http').Server(app);

const gameObjects = [];// the static game objects which all threads will access

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
console.log('Server Started');
app.get('/JoinSlimeGame/:roomName', (req, res) => {
  gameService = new GameService();
  gameService.playerJoinGame(req.params.roomName);
  res.send(`<h1>${req.params.roomName}</h1>`);
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, () => {
});

const io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log('a user connected');
  // if game already exist, then add player to object and exit out
  // if game is new, start timer and create game

  // ping/createGame
  // joinGame
  socket.on('joinGame', (joinGameInfo) => {
    console.log('a user joined game:');
    const targetGame = gameObjects[joinGameInfo.gameName];
    console.log(gameObjects[joinGameInfo.gameName]);

    const newPlayer = {
      playerName: joinGameInfo.playerName,
      playerHash: hash(joinGameInfo.playerGuid),
      ts: new Date().getTime(),
      score: 0,
    };
    // if no game exist for recieved gameroom, so create.
    if (gameObjects[joinGameInfo.gameName] === [] || gameObjects[joinGameInfo.gameName] == null) {
      gameObjects[joinGameInfo.gameName] = {
        players: [],
        inProgress: false,
        ts: new Date().getTime(),
      };
      gameObjects[joinGameInfo.gameName].players.push(newPlayer);
    } else if (gameObjects[joinGameInfo.gameName].players.length < 2) {
      // game exist and there 0 or 1 players
      // player 1 hash cannot = player 2 hash
      if (!(gameObjects[joinGameInfo.gameName].players.length === 1 &&
        newPlayer.playerHash === gameObjects[joinGameInfo.gameName].players[0].playerHash)) {
        gameObjects[joinGameInfo.gameName].players.push(newPlayer);
      } else {
        console.log('same player joined 2 times');
        console.log(gameObjects);
      }
    }

    if (gameObjects[joinGameInfo.gameName].players.length === 2) { // start game
      gameObjects[joinGameInfo.gameName].inProgress = true;
      console.log('GameStart');
      console.log(gameObjects);
      console.log(gameObjects[joinGameInfo.gameName].players);
    }
    // this.myTimer = setInterval(this.gameEngine.bind(this), this.gameUpdateTime);
    console.log('5');
    console.log(gameObjects[joinGameInfo.gameName].players.length);
  });
  socket.on('chat message', (msg) => {
    console.log(msg);
    io.emit(`chat message${msg.roomName}`, msg);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  const emitPlayerRefresh = (players) => {
    io.emit('playerRefresh', players);
  };


  const addPlayerToGame = () => {

  };

  const gameEngine = () => {
    this.frameCounter += 1;
    this.checkGameOver();// check to see if players lost
    // also end game if gametime exceeds 10 minutes incase player afk

    console.log();
    if (this.frameCounter > 3000) { // if both players dead, or game time past 10 minutes, end timer
      clearInterval(this.myTimer);
    }
  };
  const hash = (guid) => {
    let hashVal = 0;
    let i;
    let chr;
    if (guid.length === 0) return hashVal;
    for (i = 0; i < guid.length; i += 1) {
      chr = guid.charCodeAt(i);
      hashVal = ((hashVal << 5) - hashVal) + chr; // eslint-disable-line no-bitwise
      hashVal |= 0; // eslint-disable-line no-bitwise
    }
    return hashVal;
  };
  const checkGameOver = () => {
    // if score hits score limit, end game, return true
  };
  const resetPosition = (playerNum) => {
    // move players back to spawn, and tell clients ball angular velocity
    // so that it's synced up on both clients
  };
});
// socket methods
// relay a gameItemObject, with player pos, ball pos/velocity, round num, scores
// on client if roundnum != the server roundnum, then update round num, and ball pos,
// otherwise, update ball pos if ball is not on their side of the court
