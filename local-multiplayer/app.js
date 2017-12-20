let engine;
let world;
let player;

let gameBodies = [];

let canvasHeight = 400;
let canvasWidth = 600;
let groundedPostion = 329
let vertForce = .05;
let defaultTicksOfUpwardThrust = 8;
let upForcePerTick = .04;
let downForce = .03;
function setup() {

  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('p5-holder');
  engine = Matter.Engine.create();
  world = engine.world;
  world.gravity.scale = .0005
  Matter.Engine.run(engine);

  player1 = new Player(world, 30, 100, 200);
  player2 = new Player(world, 30, 400, 200);
  player2.colorBlue = 0;
  player2.colorRed = 255;
  gameBodies.push(player1);
  gameBodies.push(player2);
  gameBodies.push(new Ball(world, 200,100,10));
  gameBodies.push(new Boundry(world, canvasWidth / 2, canvasHeight, canvasWidth, 100));//floor
  gameBodies.push(new Boundry(world, 0, canvasHeight / 2, 100, canvasHeight));//leftwall
  gameBodies.push(new Boundry(world, canvasWidth, canvasHeight / 2, 100, canvasHeight));//rightwall
  gameBodies.push(new Boundry(world, canvasWidth / 2, canvasHeight, 10, 300));//net


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
  }, this);

  //PLAYER 1 INPUT
  if (keyIsDown(87)) { //w
    ApplyUpTick(player1);
    console.log(world);
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
}
function ApplyUpTick(player) {
  if (player.body.position.y >= groundedPostion) {
    player.ticksOfUpwardThrust = defaultTicksOfUpwardThrust;
  }
}
function ApplyVertMovement(player, direction) {
  Matter.Body.applyForce(player.body, player.body.position, { x: direction * vertForce, y: 0 })
}