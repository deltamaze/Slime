/* global Matter beginShape endShape vertex fill stroke push pop CLOSE */

class GameBody { // eslint-disable-line no-unused-vars
  constructor(engineWorld, matterBody) {
    Matter.World.add(engineWorld, matterBody);
    this.body = matterBody;
    this.colorRed = 255;
    this.colorGreen = 255;
    this.colorBlue = 255;
  }
  // private
  drawFromVertices() {
    beginShape();
    for (let a = 0; a < this.body.vertices.length; a += 1) {
      vertex(this.body.vertices[a].x, this.body.vertices[a].y);
    }
    endShape(CLOSE);
  }
  // public
  show() {
    fill(this.colorRed, this.colorGreen, this.colorBlue);
    stroke(this.colorRed, this.colorGreen, this.colorBlue);
    push();
    this.drawFromVertices();
    pop();
  }
}
