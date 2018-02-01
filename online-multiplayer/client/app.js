
let currentRoom = 'Main';
let currentRole = 0; //0 = spectator, 1 = player 1, 2= player 2
let myGuid = guid();
let myHash = hash(myGuid);
console.log(myGuid);
console.log(myHash);
//subscribe to main room player positions from server (let server return, player 1 username, player 2 username, score, positions)
//if player.count > 2, then send guid to server, server will then send up the hash. if 


function joinGame() {
  //send up join game with a guid. server will confirm by returning a failure, or returning back your hash. if myHash = serverHash, then we good.
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
function pushPlayerPosition()
{
  //send up guid,player position, if ball is on your side of the court, then send up ball position too
  //also include timestamp, server can use timestamp to detect disconnect
}
function pushBallPosition()
{
  //send up guid,ball position, if ball is on your side of the court, then send up ball position too
}
function pushWinCondition()
{
 
}
function pullPlayerPosition()
{
  //update ball position and enemy player position.
  //if ball is in your side of court, don't update position
  //if ForceResetPosition = 1 then update everything to the server positions (happens when a player scores)
}




let engine;
let world;
let player1;
let player2;
let ball;
let gameBodies = [];

let canvasHeight = 400;
let canvasWidth = 800;
let playerGroundedYPos = 329
let ballGroundedYPos = 339
let vertForce = .05;
let defaultTicksOfUpwardThrust = 10;
let upForcePerTick = .05;
let downForce = .03;
function setup() {

  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('p5-holder');
  engine = Matter.Engine.create();
  engine.timing.timeScale = .8;
  world = engine.world;
  world.gravity.scale = .0005
  Matter.Engine.run(engine);

  player1 = new Player(world, 40, 150, 200,1);
  player2 = new Player(world, 40, canvasWidth-150, 200,2);
  player2.colorBlue = 0;
  player2.colorRed = 255;
  p1Floor=new Boundry(world, canvasWidth / 4, canvasHeight, canvasWidth/2, 100,0, 'p1Floor')
  p2Floor=new Boundry(world, canvasWidth/4 + canvasWidth/2 , canvasHeight, canvasWidth/2, 100,0,'p2Floor')
  ball=new Ball(world, canvasWidth/2,100,10);
  resetBall();
  gameBodies.push(player1);
  gameBodies.push(player2);
  gameBodies.push(ball);
  gameBodies.push(p1Floor);//p1floor
  gameBodies.push(p2Floor);
  gameBodies.push(new Boundry(world, 0, canvasHeight / 2, 100, canvasHeight));//leftwall
  gameBodies.push(new Boundry(world, canvasWidth, canvasHeight / 2, 100, canvasHeight));//rightwall
  gameBodies.push(new Boundry(world, canvasWidth / 2, canvasHeight, 15, 230));//net
  gameBodies.push(new Boundry(world, canvasWidth / 2, 285, 0,7.5,3));//net triangle
  gameBodies.push(new Boundry(world, canvasWidth / 2, 0, canvasWidth, 100));//ciel

  Matter.Events.on(engine,'collisionStart',collision);
}

function collision(event){
  if(event.pairs[0].bodyA.label === "ball" || event.pairs[0].bodyB.label === "ball")
  {
    if(event.pairs[0].bodyA.label === "player1" || event.pairs[0].bodyB.label === "player1"){
      if(Date.now() > player1.lastHit+500)
      {
        player1.hitCount++;
        player1.lastHit = Date.now();
        if (player1.hitCount>3)
        {
          player2.score++;
          resetBall();
        }
      }
      player2.hitCount =0;
    }
    if(event.pairs[0].bodyA.label === "player2" || event.pairs[0].bodyB.label === "player2"){
      if(Date.now() > player2.lastHit+500)
      {
        player2.hitCount++;
        player2.lastHit = Date.now();
        if (player2.hitCount>3)
        {
          player1.score++;
          resetBall();
        }
      }
      player1.hitCount =0;
    }
  }


  if(event.pairs[0].bodyA.label === "ball" || event.pairs[0].bodyB.label === "ball")
  {
    if(event.pairs[0].bodyA.label === "p1Floor" || event.pairs[0].bodyB.label === "p1Floor"){
      player2.score++;
      resetBall();
    }
    if(event.pairs[0].bodyA.label === "p2Floor" || event.pairs[0].bodyB.label === "p2Floor"){
      player1.score++;
      resetBall();
    }
  }


}

function draw() {
 
  background(51);
  displayGameText();
  gameBodies.forEach(function (gameBody) {
    gameBody.show();
    //apply upforce to players
    if (gameBody.body.label.startsWith("player") && gameBody.ticksOfUpwardThrust > 0) {
      Matter.Body.applyForce(gameBody.body, gameBody.body.position, { x: 0, y: -upForcePerTick })
      gameBody.ticksOfUpwardThrust--;
    }
    //apply downforce to player
    if (gameBody.body.label.startsWith("player") && gameBody.body.velocity.y > 0) {
      //create additional downward trust when not moving upward
      Matter.Body.applyForce(gameBody.body, gameBody.body.position, { x: 0, y: downForce })
    }
    //if ball on ground, reset position
    //apply downforce to player
    if (gameBody.body.label === 'ball' && gameBody.body.position.y >= ballGroundedYPos) {
      //resetBall();
    }
  }, this);

  //PLAYER INPUT
  if (keyIsDown(87)) { //w
    ApplyUpTick(player1);
  }
  if (keyIsDown(68)) { //a
    ApplyVertMovement(player1, 1);
  }
  if (keyIsDown(65)) { // d
    ApplyVertMovement(player1, -1);
  }

  if(frameCount%120 ===0)
  {
    //Matter.Body.setPosition(ball.body, { x: 200, y: 100 })
  }
  //debug key, S
  if (keyIsDown(83)) { // d
  }
}
function ApplyUpTick(player) {
  if (player.body.position.y >= playerGroundedYPos) {
    player.ticksOfUpwardThrust = defaultTicksOfUpwardThrust;
  }
}
function ApplyVertMovement(player, direction) {
  Matter.Body.applyForce(player.body, player.body.position, { x: direction * vertForce, y: 0 })
}
function resetBall()
{
  Matter.Body.setPosition(ball.body, { x: canvasWidth/2, y: 100 });
  Matter.Body.setVelocity(ball.body, {x:20*(Math.random()-.5),y:-5*Math.random()})
  player1.hitCount =0;
  player2.hitCount =0;
}
function displayGameText()
{
  let p1ScoreText = 'Score: '+player1.score.toString();
  let p2ScoreText = 'Score: '+player2.score.toString();
  let p1HitCountText = 'Hits: '+player1.hitCount.toString()+'/3';
  let p2HitCountText = 'Hits: '+player2.hitCount.toString()+'/3';
  let p1TextXPos = canvasWidth/2 - canvasWidth/3;
  let p2TextXPos = canvasWidth/2 + canvasWidth/6;
  //p1
  textSize(32);
  noStroke();
  fill(0,100,255);
  text(p1ScoreText, p1TextXPos, 100); // Text wraps within text box
  textSize(24);
  noStroke();
  fill(0,100,255);
  text(p1HitCountText, p1TextXPos, 150); // Text wraps within text box
  //p2
  textSize(32);
  noStroke();
  fill(255,100,0);
  text(p2ScoreText, p2TextXPos, 100); // Text wraps within text box
  textSize(24);
  noStroke();
  fill(255,100,0);
  text(p2HitCountText, p2TextXPos, 150); // Text wraps within text box


}

