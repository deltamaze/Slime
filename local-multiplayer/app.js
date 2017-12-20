let engine;
let world;
let player;
let boundry;
let canvasHeight = 2000//400;
let canvasWidth = 600;
let groundedPostion = 330
let gameBodies = [];
function setup() {

  let canvas = createCanvas(canvasWidth,canvasHeight );
  canvas.parent('p5-holder');
  engine = Matter.Engine.create();
  world = engine.world;
  Matter.Engine.run(engine);
  
  player1 = new Player(world,50,100,200);
  gameBodies.push(player1);
  boundry = new Boundry(world,300,400,600,100);
  gameBodies.push(boundry);

}

function draw() {

  background(51);
  gameBodies.forEach(function(body) {
    body.show();
  }, this);
}
function keyPressed() {
  console.log(player1.body.position.y);
  
  if (keyCode === 87 && player1.body.position.y >= groundedPostion) { //w key pressed, and y not moving
    console.log(player1);
    Matter.Body.applyForce(player1.body,player1.body.position,{x:0,y:-.1})
  }
  if (keyCode === 83) { //d key
    console.log(player1);
  }
}