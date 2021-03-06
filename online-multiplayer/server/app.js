/* global  */
// eslint-disable no-console
// nodejs so allow console logs

const app = require('express')();
const http = require('http').Server(app);

let gameObjects = [];// the static game objects which all threads will access
let isGameEngineRunning = false;

class PlayerTemplate {
  constructor() {
    this.score = 0;
    this.position = { x: 0, y: 0 };
    this.direction = { x: 0, y: 0 };
  }
}
class BallTemplate {
  constructor() {
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
  }
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Header', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
console.log('Server Started');
app.get('/slimeapi/test/', (req, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 8081;
http.listen(PORT, () => {
});


const io = require('socket.io')(http, { path: '/slimeapi/socket.io' });

console.log(io);
// io.listen(app, { resource: 'slimeapi/socket.io' });

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
const verifyComingFromPlayer = (gameId, guid) => {
  const playerHash = hash(guid);
  for (let y = 0; y < gameObjects[gameId].players.length; y += 1) {
    if (playerHash === gameObjects[gameId].players[y].userHash) {
      return true;
    }
  }
  return false;
};

const createGameIfDoesNotExist = (gameName) => {
  const newGame = {
    roomName: gameName,
    players: [],
    inProgress: false,
    serveBall: true,
    p1Info: new PlayerTemplate(),
    p2Info: new PlayerTemplate(),
    ball: new BallTemplate(),
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
};
const startGame = (gameId) => {
  if (gameObjects[gameId].inProgress !== true) {
    gameObjects[gameId].inProgress = true;
    gameObjects[gameId].serveBall = true;
  }
};
const doWeHaveTwoActivePlayers = (gameId) => {
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
    // if player is already active, return
    if (gameObjects[gameId].players[x].playerNum > 0 &&
      gameObjects[gameId].players[x].userHash === userInfo.userHash) {
      return;
    }
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
    startGame(gameId);
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

io.of('/slimeapi').on('connection', (socket) => {
  // io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinGame', (userInfo) => {
    pingServer(userInfo, userInfo.gameName);
    tryAddPlayerToGame(userInfo, userInfo.gameName);
  });
  socket.on('chat message', (msg) => {
    console.log(msg);
    io.of('/slimeapi').emit(`chat message${msg.roomName}`, msg);
  });
  const resetClientPositions = (gameName) => {
    const resetPackage = {
      ballVelocity: { x: 20 * (Math.random() - 0.5), y: -5 * Math.random() },
      ts: Date.now(),
    };
    io.of('/slimeapi').emit(`resetPosition${gameName}`, resetPackage);
  };
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  let myInterval;
  let engineIterationCount = 0;
  const gameEngine = () => {
    engineIterationCount += 1;
    let lastActivity = new Date(0).getTime(); // find out last player activity across all games
    // loop through all game rooms
    for (let x = 0; x < gameObjects.length; x += 1) {
      // find last player activity
      let endGameFlag = false;
      for (let y = 0; y < gameObjects[x].players.length; y += 1) {
        if (gameObjects[x].players[y].ts > lastActivity) {
          lastActivity = gameObjects[x].players[y].ts;
        }
        if (gameObjects[x].players[y].playerNum > 0 &&
          gameObjects[x].players[y].ts < new Date().getTime() - (1000 * 15)) { // inactive 15 sec
          const msg = { playerName: 'SERVER', message: `${gameObjects[x].players[y].username} removed for being inactive` };
          io.of('/slimeapi').emit(`chat message${gameObjects[x].roomName}`, msg);
          gameObjects[x].players[y].playerNum = 0; // remove as an active player
          // if game was in progress and player removed, end game
          endGameFlag = true;
        }
        // find out if a player1 has 7 points/won the game
        if (gameObjects[x].players[y].playerNum === 1 && gameObjects[x].p1Info.score >= 7) {
          const msg = { playerName: 'SERVER', message: `${gameObjects[x].players[y].username} Won The Game!` };
          io.of('/slimeapi').emit(`chat message${gameObjects[x].roomName}`, msg);
          gameObjects[x].players[y].playerNum = 0; // remove as an active player
          // if game was in progress and player removed, end game
          endGameFlag = true;
        }
        // find out if a player2 has 7 points/won the game
        if (gameObjects[x].players[y].playerNum === 2 && gameObjects[x].p2Info.score >= 7) {
          const msg = { playerName: 'SERVER', message: `${gameObjects[x].players[y].username} Won The Game!` };
          io.of('/slimeapi').emit(`chat message${gameObjects[x].roomName}`, msg);
          gameObjects[x].players[y].playerNum = 0; // remove as an active player
          // if game was in progress and player removed, end game
          endGameFlag = true;
        }
      }
      // if player was removed, clear our all players from game and end game
      if (endGameFlag && gameObjects[x].inProgress === true) {
        const msg = { playerName: 'SERVER', message: 'Ending Game' };
        io.of('/slimeapi').emit(`chat message${gameObjects[x].roomName}`, msg);
        gameObjects[x].inProgress = false;
        gameObjects[x].players = [];
        gameObjects[x].p1Info = new PlayerTemplate();
        gameObjects[x].p2Info = new PlayerTemplate();
      }
      // if game in progress emit each .1 second
      // if not in progress emit each 3 seconds
      if (gameObjects[x].serveBall && gameObjects[x].inProgress === true) {
        gameObjects[x].serveBall = false;
        resetClientPositions(gameObjects[x].roomName);
      }
      if (gameObjects[x].inProgress === true || engineIterationCount % 30 === 0) {
        io.of('/slimeapi').emit(`gameRefresh${gameObjects[x].roomName}`, gameObjects[x]);
      }
    }
    if (lastActivity < new Date().getTime() - (1000 * 15)) {
      clearInterval(myInterval);
      gameObjects = [];
      isGameEngineRunning = false;
      engineIterationCount = 0;
      console.log('Cleared Game Object');
    }
  };
  const tryStartEngine = () => {
    if (!isGameEngineRunning) {
      isGameEngineRunning = true;
      myInterval = setInterval(gameEngine, 100);
      console.log('Starting Int');
    }
  };
  socket.on('pingServer', (pingInfo) => {
    pingServer(pingInfo, pingInfo.gameName);
    tryStartEngine();
  });
  socket.on('emitGameObjectPositions', (positionInfo) => {
    const gameId = lookUpGameIdByName(positionInfo.gameName);
    if (verifyComingFromPlayer(gameId, positionInfo.reportedBy)) {
      // emit what came in, but strip out Guid
      const positionPackage = {
        ball: positionInfo.ball,
        player: positionInfo.player,
        ts: positionInfo.ts,
      };
      io.of('/slimeapi').emit(`updateGameObjectPositions${gameObjects[gameId].roomName}`, positionPackage);
    }
  });
  socket.on('resetNoScore', (resetInfo) => {
    const gameId = lookUpGameIdByName(resetInfo.gameName);
    if (verifyComingFromPlayer(gameId, resetInfo.userGuid)) {
      // emit what came in, but strip out Guid
      resetClientPositions(resetInfo.gameName);
      const msg = { playerName: 'SERVER', message: 'Out of Sync detected, resetting positions' };
      io.of('/slimeapi').emit(`chat message${resetInfo.gameName}`, msg);
    }
  });
  socket.on('updateScore', (scoreInfo) => {
    const gameId = lookUpGameIdByName(scoreInfo.gameName);
    if (gameObjects[gameId].inProgress === true &&
      verifyComingFromPlayer(gameId, scoreInfo.reportedBy)) {
      if (scoreInfo.p1Score > gameObjects[gameId].p1Info.score) {
        gameObjects[gameId].p1Info.score += 1;
        resetClientPositions(scoreInfo.gameName);
      } else if (scoreInfo.p2Score > gameObjects[gameId].p2Info.score) {
        gameObjects[gameId].p2Info.score += 1;
        resetClientPositions(scoreInfo.gameName);
      }
    }
  });
});
// parking lot
// take in player data and update game object
// sanitize incoming data
// end game if it goes on too long
//
