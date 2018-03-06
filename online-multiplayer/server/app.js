/* global  */
// eslint-disable no-console
// nodejs so allow console logs

const app = require('express')();
const http = require('http').Server(app);

let gameObjects = [];// the static game objects which all threads will access
let isGameEngineRunning = false;

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
  const newGame = {
    roomName: gameName,
    players: [],
    inProgress: false,
    ts: new Date().getTime(),
  };
  gameObjects.push(newGame);
  return gameObjects.length - 1;
};
const lookUpGameIdByName = (gameName) => {
  let returnId = -1;
  for (let i = 0; i < gameObjects.length; i += 1) {
    if (gameObjects[i].roomName === gameName) {
      returnId = i;
    }
  }
  if (returnId === -1) {
    returnId = createGameIfDoesNotExist(gameName);
  }
  return returnId;
};
const addPlayerToGame = (userInfo, playerNum, gameId) => {
  for (let x = 0; x < gameObjects[gameId].players.length; x += 1) {
    if (gameObjects[gameId].players[x].userHash === userInfo.userHash) {
      gameObjects[gameId].players[x].playerNum = playerNum;
    }
  }
  console.log(gameObjects[gameId].players);
};
const startGame = (userInfo, playerNum, gameId) => {
  console.log('not implemented2');
  console.log(gameId);
};
const doWeHaveTwoActivePlayers = (gameId) => {
  let doesPlayerOneExist = false;
  let doesPlayerTwoExist = false;
  console.log(gameObjects);

  for (let x = 0; x < gameObjects[gameId].players.length; x += 1) {
    if (gameObjects[gameId].players[x].playerNum === 1) {
      doesPlayerOneExist = true;
    }
    if (gameObjects[gameId].players[x].playerNum === 2) {
      doesPlayerTwoExist = true;
    }
  }
  return (doesPlayerOneExist && doesPlayerTwoExist);
};
const tryAddPlayerToGame = (rawUserInfo, gameName) => {
  const gameId = lookUpGameIdByName(gameName);
  const userInfo = {
    username: rawUserInfo.username,
    userHash: hash(rawUserInfo.userGuid),
  };

  let doesPlayerOneExist = false;
  let doesPlayerTwoExist = false;

  for (let x = 0; x < gameObjects[gameId].players.length; x += 1) {
    if (gameObjects[gameId].players[x].playerNum === 1) {
      doesPlayerOneExist = true;
    }
    if (gameObjects[gameId].players[x].playerNum === 2) {
      doesPlayerTwoExist = true;
    }
  }
  if (!doesPlayerOneExist) {
    addPlayerToGame(userInfo, 1, gameId);
  } else if (!doesPlayerTwoExist) {
    addPlayerToGame(userInfo, 2, gameId);
  }

  if (doWeHaveTwoActivePlayers(gameId)) {
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
  const gameId = lookUpGameIdByName(gameName);
  // if user not in game, add
  let userInGame = false;

  for (let x = 0; x < gameObjects[gameId].players.length; x += 1) {
    if (gameObjects[gameId].players[x].userHash === userInfo.userHash) {
      userInGame = true;
      gameObjects[gameId].players[x].ts = new Date().getTime();
    }
  }
  if (userInGame === false) {
    gameObjects[gameId].players.push(userInfo);
  }
};
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinGame', (userInfo) => {
    pingServer(userInfo, userInfo.gameName);
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
  let engineIterationCount = 0;
  const gameEngine = () => {
    engineIterationCount += 1;
    isGameEngineRunning = true;
    let lastActivity = new Date(0).getTime(); // find out last player activity across all games
    // loop through all game rooms
    for (let x = 0; x < gameObjects.length; x += 1) {
      // find last player activity4
      for (let y = 0; y < gameObjects[x].players.length; y += 1) {
        if (gameObjects[x].players[y].ts > lastActivity) {
          lastActivity = gameObjects[x].players[y].ts;
        }
      }
      if (gameObjects[x].inProgress === true || engineIterationCount % 30 === 0) {
        io.emit(`gameRefresh${gameObjects[x].roomName}`, gameObjects[x]);
      }
    }
    if (lastActivity < new Date().getTime() * 1000 * 60) {
      clearInterval(myInterval);
      gameObjects = [];
      isGameEngineRunning = false;
      engineIterationCount = 0;
    }
  };
  if (!isGameEngineRunning) {
    myInterval = setInterval(gameEngine, 3000);
  }

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
