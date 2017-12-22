let engine;
let world;
let player;
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

  player1 = new Player(world, 40, 150, 200);
  player2 = new Player(world, 40, canvasWidth-150, 200);
  player2.colorBlue = 0;
  player2.colorRed = 255;
  ball=new Ball(world, canvasWidth/2,100,10);
  resetBall();
  gameBodies.push(player1);
  gameBodies.push(player2);
  gameBodies.push(ball);
  gameBodies.push(new Boundry(world, canvasWidth / 2, canvasHeight, canvasWidth, 100));//floor
  gameBodies.push(new Boundry(world, 0, canvasHeight / 2, 100, canvasHeight));//leftwall
  gameBodies.push(new Boundry(world, canvasWidth, canvasHeight / 2, 100, canvasHeight));//rightwall
  gameBodies.push(new Boundry(world, canvasWidth / 2, canvasHeight, 15, 230));//net
  gameBodies.push(new Boundry(world, canvasWidth / 2, 285, 0,7.5,3));//net triangle
  gameBodies.push(new Boundry(world, canvasWidth / 2, 0, canvasWidth, 100));//ciel


}

function draw() {

  background(51);
  gameBodies.forEach(function (gameBody) {
    gameBody.show();
    //apply upforce to players
    if (gameBody.body.label === 'player' && gameBody.ticksOfUpwardThrust > 0) {
      Matter.Body.applyForce(gameBody.body, gameBody.body.position, { x: 0, y: -upForcePerTick })
      gameBody.ticksOfUpwardThrust--;
    }
    //apply downforce to player
    if (gameBody.body.label === 'player' && gameBody.body.velocity.y > 0) {
      //create additional downward trust when not moving upward
      Matter.Body.applyForce(gameBody.body, gameBody.body.position, { x: 0, y: downForce })
    }
    //if ball on ground, reset position
    //apply downforce to player
    if (gameBody.body.label === 'ball' && gameBody.body.position.y >= ballGroundedYPos) {
      resetBall();
    }
  }, this);

  //PLAYER 1 INPUT
  if (keyIsDown(87)) { //w
    ApplyUpTick(player1);
  }
  if (keyIsDown(68)) { //a
    ApplyVertMovement(player1, 1);
  }
  if (keyIsDown(65)) { // d
    ApplyVertMovement(player1, -1);
  }
  //PLAYER 2 INPUT
  if (keyIsDown(UP_ARROW)) { //up
    ApplyUpTick(player2);
  }
  if (keyIsDown(RIGHT_ARROW)) { //right
    ApplyVertMovement(player2, 1);
  }
  if (keyIsDown(LEFT_ARROW)) { //left
    ApplyVertMovement(player2, -1);
  }
  if(frameCount%120 ===0)
  {
    //Matter.Body.setPosition(ball.body, { x: 200, y: 100 })
  }
  //debug key, S
  if (keyIsDown(83)) { // d
    console.log(engine);
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
}