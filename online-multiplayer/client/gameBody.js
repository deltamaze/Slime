class GameBody {

  constructor(engineWorld, matterBody) {

    Matter.World.add(engineWorld, matterBody);
    this.body = matterBody;
    //default color is white, used by p5
    this.colorRed = 255;
    this.colorGreen = 255;
    this.colorBlue = 255;
  }
  //private
  drawFromVertices() {
    beginShape();
    for (var a = 0; a < this.body.vertices.length; a += 1) {
      vertex(this.body.vertices[a].x, this.body.vertices[a].y);
    }
    endShape(CLOSE);
  }
  //public
  show() {
    fill(this.colorRed, this.colorGreen, this.colorBlue);
    stroke(this.colorRed, this.colorGreen, this.colorBlue);
    push();
    this.drawFromVertices();
    pop();
  }

}