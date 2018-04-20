/* global Player document Boundry Ball Matter keyIsDown textSize
noStroke background fill text $ io createCanvas dist int */


function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  // return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
  //   s4() + '-' + s4() + s4() + s4();
}
function hash(targetString) {
  let returnHash = 0;
  let i;
  let chr;
  if (targetString.length === 0) return returnHash;
  for (i = 0; i < targetString.length; i += 1) {
    chr = targetString.charCodeAt(i);
    returnHash = ((returnHash << 5) - returnHash) + chr; // eslint-disable-line no-bitwise
    returnHash |= 0; // eslint-disable-line no-bitwise
  }
  return returnHash;
}


const myGuid = guid();
const myHash = hash(myGuid);
let myName = `Player${(Math.floor(Math.random() * 10000)).toString()}`;
let myRoom = 'Main';
let ballUpdateTime = 0;
let serverGameObject = {
  roomName: '',
  players: [],
  inProgress: false,
  serveBall: true,
  ts: new Date().getTime(),
};

// show current name/room in html
const socket = io('https://apis.wpooley.com/slimeapi', {
  // const socket = io.connect('localhost:8081/slimeapi', {
  path: '/slimeapi/socket.io',
});
function addLiToChatUl(msg) {
  const ul = document.getElementById('chatUl');// .prepend(`<li>${msg}</li>`);
  const li = document.createElement('li');
  li.innerHTML = msg;
  ul.prepend(li);
}

function updateDisplaySettings() {
  document.getElementById('displayUsername').innerHTML = myName;
  document.getElementById('displayRoom').innerHTML = myRoom;
}
$(document).ready(() => { updateDisplaySettings(); });

function postChat() { // eslint-disable-line no-unused-vars
  // grab content of chat
  const chatInputField = document.getElementById('chatText');
  const msgText = chatInputField.value;
  // post package
  const msg = {
    roomName: myRoom,
    playerName: myName,
    message: msgText,
  };
  socket.emit('chat message', msg);
  chatInputField.value = '';
}

function joinGame() { // eslint-disable-line no-unused-vars
  const userInfo = {
    gameName: myRoom,
    userGuid: myGuid,
    username: myName,
  };
  socket.emit('joinGame', userInfo);
  // send up join game with a guid. server will confirm by returning a failure,
  // or returning back your hash. if myHash = serverHash, then we good.
}

let engine;
let player1;
let player2;
let ball;
let p1Floor;
let p2Floor;
const gameBodies = [];
const canvasHeight = 400;
const canvasWidth = 800;
const playerGroundedYPos = 329;
const vertForce = 0.05;
const defaultTicksOfUpwardThrust = 10;
const upForcePerTick = 0.05;
const downForce = 0.03;

function currentPlayerStatus() {
  if (myHash === player1.userHash) {
    return 1;
  } else if (myHash === player2.userHash) {
    return 2;
  }
  return 0;
}

let pingInterval = 0;
socket.on('connect', conn => conn);
function pingServer() {
  if (pingInterval % 60 === 0) {
    const pingInfo = {
      gameName: myRoom,
      userGuid: myGuid,
      username: myName,
    };
    socket.emit('pingServer', pingInfo);
    // if no ball update in 10 seconds, ball is probably out of sync
    // ask server to reset the position
    if (serverGameObject.inProgress === true &&
      currentPlayerStatus() > 0 &&
      ballUpdateTime + 10000 < Date.now()) {
      const resetInfo = {
        gameName: myRoom,
        userGuid: myGuid,
      };
      socket.emit('resetNoScore', resetInfo);
      ballUpdateTime = Date.now();
    }
  }
  // if game in progress, i am player, and ball on my side of court
  // todo: come back here and fix x positions and package
  if (serverGameObject.inProgress === true && currentPlayerStatus() > 0) {
    // (
    //   (currentPlayerStatus() === 1 &&
    //     (ball.body.position.x < canvasWidth / 2 || pingInterval % 5 === 0
    //     )) ||
    //   (currentPlayerStatus() === 2 &&
    //     (ball.body.position.x > canvasWidth / 2 || pingInterval % 5 === 0
    //     ))
    // )) {

    const positionInfo = {
      gameName: myRoom,
      reportedBy: myGuid,
      ball: {
        pos: ball.body.position,
        vel: ball.body.velocity,
      },
      player: {
        playerNum: currentPlayerStatus(),
        pos: { x: 0, y: 0 },
        vel: { x: 0, y: 0 },
        upTick: 0,
        hit: 0,
      },
      ts: Date.now(),
    };
    // populate player data with corresponding current player object
    if (positionInfo.player.playerNum === 1) {
      positionInfo.player.pos = player1.body.position;
      positionInfo.player.vel = player1.body.velocity;
      positionInfo.player.upTick = player1.ticksOfUpwardThrust;
      positionInfo.player.hits = player1.hitCount;
    } else if (positionInfo.player.playerNum === 2) {
      positionInfo.player.pos = player2.body.position;
      positionInfo.player.vel = player2.body.velocity;
      positionInfo.player.upTick = player2.ticksOfUpwardThrust;
      positionInfo.player.hits = player2.hitCount;
    }
    socket.emit('emitGameObjectPositions', positionInfo);
  }
  //
  pingInterval += 1;
}

