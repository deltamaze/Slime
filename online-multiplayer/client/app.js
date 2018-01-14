let gameBodies = [];

let canvasHeight = 400;
let canvasWidth = 800;

let currentRoom = 'Main';
let currentRole = 0; //0 = spectator, 1 = player 1, 2= player 2
let myGuid = guid();
let myHash = hash(myGuid);
//subscribe to main room player positions from server (let server return, player 1 username, player 2 username, score, positions)
//if there is no player 2, then send guid to server, server will then send up the hash. if 

function setup() {

  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('p5-holder');

}

function joinGame() {
  //send up p1/p2 choice, guid. server will confirm by returning a failure, or returning back your hash. if myHash = serverHash, then we good.
}

function draw() {

  background(51);
  gameBodies.forEach(function (gameBody) {
    gameBody.show();
  }, this);

  //PLAYER INPUT
  if (keyIsDown(87)) { //w
  }
  if (keyIsDown(68)) { //a
  }
  if (keyIsDown(65)) { // d
  }
  //debug key, S
  if (keyIsDown(83)) { // d
    console.log(engine);
  }

}
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
function hash(guid)
{
    var hash = 0, i, chr;
    if (guid.length === 0) return hash;
    for (i = 0; i < guid.length; i++) {
      chr   = guid.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
}