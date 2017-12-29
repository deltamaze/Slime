let gameBodies = [];

let canvasHeight = 400;
let canvasWidth = 800;

function setup() {

  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('p5-holder');


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