setInterval(pingServer, 10);

function updateScore(playerThatScores) {
  // emit if currently a player
  const newScore = {
    gameName: myRoom,
    reportedBy: myGuid,
    p1Score: 0,
    p2Score: 0,
  };
  if (playerThatScores === 1) {
    newScore.p1Score = player1.score + 1;
    newScore.p2Score = player2.score;
  }
  if (playerThatScores === 2) {
    newScore.p1Score = player1.score;
    newScore.p2Score = player2.score + 1;
  }
  // only emit if you were the one who got scored on
  if (currentPlayerStatus() > 0 && currentPlayerStatus() !== playerThatScores) {
    socket.emit('updateScore', newScore);
  }
}
function resetBall(velocity) {
  // Matter.Body.setStatic(ball.body, false);
  Matter.Body.setPosition(ball.body, { x: canvasWidth / 2, y: 100 });
  Matter.Body.setVelocity(ball.body, velocity);
  player1.hitCount = 0;
  player2.hitCount = 0;
}

function resetPlayers() {
  Matter.Body.setPosition(player1.body, { x: 150, y: 200 });
  Matter.Body.setPosition(player2.body, { x: canvasWidth - 150, y: 200 });
}
function collision(event) {
  if (event.pairs[0].bodyA.label === 'ball' || event.pairs[0].bodyB.label === 'ball') {
    if (event.pairs[0].bodyA.label === 'player1' || event.pairs[0].bodyB.label === 'player1') {
      if (Date.now() > player1.lastHit + 500) {
        player1.hitCount += 1;
        player1.lastHit = Date.now();
        if (player1.hitCount > 3) {
          updateScore(2);
        }
      }
      player2.hitCount = 0;
    }
    if (event.pairs[0].bodyA.label === 'player2' || event.pairs[0].bodyB.label === 'player2') {
      if (Date.now() > player2.lastHit + 500) {
        player2.hitCount += 1;
        player2.lastHit = Date.now();
        if (player2.hitCount > 3) {
          updateScore(1);
        }
      }
      player1.hitCount = 0;
    }
  }


  if (event.pairs[0].bodyA.label === 'ball' || event.pairs[0].bodyB.label === 'ball') {
    if (event.pairs[0].bodyA.label === 'p1Floor' || event.pairs[0].bodyB.label === 'p1Floor') {
      updateScore(2);
    }
    if (event.pairs[0].bodyA.label === 'p2Floor' || event.pairs[0].bodyB.label === 'p2Floor') {
      updateScore(1);
    }
  }
}
function setup() { // eslint-disable-line no-unused-vars
  const canvas = createCanvas(canvasWidth, canvasHeight);// eslint-disable-line no-unused-vars
  canvas.parent('p5-holder');
  engine = Matter.Engine.create();
  engine.timing.timeScale = 0.8;
  engine.world.gravity.scale = 0.0005;
  Matter.Engine.run(engine);

  player1 = new Player(engine.world, 40, 150, 200, 1);
  player2 = new Player(engine.world, 40, canvasWidth - 150, 200, 2);
  player2.colorBlue = 0;
  player2.colorRed = 255;
  p1Floor = new Boundry(engine.world, canvasWidth / 4, canvasHeight, canvasWidth / 2, 100, 0, 'p1Floor');
  p2Floor = new Boundry(engine.world, (canvasWidth / 4) + (canvasWidth / 2), canvasHeight, canvasWidth / 2, 100, 0, 'p2Floor');
  ball = new Ball(engine.world, canvasWidth / 2, 100, 10);

  gameBodies.push(player1);
  gameBodies.push(player2);
  gameBodies.push(ball);
  gameBodies.push(p1Floor);
  gameBodies.push(p2Floor);
  // leftwall
  gameBodies.push(new Boundry(engine.world, 0, canvasHeight / 2, 100, canvasHeight));
  // rightwall
  gameBodies.push(new Boundry(engine.world, canvasWidth, canvasHeight / 2, 100, canvasHeight));

  gameBodies.push(new Boundry(engine.world, canvasWidth / 2, canvasHeight, 15, 230));// net
  gameBodies.push(new Boundry(engine.world, canvasWidth / 2, 285, 0, 7.5, 3));// net triangle
  gameBodies.push(new Boundry(engine.world, canvasWidth / 2, 0, canvasWidth, 100));// ciel

  Matter.Events.on(engine, 'collisionStart', collision);
}

