/* global Player document Boundry Ball Matter keyIsDown textSize
noStroke background fill text io createCanvas */


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
// function hash(targetString) {
//   let returnHash = 0;
//   let i;
//   let chr;
//   if (targetString.length === 0) return returnHash;
//   for (i = 0; i < targetString.length; i += 1) {
//     chr = targetString.charCodeAt(i);
//     returnHash = ((returnHash << 5) - returnHash) + chr; // eslint-disable-line no-bitwise
//     returnHash |= 0; // eslint-disable-line no-bitwise
//   }
//   return returnHash;
// }


const myGuid = guid();
// const myHash = hash(myGuid);
let myName = 'SlimePlayer';
let myRoom = 'Main';

// show current name/room in html
const socket = io('http://localhost:8080');
function addLiToChatUl(msg) {
  const ul = document.getElementById('chatUl');// .prepend(`<li>${msg}</li>`);
  const li = document.createElement('li');
  li.innerHTML = msg;
  ul.prepend(li);
}
function setRoomListeners() {
  socket.on((`chat message${myRoom}`), (msg) => {
    addLiToChatUl(`${msg.playerName}:${msg.message}`);
  });
}
function clearRoomListeners() {
  socket.removeAllListeners(`chat message${myRoom}`);
}
setRoomListeners();


function updateDisplaySettings() {
  document.getElementById('displayUsername').innerHTML = myName;
  document.getElementById('displayRoom').innerHTML = myRoom;
}
function updateSettings() { // eslint-disable-line no-unused-vars
  clearRoomListeners();
  myName = document.getElementById('usernameInput').value;
  myRoom = document.getElementById('roomInput').value;
  // clear text fields
  document.getElementById('usernameInput').value = '';
  document.getElementById('roomInput').value = '';
  updateDisplaySettings();
  setRoomListeners();
}

socket.on('connect', conn => conn);
function pingServer() {
  const pingInfo = {
    gameName: myRoom,
    userGuid: myGuid,
    username: myName,
  };
  socket.emit('pingServer', pingInfo);
}

setInterval(pingServer, 3000);


// function updatePositions() {
//   // check gameobject to see if you are a player and game is in progress
//   // if so, push position
// }

// setInterval(updatePositions, 500);

// socket.on((`updatePositions${myRoom}`), (gameObj) => {
//   // determine if you are currently player 1 or 2, otherwise you are spectator
//   // update ball position and enemy player position.
//   // if ball is in your side of court, don't update position
//   // if ForceResetPosition = 1 then update everything to the server positions
//   // do above when a player scores)
// });

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


// function pushPlayerPosition() {
//   // send up guid,player position,
//   // if ball is on your side of the court, then send up ball position too
// }
// function pushWinCondition() {

// }


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
function resetBall() {
  Matter.Body.setPosition(ball.body, { x: canvasWidth / 2, y: 100 });
  Matter.Body.setVelocity(ball.body, { x: 20 * (Math.random() - 0.5), y: -5 * Math.random() });
  player1.hitCount = 0;
  player2.hitCount = 0;
}
function collision(event) {
  if (event.pairs[0].bodyA.label === 'ball' || event.pairs[0].bodyB.label === 'ball') {
    if (event.pairs[0].bodyA.label === 'player1' || event.pairs[0].bodyB.label === 'player1') {
      if (Date.now() > player1.lastHit + 500) {
        player1.hitCount += 1;
        player1.lastHit = Date.now();
        if (player1.hitCount > 3) {
          player2.score += 1;
          resetBall();
        }
      }
      player2.hitCount = 0;
    }
    if (event.pairs[0].bodyA.label === 'player2' || event.pairs[0].bodyB.label === 'player2') {
      if (Date.now() > player2.lastHit + 500) {
        player2.hitCount += 1;
        player2.lastHit = Date.now();
        if (player2.hitCount > 3) {
          player1.score += 1;
          resetBall();
        }
      }
      player1.hitCount = 0;
    }
  }


  if (event.pairs[0].bodyA.label === 'ball' || event.pairs[0].bodyB.label === 'ball') {
    if (event.pairs[0].bodyA.label === 'p1Floor' || event.pairs[0].bodyB.label === 'p1Floor') {
      player2.score += 1;
      resetBall();
    }
    if (event.pairs[0].bodyA.label === 'p2Floor' || event.pairs[0].bodyB.label === 'p2Floor') {
      player1.score += 1;
      resetBall();
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
  resetBall();
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
  const p1ScoreText = `Score: ${player1.score.toString()}`;
  const p2ScoreText = `Score: ${player2.score.toString()}`;
  const p1HitCountText = `Hits: ${player1.hitCount.toString()}/3`;
  const p2HitCountText = `Hits: ${player2.hitCount.toString()}/3`;
  const p1TextXPos = (canvasWidth / 2) - (canvasWidth / 3);
  const p2TextXPos = (canvasWidth / 2) + (canvasWidth / 6);
  // p1
  textSize(32);
  noStroke();
  fill(0, 100, 255);
  text(p1ScoreText, p1TextXPos, 100); // Text wraps within text box
  textSize(24);
  noStroke();
  fill(0, 100, 255);
  text(p1HitCountText, p1TextXPos, 150); // Text wraps within text box
  // p2
  textSize(32);
  noStroke();
  fill(255, 100, 0);
  text(p2ScoreText, p2TextXPos, 100); // Text wraps within text box
  textSize(24);
  noStroke();
  fill(255, 100, 0);
  text(p2HitCountText, p2TextXPos, 150); // Text wraps within text box
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
    ApplyUpTick(player1);
  }
  if (keyIsDown(68)) { // a
    ApplyVertMovement(player1, 1);
  }
  if (keyIsDown(65)) { // d
    ApplyVertMovement(player1, -1);
  }


  // debug key, S
  if (keyIsDown(83)) { // d
  }
}
