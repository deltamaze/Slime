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
// app.get('/GetActiveSlimeGames/', (req, res) => {
//   gameService = new GameService();
//   gameService.playerJoinGame(req.params.roomName);
//   res.send(`<h1>${req.params.roomName}</h1>`);
// });

const PORT = process.env.PORT || 8080;
http.listen(PORT, () => {
});

const io = require('socket.io')(http);

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
const createGameIfDoesNotExist = (gameName) => {
  if (gameObjects[gameName] === [] || gameObjects[gameName] == null) {
    gameObjects[gameName] = {
      players: [],
      inProgress: false,
      ts: new Date().getTime(),
    };
  }
};
const addPlayerToGame = (userInfo, playerNum, gameName) => {
  for (let x = 0; x < gameObjects[gameName].players.length; x += 1) {
    if (gameObjects[gameName].players[x].userHash === userInfo.userHash) {
      gameObjects[gameName].players[x].playerNum = playerNum;
    }
  }
  console.log(gameObjects[gameName].players);
};
const startGame = (userInfo, playerNum, gameName) => {
  console.log('not implemented2');
  console.log(gameName);
};
const doWeHaveTwoActivePlayers = (gameName) => {
  let doesPlayerOneExist = false;
  let doesPlayerTwoExist = false;
  console.log(gameObjects);

  for (let x = 0; x < gameObjects[gameName].players.length; x += 1) {
    if (gameObjects[gameName].players[x].playerNum === 1) {
      doesPlayerOneExist = true;
    }
    if (gameObjects[gameName].players[x].playerNum === 2) {
      doesPlayerTwoExist = true;
    }
  }
  return (doesPlayerOneExist && doesPlayerTwoExist);
};
const tryAddPlayerToGame = (rawUserInfo, gameName) => {
  const userInfo = {
    username: rawUserInfo.username,
    userHash: hash(rawUserInfo.userGuid),
  };

  let doesPlayerOneExist = false;
  let doesPlayerTwoExist = false;

  for (let x = 0; x < gameObjects[gameName].players.length; x += 1) {
    if (gameObjects[gameName].players[x].playerNum === 1) {
      doesPlayerOneExist = true;
    }
    if (gameObjects[gameName].players[x].playerNum === 2) {
      doesPlayerTwoExist = true;
    }
  }
  if (!doesPlayerOneExist) {
    addPlayerToGame(userInfo, 1, gameName);
  } else if (!doesPlayerTwoExist) {
    addPlayerToGame(userInfo, 2, gameName);
  }

  if (doWeHaveTwoActivePlayers(gameName)) {
    startGame();
  }
};

const pingServer = (rawUserInfo, gameName) => {
  const userInfo = {
    username: rawUserInfo.username,
    userHash: hash(rawUserInfo.userGuid),
    ts: new Date().getTime(),
    playerNum: 0,
    score: 0,
  };
  // if game doesn't exist, create
  createGameIfDoesNotExist(gameName);
  // if user not in game, add
  let userInGame = false;

  for (let x = 0; x < gameObjects[gameName].players.length; x += 1) {
    if (gameObjects[gameName].players[x].userHash === userInfo.userHash) {
      userInGame = true;
      gameObjects[gameName].players[x].ts = new Date().getTime();
    }
  }
  if (userInGame === false) {
    gameObjects[gameName].players.push(userInfo);
  }
};
io.on('connection', (socket) => {
  console.log('a user connected');
  // if game already exist, then add player to object and exit out
  // if game is new, start timer and create game

  // ping/createGame
  // joinGame
  socket.on('joinGame', (userInfo) => {
    pingServer(userInfo, userInfo.gameName);
    // count players in game, if < 2, then add user.
    // if count was 1, then add player and start game, otherwise wait
    // do nothing if count > 2
    tryAddPlayerToGame(userInfo, userInfo.gameName);
  });
  socket.on('chat message', (msg) => {
    io.emit(`chat message${msg.roomName}`, msg);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('pingServer', (pingInfo) => {
    pingServer(pingInfo, pingInfo.gameName);
  });

  // const emitPlayerRefresh = (players) => {
  //   io.emit('playerRefresh', players);
  // };
  let myInterval;
  const gameEngine = () => {
    this.frameCounter += 1;
    this.checkGameOver();// check to see if players lost
    // also end game if gametime exceeds 10 minutes incase player afk

    //   console.log();
    // if both players dead, or game time past 10 minutes, end timer
    if (this.frameCounter > 3000) {
      clearInterval(myInterval);
    }
  };
  myInterval = setInterval(gameEngine, 3000);

  // const checkGameOver = () => {
  //   // if score hits score limit, end game, return true
  // };
  // const resetPosition = (playerNum) => {
  //   // move players back to spawn, and tell clients ball angular velocity
  //   // so that it's synced up on both clients
  // };
});


// parking lot
// timer outside socket that clears inactive players