function displayGameText() {
  const p1UsernameText = `P1: ${player1.username}`;
  const p2UsernameText = `P2: ${player2.username}`;
  const p1ScoreText = `Score: ${player1.score.toString()}`;
  const p2ScoreText = `Score: ${player2.score.toString()}`;
  const p1HitCountText = `Hits: ${player1.hitCount.toString()}/3`;
  const p2HitCountText = `Hits: ${player2.hitCount.toString()}/3`;
  const p1TextXPos = (canvasWidth / 2) - (canvasWidth / 3);
  const p2TextXPos = (canvasWidth / 2) + (canvasWidth / 6);
  // p1
  textSize(26);
  noStroke();
  fill(0, 100, 255);
  text(p1UsernameText, p1TextXPos, 70);
  textSize(26);
  noStroke();
  fill(0, 100, 255);
  text(p1ScoreText, p1TextXPos, 90);
  textSize(26);
  noStroke();
  fill(0, 100, 255);
  text(p1HitCountText, p1TextXPos, 110);
  // p2
  textSize(26);
  noStroke();
  fill(255, 100, 0);
  text(p2UsernameText, p2TextXPos, 70);

  textSize(26);
  noStroke();
  fill(255, 100, 0);
  text(p2ScoreText, p2TextXPos, 90);
  textSize(26);
  noStroke();
  fill(255, 100, 0);
  text(p2HitCountText, p2TextXPos, 110);
  // isGameInProgressText
  if (!serverGameObject.inProgress) {
    textSize(26);
    noStroke();
    fill(255, 255, 0);
    text('Waiting for 2 players to join.', (canvasWidth / 2) - (canvasWidth / 5), 200);
  }
}
function ApplyUpTick(player) {
  if (player.body.position.y >= playerGroundedYPos) {
    player.ticksOfUpwardThrust = defaultTicksOfUpwardThrust;
  }
}
function ApplyVertMovement(player, direction) {
  Matter.Body.applyForce(player.body, player.body.position, { x: direction * vertForce, y: 0 });
}
/* eslint no-param-reassign: [0, { "ticksOfUpwardThrust": false }] */
function draw() { // eslint-disable-line no-unused-vars
  background(51);
  displayGameText();
  gameBodies.forEach((gameBody) => {
    gameBody.show();
    // apply upforce to players
    if (gameBody.body.label.startsWith('player') && gameBody.ticksOfUpwardThrust > 0) {
      Matter.Body.applyForce(gameBody.body, gameBody.body.position, { x: 0, y: -upForcePerTick });
      gameBody.ticksOfUpwardThrust -= 1;
    }
    // apply downforce to player
    if (gameBody.body.label.startsWith('player') && gameBody.body.velocity.y > 0) {
      // create additional downward trust when not moving upward
      Matter.Body.applyForce(gameBody.body, gameBody.body.position, { x: 0, y: downForce });
    }
  }, this);

  // PLAYER INPUT
  if (keyIsDown(87)) { // w
    if (currentPlayerStatus() === 1) {
      ApplyUpTick(player1);
    }
    if (currentPlayerStatus() === 2) {
      ApplyUpTick(player2);
    }
  }
  if (keyIsDown(68)) { // a
    if (currentPlayerStatus() === 1) {
      ApplyVertMovement(player1, 1);
    }
    if (currentPlayerStatus() === 2) {
      ApplyVertMovement(player2, 1);
    }
  }
  if (keyIsDown(65)) { // d
    if (currentPlayerStatus() === 1) {
      ApplyVertMovement(player1, -1);
    }
    if (currentPlayerStatus() === 2) {
      ApplyVertMovement(player2, -1);
    }
  }
  // debug key, S
  if (keyIsDown(83)) { // d
  }
}

function setRoomListeners() {
  socket.on((`chat message${myRoom}`), (msg) => {
    addLiToChatUl(`${msg.playerName}:${msg.message}`);
  });
  socket.on((`gameRefresh${myRoom}`), (gameObj) => {
    // make sure p5 objects are setup first
    if (player1 === undefined || player2 === undefined) {
      return;
    }
    serverGameObject = gameObj;
    // get p1 and p2 info
    let p1Updated = false;
    let p2Updated = false;
    player1.score = gameObj.p1Info.score;
    player2.score = gameObj.p2Info.score;
    for (let x = 0; x < gameObj.players.length; x += 1) {
      if (gameObj.players[x].playerNum === 1) {
        player1.username = gameObj.players[x].username;
        player1.userHash = gameObj.players[x].userHash;
        p1Updated = true;
      }
      if (gameObj.players[x].playerNum === 2) {
        player2.username = gameObj.players[x].username;
        player2.userHash = gameObj.players[x].userHash;
        p2Updated = true;
      }
    }
    if (!p1Updated) {
      player1.username = '';
      player1.userHash = '';
    }
    if (!p2Updated) {
      player2.username = '';
      player2.userHash = '';
    }
  });
  socket.on((`updateGameObjectPositions${myRoom}`), (positionObj) => {
    // make sure p5 objects are setup first
    if (player1 === undefined || player2 === undefined) {
      return;
    }
    // update ball position if not in your side, and wasn't reported by you
    if (serverGameObject.inProgress === true &&
      (
        ((currentPlayerStatus() === 1 || currentPlayerStatus() === 0) &&
          positionObj.ball.pos.x > canvasWidth / 2 &&
          positionObj.player.playerNum === 2
        ) ||
        ((currentPlayerStatus() === 2 || currentPlayerStatus() === 0) &&
          positionObj.ball.pos.x < canvasWidth / 2 &&
          positionObj.player.playerNum === 1
        )
      )
    ) {
      // if dist is greater than 2 update for players, dist greather than 4 for spectators
      if (
        (int(dist(
          positionObj.ball.pos.x,
          positionObj.ball.pos.y,
          ball.body.position.x,
          ball.body.position.y,
        )) > 2)
        &&
        ballUpdateTime < positionObj.ts) {
        Matter.Body.setPosition(
          ball.body,
          { x: positionObj.ball.pos.x, y: positionObj.ball.pos.y },
        );
        Matter.Body.setVelocity(ball.body, positionObj.ball.vel);
        ballUpdateTime = positionObj.ts;
      }
    }
    // update player position if not you
    if (serverGameObject.inProgress === true && // update p2 pos
      currentPlayerStatus() !== 2 &&
      positionObj.player.playerNum === 2) {
      Matter.Body.setPosition(
        player2.body,
        { x: positionObj.player.pos.x, y: positionObj.player.pos.y },
      );
      Matter.Body.setVelocity(player2.body, positionObj.player.vel);
      player2.ticksOfUpwardThrust = positionObj.player.upTick;
      player2.hitCount = positionObj.player.hits;
    } else if (serverGameObject.inProgress === true && // update p1 pos
      currentPlayerStatus() !== 1 &&
      positionObj.player.playerNum === 1) {
      Matter.Body.setPosition(
        player1.body,
        { x: positionObj.player.pos.x, y: positionObj.player.pos.y },
      );
      Matter.Body.setVelocity(player1.body, positionObj.player.vel);
      player1.ticksOfUpwardThrust = positionObj.player.upTick;
      player1.hitCount = positionObj.player.hits;
    }
  });
  socket.on((`resetPosition${myRoom}`), (resetPackage) => {
    resetPlayers();
    resetBall(resetPackage.ballVelocity);
    // always update ball after a hard reset from server, and to avoid sync issue,
    // don't let client update ball for another second after this comes through
    ballUpdateTime = resetPackage.ts + 1000;
  });
}
function clearRoomListeners() {
  socket.removeAllListeners(`chat message${myRoom}`);
  socket.removeAllListeners(`gameRefresh${myRoom}`);
  socket.removeAllListeners(`resetPosition${myRoom}`);
}
function setSettingVisibility(targetField, visibility) {
  if (targetField === 'username') {
    document.getElementById('updateUsernameSpan').style.visibility = visibility;
    document.getElementById('usernameInput').value = '';
  } else if (targetField === 'room') {
    document.getElementById('updateRoomSpan').style.visibility = visibility;
    document.getElementById('roomInput').value = '';
  }
}
function updateSettings(targetField) { // eslint-disable-line no-unused-vars
  clearRoomListeners();
  if (targetField === 'username') {
    myName = document.getElementById('usernameInput').value;
  } else if (targetField === 'room') {
    myRoom = document.getElementById('roomInput').value;
  }
  updateDisplaySettings();
  setSettingVisibility(targetField, 'hidden');
  setRoomListeners();
}
setRoomListeners();
// parking lot
// otherweise only update ball position if it is greater than certain dist, and not on your side
// emit client data to server when game in progress
// emit player position
// emit ball posiiton if in your half of court
// if server is not reporting a player1/player2 then clear values
// client only reports a loss
